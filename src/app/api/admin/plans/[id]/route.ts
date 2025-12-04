import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeQuerySingle } from "@/lib/database";
import { z } from "zod";

interface Plan {
  id: number;
  name: string;
  description: string | null;
  monthlyPrice: number;
  annualPrice: number | null;
  maxAssets: number | null;
  maxUsers: number | null;
  features: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const planSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  description: z.string().optional().nullable(),
  monthlyPrice: z.number().min(0, "Monthly price must be at least 0"),
  annualPrice: z.number().min(0).optional().nullable(),
  maxAssets: z.number().int().min(1).optional().nullable(),
  maxUsers: z.number().int().min(1).optional().nullable(),
  features: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/admin/plans/[id]
 * Get plan details (Super Admin only)
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

    const plan = await executeQuerySingle<Plan>(
      `SELECT * FROM Plans WHERE id = @id`,
      { id }
    );

    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error("Error fetching plan:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch plan" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/plans/[id]
 * Update plan (Super Admin only)
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
    const validation = planSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: validation.error.issues },
        { status: 400 }
      );
    }

    const {
      name,
      description,
      monthlyPrice,
      annualPrice,
      maxAssets,
      maxUsers,
      features,
      isActive,
    } = validation.data;

    const result = await executeQuery<Plan>(
      `UPDATE Plans SET
        name = @name,
        description = @description,
        monthlyPrice = @monthlyPrice,
        annualPrice = @annualPrice,
        maxAssets = @maxAssets,
        maxUsers = @maxUsers,
        features = @features,
        isActive = @isActive,
        updatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE id = @id`,
      {
        id,
        name,
        description,
        monthlyPrice,
        annualPrice,
        maxAssets,
        maxUsers,
        features,
        isActive: isActive !== undefined ? isActive : true,
      }
    );

    const updatedPlan = result[0];

    return NextResponse.json({
      success: true,
      message: "Plan updated successfully",
      data: updatedPlan,
    });
  } catch (error) {
    console.error("Error updating plan:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update plan" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/plans/[id]
 * Delete plan (Super Admin only)
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

    // Check if any tenants are using this plan
    const tenantsUsingPlan = await executeQuery<{ count: number }>(
      `SELECT COUNT(*) as count FROM Tenants WHERE planId = @id`,
      { id }
    );

    if (tenantsUsingPlan[0]?.count > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete plan that is currently in use by tenants. Please deactivate it instead."
        },
        { status: 400 }
      );
    }

    await executeQuery(
      `DELETE FROM Plans WHERE id = @id`,
      { id }
    );

    return NextResponse.json({
      success: true,
      message: "Plan deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting plan:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete plan" },
      { status: 500 }
    );
  }
}
