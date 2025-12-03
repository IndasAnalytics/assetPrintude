import { NextRequest, NextResponse } from "next/server";
import { executeQuerySingle } from "@/lib/database";

interface AssetData {
  id: number;
  assetCode: string;
  name: string;
  status: string;
  categoryName: string;
  locationName: string;
  assignedToName: string | null;
}

/**
 * GET /api/qr/resolve?hash=xxx
 * Resolve QR code hash to asset details
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const qrHash = searchParams.get("hash");

    if (!qrHash) {
      return NextResponse.json(
        { success: false, message: "QR hash is required" },
        { status: 400 }
      );
    }

    const asset = await executeQuerySingle<AssetData>(
      `SELECT
        a.id,
        a.assetCode,
        a.name,
        a.status,
        c.name as categoryName,
        l.name as locationName,
        e.fullName as assignedToName
      FROM Assets a
      INNER JOIN Categories c ON a.categoryId = c.id
      INNER JOIN Locations l ON a.locationId = l.id
      LEFT JOIN Employees e ON a.assignedToEmployeeId = e.id
      WHERE a.qrHash = @qrHash AND a.isActive = 1`,
      { qrHash }
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
    console.error("Error resolving QR code:", error);
    return NextResponse.json(
      { success: false, message: "Failed to resolve QR code" },
      { status: 500 }
    );
  }
}
