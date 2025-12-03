import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeQuerySingle } from "@/lib/database";
import type { Asset } from "@/types/asset";

/**
 * GET /api/assets/[id]
 * Get a single asset by ID
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

    const asset = await executeQuerySingle<Asset>(
      `SELECT
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
      WHERE a.id = @id AND a.tenantId = @tenantId AND a.isActive = 1`,
      { id, tenantId }
    );

    if (!asset) {
      return NextResponse.json(
        { success: false, message: "Asset not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: asset,
    });
  } catch (error) {
    console.error("Error fetching asset:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch asset" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/assets/[id]
 * Update an asset
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

    // Check if asset exists and belongs to tenant
    const existingAsset = await executeQuerySingle<Asset>(
      `SELECT * FROM Assets WHERE id = @id AND tenantId = @tenantId AND isActive = 1`,
      { id, tenantId }
    );

    if (!existingAsset) {
      return NextResponse.json(
        { success: false, message: "Asset not found" },
        { status: 404 }
      );
    }

    const {
      assetCode,
      name,
      description,
      serialNumber,
      categoryId,
      vendorId,
      locationId,
      binId,
      status,
      assignedToEmployeeId,
      assignedAt,
      purchaseDate,
      purchaseCost,
      currentValue,
      depreciationRate,
      warrantyEndDate,
    } = body;

    // Update asset
    const updatedAsset = await executeQuery<Asset>(
      `UPDATE Assets SET
        assetCode = @assetCode,
        name = @name,
        description = @description,
        serialNumber = @serialNumber,
        categoryId = @categoryId,
        vendorId = @vendorId,
        locationId = @locationId,
        binId = @binId,
        status = @status,
        assignedToEmployeeId = @assignedToEmployeeId,
        assignedAt = @assignedAt,
        purchaseDate = @purchaseDate,
        purchaseCost = @purchaseCost,
        currentValue = @currentValue,
        depreciationRate = @depreciationRate,
        warrantyEndDate = @warrantyEndDate,
        updatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE id = @id AND tenantId = @tenantId`,
      {
        id,
        tenantId,
        assetCode: assetCode || existingAsset.assetCode,
        name: name || existingAsset.name,
        description: description !== undefined ? description : existingAsset.description,
        serialNumber: serialNumber !== undefined ? serialNumber : existingAsset.serialNumber,
        categoryId: categoryId || existingAsset.categoryId,
        vendorId: vendorId !== undefined ? vendorId : existingAsset.vendorId,
        locationId: locationId || existingAsset.locationId,
        binId: binId !== undefined ? binId : existingAsset.binId,
        status: status || existingAsset.status,
        assignedToEmployeeId: assignedToEmployeeId !== undefined ? assignedToEmployeeId : existingAsset.assignedToEmployeeId,
        assignedAt: assignedAt ? new Date(assignedAt) : existingAsset.assignedAt,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : existingAsset.purchaseDate,
        purchaseCost: purchaseCost !== undefined ? purchaseCost : existingAsset.purchaseCost,
        currentValue: currentValue !== undefined ? currentValue : existingAsset.currentValue,
        depreciationRate: depreciationRate !== undefined ? depreciationRate : existingAsset.depreciationRate,
        warrantyEndDate: warrantyEndDate ? new Date(warrantyEndDate) : existingAsset.warrantyEndDate,
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
        description: `Updated asset: ${name || existingAsset.name}`,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Asset updated successfully",
      data: updatedAsset[0],
    });
  } catch (error) {
    console.error("Error updating asset:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update asset" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/assets/[id]
 * Soft delete an asset
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

    // Check if asset exists and belongs to tenant
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

    // Soft delete asset
    await executeQuery(
      `UPDATE Assets SET isActive = 0, updatedAt = GETDATE() WHERE id = @id AND tenantId = @tenantId`,
      { id, tenantId }
    );

    // Log activity
    await executeQuery(
      `INSERT INTO ActivityLogs (tenantId, userId, action, entityType, entityId, description)
       VALUES (@tenantId, @userId, 'DELETE', 'ASSET', @entityId, @description)`,
      {
        tenantId,
        userId,
        entityId: id,
        description: `Deleted asset: ${asset.name}`,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Asset deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting asset:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete asset" },
      { status: 500 }
    );
  }
}
