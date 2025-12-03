import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeQuerySingle } from "@/lib/database";
import { vendorSchema } from "@/lib/validations";
import type { Vendor } from "@/types/asset";

/**
 * GET /api/masters/vendors/[id]
 * Get a single vendor by ID
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

    const vendor = await executeQuerySingle<Vendor>(
      `SELECT * FROM Vendors WHERE id = @id AND tenantId = @tenantId AND isActive = 1`,
      { id, tenantId }
    );

    if (!vendor) {
      return NextResponse.json(
        { success: false, message: "Vendor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    console.error("Error fetching vendor:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch vendor" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/masters/vendors/[id]
 * Update an existing vendor
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
    const validation = vendorSchema.safeParse(body);

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

    const { name, contactPerson, email, phone, address } = validation.data;

    // Check if vendor exists and belongs to tenant
    const existing = await executeQuerySingle<Vendor>(
      `SELECT id FROM Vendors WHERE id = @id AND tenantId = @tenantId AND isActive = 1`,
      { id, tenantId }
    );

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Vendor not found" },
        { status: 404 }
      );
    }

    // Check if new name conflicts with another vendor
    const nameConflict = await executeQuerySingle<Vendor>(
      `SELECT id FROM Vendors WHERE tenantId = @tenantId AND name = @name AND id != @id AND isActive = 1`,
      { tenantId, name, id }
    );

    if (nameConflict) {
      return NextResponse.json(
        { success: false, message: "Vendor with this name already exists" },
        { status: 409 }
      );
    }

    // Check if email conflicts with another vendor (if provided)
    if (email) {
      const emailConflict = await executeQuerySingle<Vendor>(
        `SELECT id FROM Vendors WHERE tenantId = @tenantId AND email = @email AND id != @id AND isActive = 1`,
        { tenantId, email, id }
      );

      if (emailConflict) {
        return NextResponse.json(
          { success: false, message: "Vendor with this email already exists" },
          { status: 409 }
        );
      }
    }

    // Update vendor
    const updatedVendor = await executeQuerySingle<Vendor>(
      `UPDATE Vendors
       SET name = @name,
           contactPerson = @contactPerson,
           email = @email,
           phone = @phone,
           address = @address,
           updatedAt = GETDATE()
       OUTPUT INSERTED.*
       WHERE id = @id AND tenantId = @tenantId`,
      {
        id,
        tenantId,
        name,
        contactPerson: contactPerson || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
      }
    );

    // Log activity
    await executeQuery(
      `INSERT INTO ActivityLogs (tenantId, userId, action, entityType, entityId, description)
       VALUES (@tenantId, @userId, 'UPDATE', 'VENDOR', @entityId, @description)`,
      {
        tenantId,
        userId,
        entityId: id,
        description: `Updated vendor: ${name}`,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Vendor updated successfully",
      data: updatedVendor,
    });
  } catch (error) {
    console.error("Error updating vendor:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update vendor" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/masters/vendors/[id]
 * Soft delete a vendor (set isActive = false)
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

    // Check if vendor exists
    const vendor = await executeQuerySingle<Vendor>(
      `SELECT id, name FROM Vendors WHERE id = @id AND tenantId = @tenantId AND isActive = 1`,
      { id, tenantId }
    );

    if (!vendor) {
      return NextResponse.json(
        { success: false, message: "Vendor not found" },
        { status: 404 }
      );
    }

    // Check if vendor has assets
    const assets = await executeQuery(
      `SELECT id FROM Assets WHERE vendorId = @id AND tenantId = @tenantId AND isActive = 1`,
      { id, tenantId }
    );

    if (assets.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete vendor with assets. Reassign assets first.",
        },
        { status: 400 }
      );
    }

    // Soft delete vendor
    await executeQuery(
      `UPDATE Vendors SET isActive = 0, updatedAt = GETDATE() WHERE id = @id AND tenantId = @tenantId`,
      { id, tenantId }
    );

    // Log activity
    await executeQuery(
      `INSERT INTO ActivityLogs (tenantId, userId, action, entityType, entityId, description)
       VALUES (@tenantId, @userId, 'DELETE', 'VENDOR', @entityId, @description)`,
      {
        tenantId,
        userId,
        entityId: id,
        description: `Deleted vendor: ${vendor.name}`,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Vendor deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting vendor:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete vendor" },
      { status: 500 }
    );
  }
}
