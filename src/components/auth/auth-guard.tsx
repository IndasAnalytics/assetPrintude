"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated, getAuthToken } from "@/lib/auth-client";
import { verifyToken, type JWTPayload } from "@/lib/auth-shared";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: "SUPER_ADMIN" | "CLIENT_ADMIN" | "CLIENT_USER";
  allowedRoles?: Array<"SUPER_ADMIN" | "CLIENT_ADMIN" | "CLIENT_USER">;
}

/**
 * Client-side authentication guard
 * Protects routes by checking for valid token in localStorage
 */
export function AuthGuard({ children, requiredRole, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Check if token exists
      if (!isAuthenticated()) {
        // Redirect to appropriate login page
        if (pathname?.startsWith("/admin")) {
          router.push("/auth/admin/login");
        } else {
          router.push("/auth/client/login");
        }
        return;
      }

      // Verify token is valid
      const token = getAuthToken();
      if (!token) {
        router.push("/auth/client/login");
        return;
      }

      // Decode and verify token
      const payload = verifyToken(token);
      if (!payload) {
        // Invalid token, clear and redirect
        localStorage.removeItem("auth-token");
        router.push("/auth/client/login");
        return;
      }

      // Check role-based access
      if (requiredRole && payload.role !== requiredRole) {
        // Redirect based on user's actual role
        if (payload.role === "SUPER_ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/app/dashboard");
        }
        return;
      }

      if (allowedRoles && !allowedRoles.includes(payload.role)) {
        // Redirect based on user's actual role
        if (payload.role === "SUPER_ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/app/dashboard");
        }
        return;
      }

      // Role-based routing
      if (pathname?.startsWith("/admin") && payload.role !== "SUPER_ADMIN") {
        router.push("/app/dashboard");
        return;
      }

      if (pathname?.startsWith("/app") && payload.role === "SUPER_ADMIN") {
        router.push("/admin/dashboard");
        return;
      }

      // All checks passed
      setIsAuthorized(true);
      setIsChecking(false);
    };

    checkAuth();
  }, [pathname, router, requiredRole, allowedRoles]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show children only if authorized
  return isAuthorized ? <>{children}</> : null;
}
