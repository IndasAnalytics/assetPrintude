import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";

interface AssetHistoryRecord {
  id: number;
  assetId: number;
  action: string;
  performedBy: number;
  performedByName: string;
  previousValues: string | null;
  newValues: string | null;
  notes: string | null;
  createdAt: Date;
}

/**
 * GET /api/assets/[id]/history
 * Get history for an asset
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = request.headers.get("x-tenant-id");

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const history = await executeQuery<AssetHistoryRecord>(
      `SELECT
        ah.*,
        u.fullName as performedByName
      FROM AssetHistory ah
      INNER JOIN Users u ON ah.performedBy = u.id
      WHERE ah.assetId = @assetId AND ah.tenantId = @tenantId
      ORDER BY ah.createdAt DESC`,
      { assetId: id, tenantId }
    );

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Error fetching asset history:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch asset history" },
      { status: 500 }
    );
  }
}
