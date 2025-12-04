import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";

interface AssetDepreciation {
  id: number;
  name: string;
  assetCode: string;
  categoryName: string;
  purchaseDate: Date | null;
  purchaseCost: number | null;
  currentValue: number | null;
  depreciationRate: number | null;
}

/**
 * GET /api/reports/asset-depreciation
 * Generate asset depreciation report
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
        a.id,
        a.name,
        a.assetCode,
        c.name as categoryName,
        a.purchaseDate,
        a.purchaseCost,
        a.depreciationRate,
        a.currentValue
      FROM Assets a
      LEFT JOIN Categories c ON a.categoryId = c.id
      WHERE a.purchaseCost IS NOT NULL
    `;

    const params: Record<string, any> = {};

    // Filter by tenant for non-super admins
    if (userRole !== "SUPER_ADMIN" && tenantId) {
      query += ` AND a.tenantId = @tenantId`;
      params.tenantId = tenantId;
    }

    query += ` ORDER BY a.purchaseCost DESC`;

    const assets = await executeQuery<AssetDepreciation>(query, params);

    return NextResponse.json({
      success: true,
      data: assets,
    });
  } catch (error) {
    console.error("Error generating depreciation report:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate report", error: String(error) },
      { status: 500 }
    );
  }
}
