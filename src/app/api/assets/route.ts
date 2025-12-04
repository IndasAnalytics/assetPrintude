import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";
import { checkSubscriptionMiddleware, getTenantIdFromRequest } from "@/middleware/subscription-middleware";
import type { Asset } from "@/types/asset";

/**
 * GET /api/assets
 * Get all assets for the current tenant
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
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");
    const locationId = searchParams.get("locationId");

    // Build query
    let query = `
      SELECT
        a.*,
        c.name as categoryName,
        l.name as locationName,
        b.name as binName,
        v.name as vendorName,
        e.fullName as assignedToName
      FROM Assets a
      LEFT JOIN Categories c ON a.categoryId = c.id
      LEFT JOIN Locations l ON a.locationId = l.id
      LEFT JOIN Bins b ON a.binId = b.id
      LEFT JOIN Vendors v ON a.vendorId = v.id
      LEFT JOIN Employees e ON a.assignedToEmployeeId = e.id
      WHERE a.tenantId = @tenantId AND a.isActive = 1
    `;

    const params: Record<string, any> = { tenantId };

    if (search) {
      query += ` AND (a.name LIKE @search OR a.assetCode LIKE @search OR a.serialNumber LIKE @search)`;
      params.search = `%${search}%`;
    }

    if (status) {
      query += ` AND a.status = @status`;
      params.status = status;
    }

    if (categoryId) {
      query += ` AND a.categoryId = @categoryId`;
      params.categoryId = parseInt(categoryId);
    }

    if (locationId) {
      query += ` AND a.locationId = @locationId`;
      params.locationId = parseInt(locationId);
    }

    query += ` ORDER BY a.createdAt DESC`;

    const assets = await executeQuery<Asset>(query, params);

    return NextResponse.json({
      success: true,
      data: assets,
    });
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch assets" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/assets
 * Create a new asset
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

    // Check subscription status
    const subscriptionCheck = await checkSubscriptionMiddleware(
      request,
      tenantId ? parseInt(tenantId) : null
    );
    if (subscriptionCheck) {
      return subscriptionCheck;
    }

    const body = await request.json();
    const {
      assetCode,
      qrHash,
      name,
      description,
      serialNumber,
      categoryId,
      vendorId,
      locationId,
      binId,
      status,
      purchaseDate,
      purchaseCost,
      currentValue,
      depreciationRate,
      warrantyEndDate,
    } = body;

    // Validate required fields
    if (!assetCode || !qrHash || !name || !categoryId || !locationId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: assetCode, qrHash, name, categoryId, locationId",
        },
        { status: 400 }
      );
    }

    // Create asset
    const asset = await executeQuery<Asset>(
      `INSERT INTO Assets (
        tenantId, assetCode, qrHash, name, description, serialNumber,
        categoryId, vendorId, locationId, binId, status,
        purchaseDate, purchaseCost, currentValue, depreciationRate, warrantyEndDate
      )
      OUTPUT INSERTED.*
      VALUES (
        @tenantId, @assetCode, @qrHash, @name, @description, @serialNumber,
        @categoryId, @vendorId, @locationId, @binId, @status,
        @purchaseDate, @purchaseCost, @currentValue, @depreciationRate, @warrantyEndDate
      )`,
      {
        tenantId,
        assetCode,
        qrHash,
        name,
        description: description || null,
        serialNumber: serialNumber || null,
        categoryId,
        vendorId: vendorId || null,
        locationId,
        binId: binId || null,
        status: status || "IN_STOCK",
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchaseCost: purchaseCost || null,
        currentValue: currentValue || null,
        depreciationRate: depreciationRate || 15,
        warrantyEndDate: warrantyEndDate ? new Date(warrantyEndDate) : null,
      }
    );

    // Log activity
    await executeQuery(
      `INSERT INTO ActivityLogs (tenantId, userId, action, entityType, entityId, description)
       VALUES (@tenantId, @userId, 'CREATE', 'ASSET', @entityId, @description)`,
      {
        tenantId,
        userId,
        entityId: asset[0].id.toString(),
        description: `Created asset: ${name}`,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Asset created successfully",
      data: asset[0],
    });
  } catch (error) {
    console.error("Error creating asset:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create asset" },
      { status: 500 }
    );
  }
}
