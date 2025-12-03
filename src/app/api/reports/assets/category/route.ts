import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";

interface CategoryReport {
  categoryId: number;
  categoryName: string;
  count: number;
  totalValue: number;
  averageValue: number;
}

/**
 * GET /api/reports/assets/category
 * Get asset distribution by category
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

    const results = await executeQuery<CategoryReport>(
      `SELECT
        c.id as categoryId,
        c.name as categoryName,
        COUNT(a.id) as count,
        ISNULL(SUM(a.currentValue), 0) as totalValue,
        ISNULL(AVG(a.currentValue), 0) as averageValue
      FROM Categories c
      LEFT JOIN Assets a ON c.id = a.categoryId AND a.isActive = 1
      WHERE c.tenantId = @tenantId AND c.isActive = 1
      GROUP BY c.id, c.name
      ORDER BY count DESC`,
      { tenantId }
    );

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching category report:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch category report" },
      { status: 500 }
    );
  }
}
