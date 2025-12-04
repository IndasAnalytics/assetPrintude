import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";

interface Asset {
  id: number;
  name: string;
  assetCode: string;
  categoryName: string;
  status: string;
  locationName: string | null;
  assignedTo: string | null;
  employeeEmail: string | null;
  purchaseDate: Date | null;
  purchaseCost: number | null;
  warrantyEndDate: Date | null;
}

/**
 * GET /api/reports/asset-inventory
 * Generate asset inventory report
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
        a.id,
        a.name,
        a.assetCode,
        c.name as categoryName,
        a.status,
        l.name as locationName,
        a.purchaseDate,
        a.purchaseCost,
        a.warrantyEndDate,
        e.fullName as assignedTo,
        e.email as employeeEmail
      FROM Assets a
      LEFT JOIN Categories c ON a.categoryId = c.id
      LEFT JOIN Locations l ON a.locationId = l.id
      LEFT JOIN Employees e ON a.assignedToEmployeeId = e.id
      WHERE 1=1
    `;

    const params: Record<string, any> = {};

    // Filter by tenant for non-super admins
    if (userRole !== "SUPER_ADMIN" && tenantId) {
      query += ` AND a.tenantId = @tenantId`;
      params.tenantId = tenantId;
    }

    // Filter by date range if provided
    if (startDate) {
      query += ` AND a.purchaseDate >= @startDate`;
      params.startDate = startDate;
    }
    if (endDate) {
      query += ` AND a.purchaseDate <= @endDate`;
      params.endDate = endDate;
    }

    query += ` ORDER BY a.createdAt DESC`;

    const assets = await executeQuery<Asset>(query, params);

    return NextResponse.json({
      success: true,
      data: assets,
    });
  } catch (error) {
    console.error("Error generating asset inventory report:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate report", error: String(error) },
      { status: 500 }
    );
  }
}
