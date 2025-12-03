import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";

interface PlatformAnalytics {
  date: string;
  newTenants: number;
  newAssets: number;
  newRepairs: number;
  activeUsers: number;
}

/**
 * GET /api/admin/analytics/platform
 * Get platform analytics over time
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
    const days = parseInt(searchParams.get("days") || "30");

    // Get daily statistics
    const analytics = await executeQuery<PlatformAnalytics>(
      `WITH DateRange AS (
        SELECT CAST(DATEADD(DAY, -@days, GETDATE()) AS DATE) as StartDate,
               CAST(GETDATE() AS DATE) as EndDate
      ),
      Dates AS (
        SELECT CAST(DATEADD(DAY, number, StartDate) AS DATE) as date
        FROM master..spt_values
        CROSS JOIN DateRange
        WHERE type = 'P'
          AND DATEADD(DAY, number, StartDate) <= EndDate
      )
      SELECT
        CONVERT(VARCHAR(10), d.date, 120) as date,
        ISNULL(COUNT(DISTINCT t.id), 0) as newTenants,
        ISNULL(COUNT(DISTINCT a.id), 0) as newAssets,
        ISNULL(COUNT(DISTINCT r.id), 0) as newRepairs,
        ISNULL(COUNT(DISTINCT u.id), 0) as activeUsers
      FROM Dates d
      LEFT JOIN Tenants t ON CAST(t.createdAt AS DATE) = d.date
      LEFT JOIN Assets a ON CAST(a.createdAt AS DATE) = d.date
      LEFT JOIN Repairs r ON CAST(r.reportedAt AS DATE) = d.date
      LEFT JOIN Users u ON CAST(u.lastLoginAt AS DATE) = d.date
      GROUP BY d.date
      ORDER BY d.date ASC`,
      { days }
    );

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Error fetching platform analytics:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch platform analytics" },
      { status: 500 }
    );
  }
}
