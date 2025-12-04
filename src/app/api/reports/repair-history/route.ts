import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";

interface RepairHistory {
  id: number;
  assetName: string;
  assetCode: string;
  description: string;
  status: string;
  cost: number | null;
  reportedDate: Date;
  completedDate: Date | null;
  assignedTo: string | null;
}

/**
 * GET /api/reports/repair-history
 * Generate repair history report
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

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query = `
      SELECT
        r.id,
        a.name as assetName,
        a.assetCode,
        r.description,
        r.status,
        r.cost,
        r.reportedDate,
        r.completedDate,
        r.assignedTo
      FROM Repairs r
      INNER JOIN Assets a ON r.assetId = a.id
      WHERE 1=1
    `;

    const params: Record<string, any> = {};

    // Filter by tenant for non-super admins
    if (userRole !== "SUPER_ADMIN" && tenantId) {
      query += ` AND a.tenantId = @tenantId`;
      params.tenantId = tenantId;
    }

    // Filter by date range
    if (startDate) {
      query += ` AND r.reportedDate >= @startDate`;
      params.startDate = startDate;
    }
    if (endDate) {
      query += ` AND r.reportedDate <= @endDate`;
      params.endDate = endDate;
    }

    query += ` ORDER BY r.reportedDate DESC`;

    const repairs = await executeQuery<RepairHistory>(query, params);

    return NextResponse.json({
      success: true,
      data: repairs,
    });
  } catch (error) {
    console.error("Error generating repair history report:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate report", error: String(error) },
      { status: 500 }
    );
  }
}
