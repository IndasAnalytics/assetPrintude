import { NextRequest, NextResponse } from "next/server";
import { executeQuerySingle } from "@/lib/database";
import { checkSubscriptionStatus } from "@/lib/subscription-check";

interface Tenant {
  subscriptionEndDate: Date | null;
  status: string;
  maxUsers: number;
  maxAssets: number;
  planName: string | null;
}

/**
 * GET /api/subscription/status
 * Get current tenant subscription status
 */
export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get("x-user-tenant-id");
    const userRole = request.headers.get("x-user-role");

    // Super admins don't have subscriptions
    if (userRole === "SUPER_ADMIN") {
      return NextResponse.json({
        success: true,
        data: {
          isExpired: false,
          daysRemaining: null,
          status: "ACTIVE",
          subscriptionEndDate: null,
          isSuperAdmin: true,
        },
      });
    }

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Tenant ID not found" },
        { status: 400 }
      );
    }

    const tenant = await executeQuerySingle<Tenant>(
      `SELECT
        t.subscriptionEndDate,
        t.status,
        t.maxUsers,
        t.maxAssets,
        p.name as planName
      FROM Tenants t
      LEFT JOIN Plans p ON t.planId = p.id
      WHERE t.id = @tenantId`,
      { tenantId }
    );

    if (!tenant) {
      return NextResponse.json(
        { success: false, message: "Tenant not found" },
        { status: 404 }
      );
    }

    const subscriptionStatus = checkSubscriptionStatus(
      tenant.subscriptionEndDate,
      tenant.status
    );

    return NextResponse.json({
      success: true,
      data: {
        ...subscriptionStatus,
        status: tenant.status,
        subscriptionEndDate: tenant.subscriptionEndDate,
        maxUsers: tenant.maxUsers,
        maxAssets: tenant.maxAssets,
        planName: tenant.planName,
      },
    });
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch subscription status" },
      { status: 500 }
    );
  }
}
