import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-change-in-production";
const COOKIE_NAME = "auth-token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface JWTPayload {
  userId: number;
  email: string;
  role: "SUPER_ADMIN" | "CLIENT_ADMIN" | "CLIENT_USER";
  tenantId: number | null;
  iat?: number;
  exp?: number;
}

export interface SessionUser {
  id: number;
  email: string;
  fullName: string;
  role: "SUPER_ADMIN" | "CLIENT_ADMIN" | "CLIENT_USER";
  tenantId: number | null;
}

/**
 * Create JWT token
 */
export function createToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

/**
 * Verify JWT token
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
 * Set authentication cookie
 */
export async function setAuthCookie(token: string): Promise<void> {
  console.log("🍪 setAuthCookie - Setting cookie:", COOKIE_NAME);
  console.log("🍪 setAuthCookie - Token length:", token.length);
  console.log("🍪 setAuthCookie - Secure:", process.env.NODE_ENV === "production");
  console.log("🍪 setAuthCookie - MaxAge:", COOKIE_MAX_AGE);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  console.log("🍪 setAuthCookie - Cookie set successfully");
}

/**
 * Get authentication token from cookies
 */
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  console.log("🍪 getAuthToken - Cookie name:", COOKIE_NAME);
  console.log("🍪 getAuthToken - Cookie found:", cookie ? "Yes" : "No");
  if (cookie) {
    console.log("🍪 getAuthToken - Cookie value length:", cookie.value.length);
  }
  return cookie?.value || null;
}

/**
 * Remove authentication cookie
 */
export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Get current authenticated user from cookie
 */
export async function getCurrentUser(): Promise<JWTPayload | null> {
  console.log("👤 getCurrentUser - Starting...");
  const token = await getAuthToken();
  if (!token) {
    console.log("👤 getCurrentUser - No token found");
    return null;
  }

  console.log("👤 getCurrentUser - Token found, verifying...");
  const user = verifyToken(token);
  console.log("👤 getCurrentUser - Verification result:", user ? `User: ${user.email}` : "Invalid token");
  return user;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Check if user is super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "SUPER_ADMIN";
}

/**
 * Check if user has client admin role
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
 * Hash password (simple implementation - replace with bcrypt in production if needed)
 * Note: As per requirements, we're storing raw passwords
 */
export function hashPassword(password: string): string {
  // For now, returning raw password as per requirements
  // In production, you might want to add basic encoding
  return password;
}

/**
 * Verify password
 */
export function verifyPassword(password: string, hashedPassword: string): boolean {
  // Simple comparison for raw password storage
  return password === hashedPassword;
}

/**
 * Generate session ID
 */
export function generateSessionId(): string {
  return crypto.randomUUID();
}
