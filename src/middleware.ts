import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, type JWTPayload as JoseJWTPayload } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-change-in-production";

interface CustomJWTPayload extends JoseJWTPayload {
  userId: number;
  email: string;
  role: "SUPER_ADMIN" | "CLIENT_ADMIN" | "CLIENT_USER";
  tenantId: number | null;
}

// Define public routes that don't require authentication
const publicRoutes = ["/", "/features", "/about"];
const authRoutes = ["/auth/client/login", "/auth/client/register", "/auth/admin/login"];
const authApiRoutes = ["/api/auth/client/login", "/api/auth/client/register", "/api/auth/admin/login", "/api/auth/logout"];

async function verifyTokenEdge(token: string): Promise<CustomJWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as CustomJWTPayload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read token from Authorization header (Bearer token)
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  // Allow public routes and auth API routes
  if (publicRoutes.includes(pathname) || authRoutes.includes(pathname) || authApiRoutes.includes(pathname)) {
    // If already authenticated and trying to access auth pages, redirect to dashboard
    if (token && authRoutes.includes(pathname)) {
      const user = await verifyTokenEdge(token);
      if (user) {
        const redirectUrl = user.role === "SUPER_ADMIN" ? "/admin/dashboard" : "/app/dashboard";
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
    }
    return NextResponse.next();
  }

  // Check for authentication token
  if (!token) {
    // For API routes, require Authorization header
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // For page routes, allow through and handle auth client-side
    // (Browser navigation doesn't send Authorization header, token is in localStorage)
    return NextResponse.next();
  }

  // Verify token (only for API routes at this point)
  const user = await verifyTokenEdge(token);

  if (!user) {
    // Invalid token for API routes
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    // For page routes, allow through (auth handled client-side)
    return NextResponse.next();
  }

  // Add user info to headers for API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", user.userId.toString());
  requestHeaders.set("x-user-role", user.role);
  if (user.tenantId) {
    requestHeaders.set("x-user-tenant-id", user.tenantId.toString());
    requestHeaders.set("x-tenant-id", user.tenantId.toString()); // Backward compatibility
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - auth API routes (login/register/logout)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
