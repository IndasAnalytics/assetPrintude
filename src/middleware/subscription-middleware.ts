import { NextRequest, NextResponse } from "next/server";
import { executeQuerySingle } from "@/lib/database";

interface TenantSubscription {
  subscriptionEndDate: Date | null;
  status: string;
}

/**
 * Middleware to check if tenant subscription is valid
 * Blocks write operations if subscription is expired
 */
export async function checkSubscriptionMiddleware(
  request: NextRequest,
  tenantId: number | null
): Promise<NextResponse | null> {
  // Skip check for super admin
  const userRole = request.headers.get("x-user-role");
  if (userRole === "SUPER_ADMIN") {
    return null; // Allow operation
  }

  // Skip check if no tenant ID
  if (!tenantId) {
    return null; // Allow operation
  }

  // Only check for write operations (POST, PUT, DELETE)
  const method = request.method;
  if (method === "GET") {
    return null; // Allow read operations
  }

  try {
    // Check tenant subscription status
    const tenant = await executeQuerySingle<TenantSubscription>(
      `SELECT subscriptionEndDate, status FROM Tenants WHERE id = @tenantId`,
      { tenantId }
    );

    if (!tenant) {
      return NextResponse.json(
        { success: false, message: "Tenant not found" },
        { status: 404 }
      );
    }

    // Check if subscription is expired
    if (tenant.subscriptionEndDate) {
      const now = new Date();
      const endDate = new Date(tenant.subscriptionEndDate);

      if (endDate < now) {
        return NextResponse.json(
          {
            success: false,
            message: "Your subscription has expired. Please contact your administrator to renew your subscription.",
            subscriptionExpired: true
          },
          { status: 403 }
        );
      }
    }

    // Check if tenant is suspended or cancelled
    if (tenant.status === "SUSPENDED" || tenant.status === "CANCELLED") {
      return NextResponse.json(
        {
          success: false,
          message: `Your account is ${tenant.status.toLowerCase()}. Please contact support.`,
          accountInactive: true
        },
        { status: 403 }
      );
    }

    return null; // Allow operation
  } catch (error) {
    console.error("Subscription check error:", error);
    // Allow operation if check fails (fail open to avoid blocking legitimate requests)
    return null;
  }
}

/**
 * Helper to extract tenant ID from JWT token
 */
export function getTenantIdFromRequest(request: NextRequest): number | null {
  const tenantIdHeader = request.headers.get("x-user-tenant-id");
  return tenantIdHeader ? parseInt(tenantIdHeader) : null;
}
