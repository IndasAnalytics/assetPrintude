import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeQuerySingle } from "@/lib/database";
import type { Asset } from "@/types/asset";

/**
 * POST /api/assets/[id]/return
 * Return an asset from an employee
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = request.headers.get("x-tenant-id");
    const userId = request.headers.get("x-user-id");

    if (!tenantId || !userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notes } = body;

    // Check if asset exists and is assigned
    const asset = await executeQuerySingle<Asset>(
      `SELECT * FROM Assets WHERE id = @id AND tenantId = @tenantId AND isActive = 1`,
      { id, tenantId }
    );

    if (!asset) {
      return NextResponse.json(
        { success: false, message: "Asset not found" },
        { status: 404 }
      );
    }

    if (!asset.assignedToEmployeeId) {
      return NextResponse.json(
        { success: false, message: "Asset is not currently assigned" },
        { status: 400 }
      );
    }

    const previousEmployeeId = asset.assignedToEmployeeId;

    // Update asset
    const updatedAsset = await executeQuery<Asset>(
      `UPDATE Assets SET
        status = 'IN_STOCK',
        assignedToEmployeeId = NULL,
        assignedAt = NULL,
        updatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE id = @id AND tenantId = @tenantId`,
      { id, tenantId }
    );

    // Log to asset history
    await executeQuery(
      `INSERT INTO AssetHistory (assetId, tenantId, action, performedBy, notes)
       VALUES (@assetId, @tenantId, 'RETURNED', @performedBy, @notes)`,
      {
        assetId: id,
        tenantId,
        performedBy: userId,
        notes: notes || `Asset returned from employee ID ${previousEmployeeId}`,
      }
    );

    // Log activity
    await executeQuery(
      `INSERT INTO ActivityLogs (tenantId, userId, action, entityType, entityId, description)
       VALUES (@tenantId, @userId, 'UPDATE', 'ASSET', @entityId, @description)`,
      {
        tenantId,
        userId,
        entityId: id,
        description: `Asset returned from employee ID ${previousEmployeeId}`,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Asset returned successfully",
      data: updatedAsset[0],
    });
  } catch (error) {
    console.error("Error returning asset:", error);
    return NextResponse.json(
      { success: false, message: "Failed to return asset" },
      { status: 500 }
    );
  }
}
