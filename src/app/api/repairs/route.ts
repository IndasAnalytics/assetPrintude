import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";

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
 * GET /api/repairs
 * Get all repairs for the current tenant
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const assetId = searchParams.get("assetId");

    // Build query
    let query = `
      SELECT
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
      WHERE r.tenantId = @tenantId
    `;

    const params: Record<string, any> = { tenantId };

    if (status) {
      query += ` AND r.status = @status`;
      params.status = status;
    }

    if (assetId) {
      query += ` AND r.assetId = @assetId`;
      params.assetId = parseInt(assetId);
    }

    query += ` ORDER BY r.createdAt DESC`;

    const repairs = await executeQuery<Repair>(query, params);

    return NextResponse.json({
      success: true,
      data: repairs,
    });
  } catch (error) {
    console.error("Error fetching repairs:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch repairs" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/repairs
 * Create a new repair request
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
    const {
      assetId,
      vendorId,
      problemDescription,
      referenceNumber,
      estimatedCost,
    } = body;

    // Validate required fields
    if (!assetId || !problemDescription) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: assetId, problemDescription",
        },
        { status: 400 }
      );
    }

    // Create repair
    const repair = await executeQuery<Repair>(
      `INSERT INTO Repairs (
        tenantId, assetId, vendorId, problemDescription, referenceNumber,
        status, reportedBy, estimatedCost
      )
      OUTPUT INSERTED.*
      VALUES (
        @tenantId, @assetId, @vendorId, @problemDescription, @referenceNumber,
        'OPEN', @reportedBy, @estimatedCost
      )`,
      {
        tenantId,
        assetId,
        vendorId: vendorId || null,
        problemDescription,
        referenceNumber: referenceNumber || null,
        reportedBy: userId,
        estimatedCost: estimatedCost || null,
      }
    );

    // Log activity
    await executeQuery(
      `INSERT INTO ActivityLogs (tenantId, userId, action, entityType, entityId, description)
       VALUES (@tenantId, @userId, 'CREATE', 'REPAIR', @entityId, @description)`,
      {
        tenantId,
        userId,
        entityId: repair[0].id.toString(),
        description: `Created repair request for asset ID: ${assetId}`,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Repair request created successfully",
      data: repair[0],
    });
  } catch (error) {
    console.error("Error creating repair:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create repair request" },
      { status: 500 }
    );
  }
}
