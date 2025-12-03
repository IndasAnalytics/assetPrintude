import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";

interface StatusReport {
  status: string;
  count: number;
  totalValue: number;
  percentage: number;
}

/**
 * GET /api/reports/assets/status
 * Get asset status distribution report
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

    const results = await executeQuery<StatusReport>(
      `SELECT
        status,
        COUNT(*) as count,
        ISNULL(SUM(currentValue), 0) as totalValue,
        CAST(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Assets WHERE tenantId = @tenantId AND isActive = 1) AS DECIMAL(5,2)) as percentage
      FROM Assets
      WHERE tenantId = @tenantId AND isActive = 1
      GROUP BY status
      ORDER BY count DESC`,
      { tenantId }
    );

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching asset status report:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch asset status report" },
      { status: 500 }
    );
  }
}
