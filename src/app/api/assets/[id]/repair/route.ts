import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";

/**
 * POST /api/assets/[id]/repair
 * Send asset to repair
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
    const { problemDescription, vendorId, estimatedCost, notes } = body;

    if (!problemDescription) {
      return NextResponse.json(
        { success: false, message: "Problem description is required" },
        { status: 400 }
      );
    }

    // Update asset status to IN_REPAIR
    await executeQuery(
      `UPDATE Assets SET status = 'IN_REPAIR', updatedAt = GETDATE()
       WHERE id = @id AND tenantId = @tenantId`,
      { id, tenantId }
    );

    // Create repair record
    const repairResult = await executeQuery(
      `INSERT INTO Repairs (assetId, tenantId, problemDescription, vendorId, estimatedCost, reportedBy, status)
       OUTPUT INSERTED.*
       VALUES (@assetId, @tenantId, @problemDescription, @vendorId, @estimatedCost, @reportedBy, 'OPEN')`,
      {
        assetId: id,
        tenantId,
        problemDescription,
        vendorId: vendorId || null,
        estimatedCost: estimatedCost || null,
        reportedBy: userId,
      }
    );

    // Log to asset history
    await executeQuery(
      `INSERT INTO AssetHistory (assetId, tenantId, action, performedBy, notes)
       VALUES (@assetId, @tenantId, 'SENT_TO_REPAIR', @performedBy, @notes)`,
      {
        assetId: id,
        tenantId,
        performedBy: userId,
        notes: notes || `Asset sent to repair: ${problemDescription}`,
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
        description: `Asset sent to repair`,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Asset sent to repair successfully",
      data: repairResult[0],
    });
  } catch (error) {
    console.error("Error sending asset to repair:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send asset to repair" },
      { status: 500 }
    );
  }
}
