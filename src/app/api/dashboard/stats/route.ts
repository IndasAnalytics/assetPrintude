import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeQuerySingle } from "@/lib/database";

interface DashboardStats {
  totalAssets: number;
  inStock: number;
  issued: number;
  underRepair: number;
  disposed: number;
  warrantyExpiring: number;
  openRepairs: number;
  totalValue: number;
}

interface RecentAsset {
  id: number;
  assetCode: string;
  name: string;
  category: string;
  status: string;
  createdAt: Date;
}

interface RecentRepair {
  id: number;
  assetName: string;
  problemDescription: string;
  status: string;
  daysAgo: number;
}

interface SubscriptionInfo {
  planName: string;
  status: string;
  daysUntilExpiry: number;
  renewalDate: string | null;
}

/**
 * GET /api/dashboard/stats
 * Get client dashboard statistics and recent activity
 */
export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get("x-tenant-id");

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get asset statistics
    const stats = await executeQuerySingle<DashboardStats>(
      `SELECT
        COUNT(*) as totalAssets,
        SUM(CASE WHEN status = 'IN_STOCK' THEN 1 ELSE 0 END) as inStock,
        SUM(CASE WHEN status = 'ASSIGNED' THEN 1 ELSE 0 END) as issued,
        SUM(CASE WHEN status = 'IN_REPAIR' THEN 1 ELSE 0 END) as underRepair,
        SUM(CASE WHEN status = 'DISPOSED' THEN 1 ELSE 0 END) as disposed,
        SUM(CASE
          WHEN warrantyEndDate IS NOT NULL
            AND warrantyEndDate > GETDATE()
            AND warrantyEndDate <= DATEADD(DAY, 90, GETDATE())
          THEN 1
          ELSE 0
        END) as warrantyExpiring,
        ISNULL(SUM(currentValue), 0) as totalValue
      FROM Assets
      WHERE tenantId = @tenantId AND isActive = 1`,
      { tenantId }
    );

    // Get open repairs count
    const repairCount = await executeQuerySingle<{ openRepairs: number }>(
      `SELECT COUNT(*) as openRepairs
       FROM Repairs
       WHERE tenantId = @tenantId AND status IN ('OPEN', 'IN_PROGRESS')`,
      { tenantId }
    );

    // Combine stats
    const dashboardStats = {
      ...stats,
      openRepairs: repairCount?.openRepairs || 0,
    };

    // Get recently added assets
    const recentAssets = await executeQuery<RecentAsset>(
      `SELECT TOP 5
        a.id,
        a.assetCode,
        a.name,
        c.name as category,
        a.status,
        a.createdAt
      FROM Assets a
      INNER JOIN Categories c ON a.categoryId = c.id
      WHERE a.tenantId = @tenantId AND a.isActive = 1
      ORDER BY a.createdAt DESC`,
      { tenantId }
    );

    // Get recent repairs
    const recentRepairs = await executeQuery<RecentRepair>(
      `SELECT TOP 5
        r.id,
        a.name as assetName,
        r.problemDescription,
        r.status,
        DATEDIFF(DAY, r.reportedAt, GETDATE()) as daysAgo
      FROM Repairs r
      INNER JOIN Assets a ON r.assetId = a.id
      WHERE r.tenantId = @tenantId AND r.status IN ('OPEN', 'IN_PROGRESS')
      ORDER BY r.reportedAt DESC`,
      { tenantId }
    );

    // Get subscription information
    const subscription = await executeQuerySingle<SubscriptionInfo>(
      `SELECT TOP 1
        p.name as planName,
        t.status,
        DATEDIFF(DAY, GETDATE(), s.endDate) as daysUntilExpiry,
        CONVERT(VARCHAR(10), s.endDate, 120) as renewalDate
      FROM Tenants t
      LEFT JOIN Subscriptions s ON t.id = s.tenantId AND s.status = 'ACTIVE'
      LEFT JOIN Plans p ON s.planId = p.id
      WHERE t.id = @tenantId
      ORDER BY s.endDate DESC`,
      { tenantId }
    );

    return NextResponse.json({
      success: true,
      data: {
        stats: dashboardStats,
        recentAssets,
        recentRepairs,
        subscription,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
