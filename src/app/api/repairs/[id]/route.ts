import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeQuerySingle } from "@/lib/database";

interface Repair {
  id: number;
  tenantId: number;
  assetId: number;
  vendorId: number | null;
  problemDescription: string;
  referenceNumber: string | null;
  status: string;
  reportedAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  estimatedCost: number | null;
  actualCost: number | null;
  resolutionNotes: string | null;
  reportedBy: number;
  completedBy: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * GET /api/repairs/[id]
 * Get a single repair by ID
 */
export async function GET(
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

    const repair = await executeQuerySingle<Repair>(
      `SELECT
        r.*,
        a.name as assetName,
        a.assetCode,
        v.name as vendorName,
        u1.fullName as reportedByName,
        u2.fullName as completedByName
      FROM Repairs r
      INNER JOIN Assets a ON r.assetId = a.id
      LEFT JOIN Vendors v ON r.vendorId = v.id
      LEFT JOIN Users u1 ON r.reportedBy = u1.id
      LEFT JOIN Users u2 ON r.completedBy = u2.id
      WHERE r.id = @id AND r.tenantId = @tenantId`,
      { id, tenantId }
    );

    if (!repair) {
      return NextResponse.json(
        { success: false, message: "Repair not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: repair,
    });
  } catch (error) {
    console.error("Error fetching repair:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch repair" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/repairs/[id]
 * Update a repair
 */
export async function PUT(
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

    // Check if repair exists and belongs to tenant
    const existingRepair = await executeQuerySingle<Repair>(
      `SELECT * FROM Repairs WHERE id = @id AND tenantId = @tenantId`,
      { id, tenantId }
    );

    if (!existingRepair) {
      return NextResponse.json(
        { success: false, message: "Repair not found" },
        { status: 404 }
      );
    }

    const {
      status,
      vendorId,
      problemDescription,
      referenceNumber,
      startedAt,
      completedAt,
      estimatedCost,
      actualCost,
      resolutionNotes,
    } = body;

    // Update repair
    const updatedRepair = await executeQuery<Repair>(
      `UPDATE Repairs SET
        status = @status,
        vendorId = @vendorId,
        problemDescription = @problemDescription,
        referenceNumber = @referenceNumber,
        startedAt = @startedAt,
        completedAt = @completedAt,
        estimatedCost = @estimatedCost,
        actualCost = @actualCost,
        resolutionNotes = @resolutionNotes,
        completedBy = @completedBy,
        updatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE id = @id AND tenantId = @tenantId`,
      {
        id,
        tenantId,
        status: status || existingRepair.status,
        vendorId: vendorId !== undefined ? vendorId : existingRepair.vendorId,
        problemDescription: problemDescription || existingRepair.problemDescription,
        referenceNumber: referenceNumber !== undefined ? referenceNumber : existingRepair.referenceNumber,
        startedAt: startedAt ? new Date(startedAt) : existingRepair.startedAt,
        completedAt: completedAt ? new Date(completedAt) : existingRepair.completedAt,
        estimatedCost: estimatedCost !== undefined ? estimatedCost : existingRepair.estimatedCost,
        actualCost: actualCost !== undefined ? actualCost : existingRepair.actualCost,
        resolutionNotes: resolutionNotes !== undefined ? resolutionNotes : existingRepair.resolutionNotes,
        completedBy: status === "COMPLETED" ? userId : existingRepair.completedBy,
      }
    );

    // Log activity
    await executeQuery(
      `INSERT INTO ActivityLogs (tenantId, userId, action, entityType, entityId, description)
       VALUES (@tenantId, @userId, 'UPDATE', 'REPAIR', @entityId, @description)`,
      {
        tenantId,
        userId,
        entityId: id,
        description: `Updated repair request #${id}`,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Repair updated successfully",
      data: updatedRepair[0],
    });
  } catch (error) {
    console.error("Error updating repair:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update repair" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/repairs/[id]
 * Delete a repair
 */
export async function DELETE(
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

    // Check if repair exists and belongs to tenant
    const repair = await executeQuerySingle<Repair>(
      `SELECT * FROM Repairs WHERE id = @id AND tenantId = @tenantId`,
      { id, tenantId }
    );

    if (!repair) {
      return NextResponse.json(
        { success: false, message: "Repair not found" },
        { status: 404 }
      );
    }

    // Delete repair
    await executeQuery(
      `DELETE FROM Repairs WHERE id = @id AND tenantId = @tenantId`,
      { id, tenantId }
    );

    // Log activity
    await executeQuery(
      `INSERT INTO ActivityLogs (tenantId, userId, action, entityType, entityId, description)
       VALUES (@tenantId, @userId, 'DELETE', 'REPAIR', @entityId, @description)`,
      {
        tenantId,
        userId,
        entityId: id,
        description: `Deleted repair request #${id}`,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Repair deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting repair:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete repair" },
      { status: 500 }
    );
  }
}
