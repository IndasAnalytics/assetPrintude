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
  const token = request.cookies.get("auth-token")?.value;

  // Debug logging for production troubleshooting
  if (process.env.NODE_ENV === "production" && !token) {
    console.log("🔒 Middleware - No token found for path:", pathname);
    console.log("🍪 Middleware - All cookies:", request.cookies.getAll().map(c => c.name).join(", ") || "none");
  }

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
    // For API routes, return 401 instead of redirecting
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    // Redirect to appropriate login page
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/auth/admin/login", request.url));
    }
    return NextResponse.redirect(new URL("/auth/client/login", request.url));
  }

  // Verify token
  const user = await verifyTokenEdge(token);

  // Debug logging for production
  if (process.env.NODE_ENV === "production") {
    if (user) {
      console.log("✅ Middleware - Token verified for user:", user.email, "Path:", pathname);
    } else {
      console.log("❌ Middleware - Token verification failed for path:", pathname);
    }
  }

  if (!user) {
    // For API routes, return 401 instead of redirecting
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    // Invalid token, redirect to login
    if (pathname.startsWith("/admin")) {
      const response = NextResponse.redirect(new URL("/auth/admin/login", request.url));
      response.cookies.delete("auth-token");
      return response;
    }
    const response = NextResponse.redirect(new URL("/auth/client/login", request.url));
    response.cookies.delete("auth-token");
    return response;
  }

  // Role-based access control
  if (pathname.startsWith("/admin")) {
    // Only super admins can access admin routes
    if (user.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/app/dashboard", request.url));
    }
  }

  if (pathname.startsWith("/app")) {
    // Super admins cannot access client workspace (they have their own admin portal)
    if (user.role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  // Add user info to headers for API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", user.userId.toString());
  requestHeaders.set("x-user-role", user.role);
  if (user.tenantId) {
    requestHeaders.set("x-tenant-id", user.tenantId.toString());
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
