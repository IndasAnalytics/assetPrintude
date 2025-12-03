export type UserRole = "SUPER_ADMIN" | "CLIENT_ADMIN" | "CLIENT_USER";

export interface User {
  id: number;
  tenantId: number | null;
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: number;
  userId: number;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  companyName: string;
  fullName: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    email: string;
    fullName: string;
    role: UserRole;
    tenantId: number | null;
  };
  token?: string;
}

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  tenantId: number | null;
}
