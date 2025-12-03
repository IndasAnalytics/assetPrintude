import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";

interface TCOReport {
  assetId: number;
  assetCode: string;
  assetName: string;
  categoryName: string;
  purchaseCost: number;
  currentValue: number;
  depreciation: number;
  totalRepairCost: number;
  totalCostOfOwnership: number;
  repairCount: number;
}

/**
 * GET /api/reports/financial/tco
 * Get Total Cost of Ownership (TCO) for assets
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

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");

    const results = await executeQuery<TCOReport>(
      `SELECT TOP (@limit)
        a.id as assetId,
        a.assetCode,
        a.name as assetName,
        c.name as categoryName,
        ISNULL(a.purchaseCost, 0) as purchaseCost,
        ISNULL(a.currentValue, 0) as currentValue,
        ISNULL(a.purchaseCost, 0) - ISNULL(a.currentValue, 0) as depreciation,
        ISNULL(SUM(r.actualCost), 0) as totalRepairCost,
        ISNULL(a.purchaseCost, 0) + ISNULL(SUM(r.actualCost), 0) as totalCostOfOwnership,
        COUNT(r.id) as repairCount
      FROM Assets a
      INNER JOIN Categories c ON a.categoryId = c.id
      LEFT JOIN Repairs r ON a.id = r.assetId AND r.status = 'COMPLETED'
      WHERE a.tenantId = @tenantId AND a.isActive = 1
      GROUP BY a.id, a.assetCode, a.name, c.name, a.purchaseCost, a.currentValue
      ORDER BY totalCostOfOwnership DESC`,
      { tenantId, limit }
    );

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching TCO report:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch TCO report" },
      { status: 500 }
    );
  }
}
