import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";

interface VendorReport {
  vendorId: number | null;
  vendorName: string;
  repairCount: number;
  totalCost: number;
  averageCost: number;
  completedCount: number;
  pendingCount: number;
}

/**
 * GET /api/reports/repairs/vendor
 * Get repair statistics by vendor
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

    const results = await executeQuery<VendorReport>(
      `SELECT
        v.id as vendorId,
        ISNULL(v.name, 'No Vendor') as vendorName,
        COUNT(r.id) as repairCount,
        ISNULL(SUM(r.actualCost), 0) as totalCost,
        ISNULL(AVG(r.actualCost), 0) as averageCost,
        SUM(CASE WHEN r.status = 'COMPLETED' THEN 1 ELSE 0 END) as completedCount,
        SUM(CASE WHEN r.status IN ('OPEN', 'IN_PROGRESS') THEN 1 ELSE 0 END) as pendingCount
      FROM Repairs r
      LEFT JOIN Vendors v ON r.vendorId = v.id
      WHERE r.tenantId = @tenantId
      GROUP BY v.id, v.name
      ORDER BY repairCount DESC`,
      { tenantId }
    );

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching vendor report:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch vendor report" },
      { status: 500 }
    );
  }
}
