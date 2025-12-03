import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeQuerySingle } from "@/lib/database";
import { z } from "zod";

interface Tenant {
  id: number;
  companyName: string;
  subdomain: string | null;
  contactEmail: string;
  contactPhone: string | null;
  address: string | null;
  status: string;
  planId: number | null;
  planName: string | null;
  maxUsers: number;
  maxAssets: number;
  subscriptionStartDate: Date | null;
  subscriptionEndDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const tenantSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  subdomain: z.string().optional().nullable(),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "SUSPENDED", "TRIAL", "CANCELLED"]),
  planId: z.number().optional().nullable(),
  maxUsers: z.number().int().min(1, "Max users must be at least 1"),
  maxAssets: z.number().int().min(1, "Max assets must be at least 1"),
  subscriptionStartDate: z.string().optional().nullable(),
  subscriptionEndDate: z.string().optional().nullable(),
});

/**
 * GET /api/admin/tenants/[id]
 * Get tenant details (Super Admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userRole = request.headers.get("x-user-role");

    if (userRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Super admin access required" },
        { status: 403 }
      );
    }

    const tenant = await executeQuerySingle<Tenant>(
      `SELECT
        t.*,
        p.name as planName
      FROM Tenants t
      LEFT JOIN SubscriptionPlans p ON t.planId = p.id
      WHERE t.id = @id`,
      { id }
    );

    if (!tenant) {
      return NextResponse.json(
        { success: false, message: "Tenant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: tenant,
    });
  } catch (error) {
    console.error("Error fetching tenant:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch tenant" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/tenants/[id]
 * Update tenant (Super Admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userRole = request.headers.get("x-user-role");

    if (userRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Super admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = tenantSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: validation.error.issues },
        { status: 400 }
      );
    }

    const {
      companyName,
      subdomain,
      contactEmail,
      contactPhone,
      address,
      status,
      planId,
      maxUsers,
      maxAssets,
      subscriptionStartDate,
      subscriptionEndDate,
    } = validation.data;

    const result = await executeQuery<Tenant>(
      `UPDATE Tenants SET
        companyName = @companyName,
        subdomain = @subdomain,
        contactEmail = @contactEmail,
        contactPhone = @contactPhone,
        address = @address,
        status = @status,
        planId = @planId,
        maxUsers = @maxUsers,
        maxAssets = @maxAssets,
        subscriptionStartDate = @subscriptionStartDate,
        subscriptionEndDate = @subscriptionEndDate,
        updatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE id = @id`,
      {
        id,
        companyName,
        subdomain,
        contactEmail,
        contactPhone,
        address,
        status,
        planId,
        maxUsers,
        maxAssets,
        subscriptionStartDate,
        subscriptionEndDate,
      }
    );

    const updatedTenant = result[0];

    return NextResponse.json({
      success: true,
      message: "Tenant updated successfully",
      data: updatedTenant,
    });
  } catch (error) {
    console.error("Error updating tenant:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update tenant" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/tenants/[id]
 * Delete tenant (Super Admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userRole = request.headers.get("x-user-role");

    if (userRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Super admin access required" },
        { status: 403 }
      );
    }

    await executeQuery(
      `UPDATE Tenants SET isActive = 0, updatedAt = GETDATE() WHERE id = @id`,
      { id }
    );

    return NextResponse.json({
      success: true,
      message: "Tenant deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting tenant:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete tenant" },
      { status: 500 }
    );
  }
}
