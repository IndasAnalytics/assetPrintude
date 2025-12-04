import { NextRequest, NextResponse } from "next/server";
import { executeQuerySingle } from "@/lib/database";
import { checkSubscriptionStatus } from "@/lib/subscription-check";

interface Tenant {
  subscriptionEndDate: Date | null;
  subscriptionStartDate: Date | null;
  status: string;
  maxUsers: number;
  maxAssets: number;
  planId: number | null;
}

interface Plan {
  name: string;
  features: string | null;
}

interface AssetCount {
  count: number;
}

interface UserCount {
  count: number;
}

/**
 * GET /api/subscription/details
 * Get detailed subscription information for current tenant
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
          planName: "Super Admin",
          status: "ACTIVE",
          maxUsers: 999999,
          maxAssets: 999999,
          subscriptionStartDate: null,
          subscriptionEndDate: null,
          isExpired: false,
          daysRemaining: null,
          currentAssets: 0,
          currentUsers: 0,
          features: ["Unlimited access", "All features enabled"],
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

    // Get tenant subscription info
    const tenant = await executeQuerySingle<Tenant>(
      `SELECT
        t.subscriptionStartDate,
        t.subscriptionEndDate,
        t.status,
        t.maxUsers,
        t.maxAssets,
        t.planId
      FROM Tenants t
      WHERE t.id = @tenantId`,
      { tenantId }
    );

    if (!tenant) {
      return NextResponse.json(
        { success: false, message: "Tenant not found" },
        { status: 404 }
      );
    }

    // Get plan details if planId exists
    let planName = "No Plan";
    let features: string[] = [];

    if (tenant.planId) {
      const plan = await executeQuerySingle<Plan>(
        `SELECT name, features FROM Plans WHERE id = @planId`,
        { planId: tenant.planId }
      );

      if (plan) {
        planName = plan.name;
        if (plan.features) {
          try {
            const parsedFeatures = JSON.parse(plan.features);
            if (Array.isArray(parsedFeatures)) {
              features = parsedFeatures;
            }
          } catch (error) {
            console.error("Error parsing features:", error);
          }
        }
      }
    }

    // Get current asset count
    const assetCount = await executeQuerySingle<AssetCount>(
      `SELECT COUNT(*) as count FROM Assets WHERE tenantId = @tenantId`,
      { tenantId }
    );

    // Get current user count
    const userCount = await executeQuerySingle<UserCount>(
      `SELECT COUNT(*) as count FROM Users WHERE tenantId = @tenantId`,
      { tenantId }
    );

    // Check subscription status
    const subscriptionStatus = checkSubscriptionStatus(
      tenant.subscriptionEndDate,
      tenant.status
    );

    return NextResponse.json({
      success: true,
      data: {
        planName,
        status: tenant.status,
        maxUsers: tenant.maxUsers,
        maxAssets: tenant.maxAssets,
        subscriptionStartDate: tenant.subscriptionStartDate,
        subscriptionEndDate: tenant.subscriptionEndDate,
        isExpired: subscriptionStatus.isExpired,
        daysRemaining: subscriptionStatus.daysRemaining,
        currentAssets: assetCount?.count || 0,
        currentUsers: userCount?.count || 0,
        features,
      },
    });
  } catch (error) {
    console.error("Error fetching subscription details:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch subscription details" },
      { status: 500 }
    );
  }
}
