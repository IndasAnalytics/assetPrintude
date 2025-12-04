import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";

interface UtilizationReport {
  status: string;
  count: number;
  percentage: number;
}

/**
 * GET /api/reports/utilization
 * Generate asset utilization report
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const tenantId = request.headers.get("x-user-tenant-id");
    const userRole = request.headers.get("x-user-role");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    let query = `
      SELECT
        status,
        COUNT(*) as count,
        CAST(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() AS DECIMAL(5,2)) as percentage
      FROM Assets
      WHERE 1=1
    `;

    const params: Record<string, any> = {};

    // Filter by tenant for non-super admins
    if (userRole !== "SUPER_ADMIN" && tenantId) {
      query += ` AND tenantId = @tenantId`;
      params.tenantId = tenantId;
    }

    query += ` GROUP BY status ORDER BY count DESC`;

    const utilization = await executeQuery<UtilizationReport>(query, params);

    return NextResponse.json({
      success: true,
      data: utilization,
    });
  } catch (error) {
    console.error("Error generating utilization report:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate report" },
      { status: 500 }
    );
  }
}
