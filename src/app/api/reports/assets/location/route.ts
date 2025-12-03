import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";

interface LocationReport {
  locationId: number;
  locationName: string;
  count: number;
  totalValue: number;
  inStockCount: number;
  assignedCount: number;
}

/**
 * GET /api/reports/assets/location
 * Get asset distribution by location
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

    const results = await executeQuery<LocationReport>(
      `SELECT
        l.id as locationId,
        l.name as locationName,
        COUNT(a.id) as count,
        ISNULL(SUM(a.currentValue), 0) as totalValue,
        SUM(CASE WHEN a.status = 'IN_STOCK' THEN 1 ELSE 0 END) as inStockCount,
        SUM(CASE WHEN a.status = 'ASSIGNED' THEN 1 ELSE 0 END) as assignedCount
      FROM Locations l
      LEFT JOIN Assets a ON l.id = a.locationId AND a.isActive = 1
      WHERE l.tenantId = @tenantId AND l.isActive = 1
      GROUP BY l.id, l.name
      ORDER BY count DESC`,
      { tenantId }
    );

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching location report:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch location report" },
      { status: 500 }
    );
  }
}
