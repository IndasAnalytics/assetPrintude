import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeQuerySingle } from "@/lib/database";
import { locationSchema } from "@/lib/validations";
import type { Location } from "@/types/asset";

/**
 * GET /api/masters/locations
 * Get all locations for the authenticated tenant
 */
export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get("x-tenant-id");

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const locations = await executeQuery<Location>(
      `SELECT * FROM Locations
       WHERE tenantId = @tenantId AND isActive = 1
       ORDER BY name ASC`,
      { tenantId }
    );

    return NextResponse.json({
      success: true,
      data: locations,
      total: locations.length,
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/masters/locations
 * Create a new location
 */
export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const userId = request.headers.get("x-user-id");

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

    // Check if location name already exists for this tenant
    const existing = await executeQuerySingle<Location>(
      `SELECT id FROM Locations WHERE tenantId = @tenantId AND name = @name AND isActive = 1`,
      { tenantId, name }
    );

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Location with this name already exists" },
        { status: 409 }
      );
    }

    // If parentId provided, verify it exists and belongs to same tenant
    if (parentId) {
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

    // Create new location
    const result = await executeQuery<Location>(
      `INSERT INTO Locations (tenantId, name, description, parentId)
       OUTPUT INSERTED.*
       VALUES (@tenantId, @name, @description, @parentId)`,
      {
        tenantId,
        name,
        description: description || null,
        parentId: parentId || null,
      }
    );

    const newLocation = result[0];

    // Log activity
    await executeQuery(
      `INSERT INTO ActivityLogs (tenantId, userId, action, entityType, entityId, description)
       VALUES (@tenantId, @userId, 'CREATE', 'LOCATION', @entityId, @description)`,
      {
        tenantId,
        userId,
        entityId: newLocation.id.toString(),
        description: `Created location: ${name}`,
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Location created successfully",
        data: newLocation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating location:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create location" },
      { status: 500 }
    );
  }
}
