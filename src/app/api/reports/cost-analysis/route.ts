import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";

interface CostAnalysis {
  assetName: string;
  assetCode: string;
  categoryName: string;
  purchaseCost: number | null;
  totalRepairCost: number | null;
  totalCost: number | null;
}

/**
 * GET /api/reports/cost-analysis
 * Generate cost analysis report
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
        a.name as assetName,
        a.assetCode,
        c.name as categoryName,
        a.purchaseCost,
        ISNULL(SUM(r.cost), 0) as totalRepairCost,
        ISNULL(a.purchaseCost, 0) + ISNULL(SUM(r.cost), 0) as totalCost
      FROM Assets a
      LEFT JOIN Categories c ON a.categoryId = c.id
      LEFT JOIN Repairs r ON a.id = r.assetId
      WHERE 1=1
    `;

    const params: Record<string, any> = {};

    // Filter by tenant for non-super admins
    if (userRole !== "SUPER_ADMIN" && tenantId) {
      query += ` AND a.tenantId = @tenantId`;
      params.tenantId = tenantId;
    }

    query += `
      GROUP BY a.id, a.name, a.assetCode, c.name, a.purchaseCost
      ORDER BY totalCost DESC
    `;

    const costs = await executeQuery<CostAnalysis>(query, params);

    return NextResponse.json({
      success: true,
      data: costs,
    });
  } catch (error) {
    console.error("Error generating cost analysis report:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate report", error: String(error) },
      { status: 500 }
    );
  }
}
