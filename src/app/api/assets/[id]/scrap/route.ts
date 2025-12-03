import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";

/**
 * POST /api/assets/[id]/scrap
 * Mark asset as scrapped/disposed
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
    const { reason, scrapValue, notes } = body;

    // Update asset status to DISPOSED
    const result = await executeQuery(
      `UPDATE Assets SET
        status = 'DISPOSED',
        currentValue = @scrapValue,
        assignedToEmployeeId = NULL,
        assignedAt = NULL,
        updatedAt = GETDATE()
       OUTPUT INSERTED.*
       WHERE id = @id AND tenantId = @tenantId`,
      { id, tenantId, scrapValue: scrapValue || 0 }
    );

    // Log to asset history
    await executeQuery(
      `INSERT INTO AssetHistory (assetId, tenantId, action, performedBy, notes)
       VALUES (@assetId, @tenantId, 'SCRAPPED', @performedBy, @notes)`,
      {
        assetId: id,
        tenantId,
        performedBy: userId,
        notes: notes || reason || "Asset scrapped/disposed",
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
        description: `Asset scrapped: ${reason || "No reason provided"}`,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Asset scrapped successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("Error scrapping asset:", error);
    return NextResponse.json(
      { success: false, message: "Failed to scrap asset" },
      { status: 500 }
    );
  }
}
