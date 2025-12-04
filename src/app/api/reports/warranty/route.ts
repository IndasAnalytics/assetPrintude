import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";

interface WarrantyReport {
  id: number;
  name: string;
  assetCode: string;
  categoryName: string;
  purchaseDate: Date | null;
  warrantyEndDate: Date | null;
  daysRemaining: number | null;
  isExpired: number;
}

/**
 * GET /api/reports/warranty
 * Generate warranty report
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
        a.warrantyEndDate,
        CASE
          WHEN a.warrantyEndDate IS NOT NULL
          THEN DATEDIFF(DAY, GETDATE(), a.warrantyEndDate)
          ELSE NULL
        END as daysRemaining,
        CASE
          WHEN a.warrantyEndDate IS NOT NULL AND a.warrantyEndDate < GETDATE()
          THEN 1
          ELSE 0
        END as isExpired
      FROM Assets a
      LEFT JOIN Categories c ON a.categoryId = c.id
      WHERE a.warrantyEndDate IS NOT NULL
    `;

    const params: Record<string, any> = {};

    // Filter by tenant for non-super admins
    if (userRole !== "SUPER_ADMIN" && tenantId) {
      query += ` AND a.tenantId = @tenantId`;
      params.tenantId = tenantId;
    }

    query += ` ORDER BY a.warrantyEndDate ASC`;

    const warranties = await executeQuery<WarrantyReport>(query, params);

    return NextResponse.json({
      success: true,
      data: warranties,
    });
  } catch (error) {
    console.error("Error generating warranty report:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate report", error: String(error) },
      { status: 500 }
    );
  }
}
