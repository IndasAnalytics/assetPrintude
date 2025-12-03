import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeQuerySingle } from "@/lib/database";
import { vendorSchema } from "@/lib/validations";
import type { Vendor } from "@/types/asset";

/**
 * GET /api/masters/vendors
 * Get all vendors for the authenticated tenant
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

    const vendors = await executeQuery<Vendor>(
      `SELECT * FROM Vendors
       WHERE tenantId = @tenantId AND isActive = 1
       ORDER BY name ASC`,
      { tenantId }
    );

    return NextResponse.json({
      success: true,
      data: vendors,
      total: vendors.length,
    });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/masters/vendors
 * Create a new vendor
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

    // Check if vendor name already exists for this tenant
    const existing = await executeQuerySingle<Vendor>(
      `SELECT id FROM Vendors WHERE tenantId = @tenantId AND name = @name AND isActive = 1`,
      { tenantId, name }
    );

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Vendor with this name already exists" },
        { status: 409 }
      );
    }

    // Check if email already exists (if provided)
    if (email) {
      const emailExists = await executeQuerySingle<Vendor>(
        `SELECT id FROM Vendors WHERE tenantId = @tenantId AND email = @email AND isActive = 1`,
        { tenantId, email }
      );

      if (emailExists) {
        return NextResponse.json(
          { success: false, message: "Vendor with this email already exists" },
          { status: 409 }
        );
      }
    }

    // Create new vendor
    const newVendor = await executeQuerySingle<Vendor>(
      `INSERT INTO Vendors (tenantId, name, contactPerson, email, phone, address)
       OUTPUT INSERTED.*
       VALUES (@tenantId, @name, @contactPerson, @email, @phone, @address)`,
      {
        tenantId,
        name,
        contactPerson: contactPerson || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
      }
    );

    if (!newVendor) {
      return NextResponse.json(
        { success: false, message: "Failed to create vendor" },
        { status: 500 }
      );
    }

    // Log activity
    await executeQuery(
      `INSERT INTO ActivityLogs (tenantId, userId, action, entityType, entityId, description)
       VALUES (@tenantId, @userId, 'CREATE', 'VENDOR', @entityId, @description)`,
      {
        tenantId,
        userId,
        entityId: newVendor.id.toString(),
        description: `Created vendor: ${name}`,
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Vendor created successfully",
        data: newVendor,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating vendor:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create vendor" },
      { status: 500 }
    );
  }
}
