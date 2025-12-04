import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";

interface Plan {
  id: number;
  name: string;
  description: string | null;
  monthlyPrice: number;
  annualPrice: number | null;
  maxAssets: number | null;
  maxUsers: number | null;
  features: string | null;
}

/**
 * GET /api/plans
 * Get all active subscription plans (available to all authenticated users)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only return active plans
    const plans = await executeQuery<Plan>(
      `SELECT
        id,
        name,
        description,
        monthlyPrice,
        annualPrice,
        maxAssets,
        maxUsers,
        features
      FROM Plans
      WHERE isActive = 1
      ORDER BY monthlyPrice ASC`,
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
