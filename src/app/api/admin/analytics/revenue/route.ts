import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";

interface RevenueAnalytics {
  month: string;
  year: number;
  monthlyRevenue: number;
  annualRevenue: number;
  newSubscriptions: number;
  cancelledSubscriptions: number;
  activeSubscriptions: number;
}

/**
 * GET /api/admin/analytics/revenue
 * Get revenue analytics over time
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

    const searchParams = request.nextUrl.searchParams;
    const months = parseInt(searchParams.get("months") || "12");

    // Get monthly revenue statistics
    const analytics = await executeQuery<RevenueAnalytics>(
      `WITH MonthSeries AS (
        SELECT TOP (@months)
          YEAR(DATEADD(MONTH, -ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) + 1, GETDATE())) as year,
          MONTH(DATEADD(MONTH, -ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) + 1, GETDATE())) as monthNum,
          FORMAT(DATEADD(MONTH, -ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) + 1, GETDATE()), 'MMM') as month
        FROM master..spt_values
        WHERE type = 'P'
      )
      SELECT
        ms.month,
        ms.year,
        ISNULL(SUM(CASE
          WHEN t.status IN ('ACTIVE', 'TRIAL')
          THEN p.monthlyPrice
          ELSE 0
        END), 0) as monthlyRevenue,
        ISNULL(SUM(CASE
          WHEN t.status IN ('ACTIVE', 'TRIAL') AND p.annualPrice IS NOT NULL
          THEN p.annualPrice
          ELSE 0
        END), 0) as annualRevenue,
        ISNULL(SUM(CASE
          WHEN YEAR(t.subscriptionStartDate) = ms.year
            AND MONTH(t.subscriptionStartDate) = ms.monthNum
          THEN 1
          ELSE 0
        END), 0) as newSubscriptions,
        ISNULL(SUM(CASE
          WHEN t.status = 'CANCELLED'
            AND YEAR(t.updatedAt) = ms.year
            AND MONTH(t.updatedAt) = ms.monthNum
          THEN 1
          ELSE 0
        END), 0) as cancelledSubscriptions,
        ISNULL(SUM(CASE
          WHEN t.status IN ('ACTIVE', 'TRIAL')
          THEN 1
          ELSE 0
        END), 0) as activeSubscriptions
      FROM MonthSeries ms
      LEFT JOIN Tenants t ON t.isActive = 1
      LEFT JOIN Plans p ON t.planId = p.id
      GROUP BY ms.month, ms.year, ms.monthNum
      ORDER BY ms.year DESC, ms.monthNum DESC`,
      { months }
    );

    // Calculate totals
    const totals = {
      totalMonthlyRevenue: analytics.reduce((sum, item) => sum + item.monthlyRevenue, 0),
      totalAnnualRevenue: analytics.reduce((sum, item) => sum + item.annualRevenue, 0),
      totalNewSubscriptions: analytics.reduce((sum, item) => sum + item.newSubscriptions, 0),
      totalCancelled: analytics.reduce((sum, item) => sum + item.cancelledSubscriptions, 0),
      currentActive: analytics.length > 0 ? analytics[0].activeSubscriptions : 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        analytics,
        totals,
      },
    });
  } catch (error) {
    console.error("Error fetching revenue analytics:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch revenue analytics" },
      { status: 500 }
    );
  }
}
