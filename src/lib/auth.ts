/**
 * Server-side authentication utilities
 * Uses next/headers - only for server components and API routes
 */

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { type JWTPayload } from "./auth-shared";

// Re-export types
export type { JWTPayload };

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-change-in-production";

/**
 * Create JWT token (server-side)
 */
export function createToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

/**
 * Verify JWT token with cryptographic verification (server-side)
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Hash password (simple implementation)
 */
export function hashPassword(password: string): string {
  return password;
}

/**
 * Verify password
 */
export function verifyPassword(password: string, hashedPassword: string): boolean {
  return password === hashedPassword;
}

const COOKIE_NAME = "auth-token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionUser {
  id: number;
  email: string;
  fullName: string;
  role: "SUPER_ADMIN" | "CLIENT_ADMIN" | "CLIENT_USER";
  tenantId: number | null;
}

/**
 * Set authentication cookie (server-side only)
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

/**
 * Get authentication token from cookies (server-side only)
 */
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  return cookie?.value || null;
}

/**
 * Remove authentication cookie (server-side only)
 */
export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Get current authenticated user from cookie (server-side only)
 */
export async function getCurrentUser(): Promise<JWTPayload | null> {
  const token = await getAuthToken();
  if (!token) {
    return null;
  }

  const user = verifyToken(token);
  return user;
}

/**
 * Check if user is authenticated (server-side only)
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Check if user is super admin (server-side only)
 */
export async function isSuperAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "SUPER_ADMIN";
}

/**
 * Check if user has client admin role (server-side only)
 */
export async function isClientAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "CLIENT_ADMIN";
}

/**
 * Require authentication (throws error if not authenticated)
 */
export async function requireAuth(): Promise<JWTPayload> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

/**
 * Require super admin role (throws error if not super admin)
 */
export async function requireSuperAdmin(): Promise<JWTPayload> {
  const user = await requireAuth();
  if (user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden: Super admin access required");
  }
  return user;
}

/**
 * Require tenant access (throws error if user doesn't belong to tenant)
 */
export async function requireTenantAccess(tenantId: number): Promise<JWTPayload> {
  const user = await requireAuth();

  // Super admins can access any tenant
  if (user.role === "SUPER_ADMIN") {
    return user;
  }

  // Check if user belongs to the tenant
  if (user.tenantId !== tenantId) {
    throw new Error("Forbidden: Access denied to this tenant");
  }

  return user;
}

/**
 * Generate session ID
 */
export function generateSessionId(): string {
  return crypto.randomUUID();
}
