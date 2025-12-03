import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeQuerySingle } from "@/lib/database";
import type { Asset } from "@/types/asset";

/**
 * POST /api/assets/[id]/issue
 * Issue an asset to an employee
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
    const { employeeId, notes } = body;

    if (!employeeId) {
      return NextResponse.json(
        { success: false, message: "Employee ID is required" },
        { status: 400 }
      );
    }

    // Check if asset exists and is available
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

    if (asset.assignedToEmployeeId) {
      return NextResponse.json(
        { success: false, message: "Asset is already assigned to another employee" },
        { status: 400 }
      );
    }

    // Update asset
    const updatedAsset = await executeQuery<Asset>(
      `UPDATE Assets SET
        status = 'ASSIGNED',
        assignedToEmployeeId = @employeeId,
        assignedAt = GETDATE(),
        updatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE id = @id AND tenantId = @tenantId`,
      { id, tenantId, employeeId }
    );

    // Log to asset history
    await executeQuery(
      `INSERT INTO AssetHistory (assetId, tenantId, action, performedBy, notes)
       VALUES (@assetId, @tenantId, 'ISSUED', @performedBy, @notes)`,
      {
        assetId: id,
        tenantId,
        performedBy: userId,
        notes: notes || `Asset issued to employee ID ${employeeId}`,
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
        description: `Issued asset to employee ID ${employeeId}`,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Asset issued successfully",
      data: updatedAsset[0],
    });
  } catch (error) {
    console.error("Error issuing asset:", error);
    return NextResponse.json(
      { success: false, message: "Failed to issue asset" },
      { status: 500 }
    );
  }
}
