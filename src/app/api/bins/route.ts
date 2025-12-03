import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";

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
 * GET /api/bins
 * Get all bins for the current tenant
 */
export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const userId = request.headers.get("x-user-id");

    if (!tenantId || !userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("locationId");

    let query = `
      SELECT
        b.*,
        l.name as locationName
      FROM Bins b
      INNER JOIN Locations l ON b.locationId = l.id
      WHERE b.tenantId = @tenantId AND b.isActive = 1
    `;

    const params: Record<string, any> = { tenantId };

    if (locationId) {
      query += ` AND b.locationId = @locationId`;
      params.locationId = parseInt(locationId);
    }

    query += ` ORDER BY l.name, b.name`;

    const bins = await executeQuery<Bin>(query, params);

    return NextResponse.json({
      success: true,
      data: bins,
    });
  } catch (error) {
    console.error("Error fetching bins:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch bins" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bins
 * Create a new bin
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
    const { locationId, name, capacity, description } = body;

    if (!locationId || !name) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: locationId, name" },
        { status: 400 }
      );
    }

    const bin = await executeQuery<Bin>(
      `INSERT INTO Bins (tenantId, locationId, name, capacity, description)
       OUTPUT INSERTED.*
       VALUES (@tenantId, @locationId, @name, @capacity, @description)`,
      {
        tenantId,
        locationId,
        name,
        capacity: capacity || null,
        description: description || null,
      }
    );

    await executeQuery(
      `INSERT INTO ActivityLogs (tenantId, userId, action, entityType, entityId, description)
       VALUES (@tenantId, @userId, 'CREATE', 'BIN', @entityId, @description)`,
      {
        tenantId,
        userId,
        entityId: bin[0].id.toString(),
        description: `Created bin: ${name}`,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Bin created successfully",
      data: bin[0],
    });
  } catch (error) {
    console.error("Error creating bin:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create bin" },
      { status: 500 }
    );
  }
}
