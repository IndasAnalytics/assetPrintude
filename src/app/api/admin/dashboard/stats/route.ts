import { NextRequest, NextResponse } from "next/server";
import { executeQuerySingle } from "@/lib/database";

interface DashboardStats {
  totalTenants: number;
  activeTenants: number;
  totalAssets: number;
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  totalRevenue: number;
}

/**
 * GET /api/admin/dashboard/stats
 * Get platform statistics for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role");

    if (userRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Super admin access required" },
        { status: 403 }
      );
    }

    // Get total tenants
    const tenantsResult = await executeQuerySingle<{ total: number; active: number }>(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active
      FROM Tenants
      WHERE isActive = 1`,
      {}
    );

    // Get total assets across all tenants
    const assetsResult = await executeQuerySingle<{ total: number }>(
      `SELECT COUNT(*) as total FROM Assets WHERE isActive = 1`,
      {}
    );

    // Get total users
    const usersResult = await executeQuerySingle<{ total: number }>(
      `SELECT COUNT(*) as total FROM Users WHERE isActive = 1`,
      {}
    );

    // Get active subscriptions
    const subscriptionsResult = await executeQuerySingle<{ active: number }>(
      `SELECT COUNT(*) as active FROM Tenants
       WHERE status IN ('ACTIVE', 'TRIAL') AND isActive = 1`,
      {}
    );

    // Calculate monthly revenue (example - sum of all active tenant plans)
    const revenueResult = await executeQuerySingle<{ monthly: number; total: number }>(
      `SELECT
        ISNULL(SUM(CASE WHEN t.status IN ('ACTIVE', 'TRIAL') THEN p.monthlyPrice ELSE 0 END), 0) as monthly,
        ISNULL(SUM(p.monthlyPrice *
          DATEDIFF(MONTH, t.subscriptionStartDate, COALESCE(t.subscriptionEndDate, GETDATE()))), 0) as total
      FROM Tenants t
      LEFT JOIN Plans p ON t.planId = p.id
      WHERE t.isActive = 1`,
      {}
    );

    const stats: DashboardStats = {
      totalTenants: tenantsResult?.total || 0,
      activeTenants: tenantsResult?.active || 0,
      totalAssets: assetsResult?.total || 0,
      totalUsers: usersResult?.total || 0,
      activeSubscriptions: subscriptionsResult?.active || 0,
      monthlyRevenue: revenueResult?.monthly || 0,
      totalRevenue: revenueResult?.total || 0,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
