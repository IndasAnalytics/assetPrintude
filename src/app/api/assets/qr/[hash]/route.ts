import { NextRequest, NextResponse } from "next/server";
import { executeQuerySingle } from "@/lib/database";
import type { Asset } from "@/types/asset";

/**
 * GET /api/assets/qr/[hash]
 * Get asset by QR hash
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  try {
    const { hash } = await params;
    const tenantId = request.headers.get("x-tenant-id");

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const asset = await executeQuerySingle<Asset>(
      `SELECT
        a.*,
        c.name as categoryName,
        l.name as locationName,
        b.name as binName,
        v.name as vendorName,
        e.fullName as assignedToName
      FROM Assets a
      LEFT JOIN Categories c ON a.categoryId = c.id
      LEFT JOIN Locations l ON a.locationId = l.id
      LEFT JOIN Bins b ON a.binId = b.id
      LEFT JOIN Vendors v ON a.vendorId = v.id
      LEFT JOIN Employees e ON a.assignedToEmployeeId = e.id
      WHERE a.qrHash = @hash AND a.tenantId = @tenantId AND a.isActive = 1`,
      { hash, tenantId }
    );

    if (!asset) {
      return NextResponse.json(
        { success: false, message: "Asset not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: asset,
    });
  } catch (error) {
    console.error("Error fetching asset by QR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch asset" },
      { status: 500 }
    );
  }
}
