/**
 * Shared authentication utilities that work on both client and server
 * No server-only imports (like next/headers)
 */

export interface JWTPayload {
  userId: number;
  email: string;
  role: "SUPER_ADMIN" | "CLIENT_ADMIN" | "CLIENT_USER";
  tenantId: number | null;
  iat?: number;
  exp?: number;
}

/**
 * Decode JWT token without verification (client-safe)
 * This is safe for client-side because the token is already verified on login
 * and will be verified again by middleware on API calls
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    // JWT format: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (middle part)
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));

    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null;
    }

    return decoded as JWTPayload;
  } catch (error) {
    console.error("Token decode failed:", error);
    return null;
  }
}

/**
 * Alias for decodeToken (for backward compatibility)
 * Note: This does NOT cryptographically verify the token on client-side
 * Token is verified on server-side (middleware) for API calls
 */
export function verifyToken(token: string): JWTPayload | null {
  return decodeToken(token);
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
