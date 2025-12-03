import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";

interface CostReport {
  month: string;
  year: number;
  repairCount: number;
  totalEstimatedCost: number;
  totalActualCost: number;
  variance: number;
}

/**
 * GET /api/reports/repairs/cost
 * Get repair cost analysis over time
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

    const results = await executeQuery<CostReport>(
      `SELECT
        FORMAT(reportedAt, 'MMM') as month,
        YEAR(reportedAt) as year,
        COUNT(*) as repairCount,
        ISNULL(SUM(estimatedCost), 0) as totalEstimatedCost,
        ISNULL(SUM(actualCost), 0) as totalActualCost,
        ISNULL(SUM(actualCost), 0) - ISNULL(SUM(estimatedCost), 0) as variance
      FROM Repairs
      WHERE tenantId = @tenantId
        AND reportedAt >= DATEADD(MONTH, -12, GETDATE())
      GROUP BY FORMAT(reportedAt, 'MMM'), YEAR(reportedAt), MONTH(reportedAt)
      ORDER BY year DESC, MONTH(reportedAt) DESC`,
      { tenantId }
    );

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching cost report:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch cost report" },
      { status: 500 }
    );
  }
}
