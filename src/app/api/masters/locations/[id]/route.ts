import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeQuerySingle } from "@/lib/database";
import { locationSchema } from "@/lib/validations";
import type { Location } from "@/types/asset";

/**
 * GET /api/masters/locations/[id]
 * Get a single location by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const { id } = await params;

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const location = await executeQuerySingle<Location>(
      `SELECT * FROM Locations WHERE id = @id AND tenantId = @tenantId AND isActive = 1`,
      { id, tenantId }
    );

    if (!location) {
      return NextResponse.json(
        { success: false, message: "Location not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: location,
    });
  } catch (error) {
    console.error("Error fetching location:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch location" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/masters/locations/[id]
 * Update an existing location
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const userId = request.headers.get("x-user-id");
    const { id } = await params;

    if (!tenantId || !userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = locationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input",
          errors: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { name, description, parentId } = validation.data;

    // Check if location exists and belongs to tenant
    const existing = await executeQuerySingle<Location>(
      `SELECT id FROM Locations WHERE id = @id AND tenantId = @tenantId AND isActive = 1`,
      { id, tenantId }
    );

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Location not found" },
        { status: 404 }
      );
    }

    // Check if new name conflicts with another location
    const nameConflict = await executeQuerySingle<Location>(
      `SELECT id FROM Locations WHERE tenantId = @tenantId AND name = @name AND id != @id AND isActive = 1`,
      { tenantId, name, id }
    );

    if (nameConflict) {
      return NextResponse.json(
        { success: false, message: "Location with this name already exists" },
        { status: 409 }
      );
    }

    // If parentId provided, verify it exists and is not self-referencing
    if (parentId) {
      if (parentId === id) {
        return NextResponse.json(
          { success: false, message: "Location cannot be its own parent" },
          { status: 400 }
        );
      }

      const parent = await executeQuerySingle<Location>(
        `SELECT id FROM Locations WHERE id = @parentId AND tenantId = @tenantId AND isActive = 1`,
        { parentId, tenantId }
      );

      if (!parent) {
        return NextResponse.json(
          { success: false, message: "Invalid parent location" },
          { status: 400 }
        );
      }
    }

    // Update location
    const updatedLocation = await executeQuerySingle<Location>(
      `UPDATE Locations
       SET name = @name,
           description = @description,
           parentId = @parentId,
           updatedAt = GETDATE()
       OUTPUT INSERTED.*
       WHERE id = @id AND tenantId = @tenantId`,
      {
        id,
        tenantId,
        name,
        description: description || null,
        parentId: parentId || null,
      }
    );

    // Log activity
    await executeQuery(
      `INSERT INTO ActivityLogs (tenantId, userId, action, entityType, entityId, description)
       VALUES (@tenantId, @userId, 'UPDATE', 'LOCATION', @entityId, @description)`,
      {
        tenantId,
        userId,
        entityId: id,
        description: `Updated location: ${name}`,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Location updated successfully",
      data: updatedLocation,
    });
  } catch (error) {
    console.error("Error updating location:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update location" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/masters/locations/[id]
 * Soft delete a location (set isActive = false)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const userId = request.headers.get("x-user-id");
    const { id } = await params;

    if (!tenantId || !userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if location exists
    const location = await executeQuerySingle<Location>(
      `SELECT id, name FROM Locations WHERE id = @id AND tenantId = @tenantId AND isActive = 1`,
      { id, tenantId }
    );

    if (!location) {
      return NextResponse.json(
        { success: false, message: "Location not found" },
        { status: 404 }
      );
    }

    // Check if location has child locations
    const childLocations = await executeQuery<Location>(
      `SELECT id FROM Locations WHERE parentId = @id AND tenantId = @tenantId AND isActive = 1`,
      { id, tenantId }
    );

    if (childLocations.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete location with child locations. Delete child locations first.",
        },
        { status: 400 }
      );
    }

    // Check if location has bins
    const bins = await executeQuery(
      `SELECT id FROM Bins WHERE locationId = @id AND tenantId = @tenantId AND isActive = 1`,
      { id, tenantId }
    );

    if (bins.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete location with bins. Delete or reassign bins first.",
        },
        { status: 400 }
      );
    }

    // Check if location has assets
    const assets = await executeQuery(
      `SELECT id FROM Assets WHERE locationId = @id AND tenantId = @tenantId AND isActive = 1`,
      { id, tenantId }
    );

    if (assets.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete location with assets. Reassign assets first.",
        },
        { status: 400 }
      );
    }

    // Soft delete location
    await executeQuery(
      `UPDATE Locations SET isActive = 0, updatedAt = GETDATE() WHERE id = @id AND tenantId = @tenantId`,
      { id, tenantId }
    );

    // Log activity
    await executeQuery(
      `INSERT INTO ActivityLogs (tenantId, userId, action, entityType, entityId, description)
       VALUES (@tenantId, @userId, 'DELETE', 'LOCATION', @entityId, @description)`,
      {
        tenantId,
        userId,
        entityId: id,
        description: `Deleted location: ${location.name}`,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Location deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting location:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete location" },
      { status: 500 }
    );
  }
}
