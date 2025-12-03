import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeQuerySingle } from "@/lib/database";

interface Bin {
  id: number;
  tenantId: number;
  locationId: number;
  name: string;
  capacity: number | null;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * GET /api/bins/[id]
 * Get a single bin by ID
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

    const bin = await executeQuerySingle<Bin>(
      `SELECT b.*, l.name as locationName
       FROM Bins b
       INNER JOIN Locations l ON b.locationId = l.id
       WHERE b.id = @id AND b.tenantId = @tenantId AND b.isActive = 1`,
      { id, tenantId }
    );

    if (!bin) {
      return NextResponse.json(
        { success: false, message: "Bin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: bin,
    });
  } catch (error) {
    console.error("Error fetching bin:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch bin" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/bins/[id]
 * Update a bin
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
    const { locationId, name, capacity, description } = body;

    const existingBin = await executeQuerySingle<Bin>(
      `SELECT * FROM Bins WHERE id = @id AND tenantId = @tenantId AND isActive = 1`,
      { id, tenantId }
    );

    if (!existingBin) {
      return NextResponse.json(
        { success: false, message: "Bin not found" },
        { status: 404 }
      );
    }

    const updatedBin = await executeQuery<Bin>(
      `UPDATE Bins SET
        locationId = @locationId,
        name = @name,
        capacity = @capacity,
        description = @description,
        updatedAt = GETDATE()
       OUTPUT INSERTED.*
       WHERE id = @id AND tenantId = @tenantId`,
      {
        id,
        tenantId,
        locationId: locationId || existingBin.locationId,
        name: name || existingBin.name,
        capacity: capacity !== undefined ? capacity : existingBin.capacity,
        description: description !== undefined ? description : existingBin.description,
      }
    );

    await executeQuery(
      `INSERT INTO ActivityLogs (tenantId, userId, action, entityType, entityId, description)
       VALUES (@tenantId, @userId, 'UPDATE', 'BIN', @entityId, @description)`,
      {
        tenantId,
        userId,
        entityId: id,
        description: `Updated bin: ${name || existingBin.name}`,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Bin updated successfully",
      data: updatedBin[0],
    });
  } catch (error) {
    console.error("Error updating bin:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update bin" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/bins/[id]
 * Soft delete a bin
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

    const bin = await executeQuerySingle<Bin>(
      `SELECT * FROM Bins WHERE id = @id AND tenantId = @tenantId AND isActive = 1`,
      { id, tenantId }
    );

    if (!bin) {
      return NextResponse.json(
        { success: false, message: "Bin not found" },
        { status: 404 }
      );
    }

    await executeQuery(
      `UPDATE Bins SET isActive = 0, updatedAt = GETDATE() WHERE id = @id AND tenantId = @tenantId`,
      { id, tenantId }
    );

    await executeQuery(
      `INSERT INTO ActivityLogs (tenantId, userId, action, entityType, entityId, description)
       VALUES (@tenantId, @userId, 'DELETE', 'BIN', @entityId, @description)`,
      {
        tenantId,
        userId,
        entityId: id,
        description: `Deleted bin: ${bin.name}`,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Bin deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting bin:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete bin" },
      { status: 500 }
    );
  }
}
