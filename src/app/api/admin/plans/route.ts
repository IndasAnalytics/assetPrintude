import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";
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
 * GET /api/admin/plans
 * Get all subscription plans (Super Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role");

    if (userRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Super admin access required" },
        { status: 403 }
      );
    }

    const plans = await executeQuery<Plan>(
      `SELECT * FROM Plans ORDER BY monthlyPrice ASC`,
      {}
    );

    return NextResponse.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/plans
 * Create new plan (Super Admin only)
 */
export async function POST(request: NextRequest) {
  try {
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
      `INSERT INTO Plans (name, description, monthlyPrice, annualPrice, maxAssets, maxUsers, features, isActive)
       OUTPUT INSERTED.*
       VALUES (@name, @description, @monthlyPrice, @annualPrice, @maxAssets, @maxUsers, @features, @isActive)`,
      {
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

    const newPlan = result[0];

    return NextResponse.json({
      success: true,
      message: "Plan created successfully",
      data: newPlan,
    });
  } catch (error) {
    console.error("Error creating plan:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create plan" },
      { status: 500 }
    );
  }
}
