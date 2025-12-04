import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";
import { z } from "zod";

const toggleActiveSchema = z.object({
  isActive: z.boolean(),
});

/**
 * POST /api/admin/plans/[id]/toggle-active
 * Toggle plan active status (Super Admin only)
 */
export async function POST(
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
    const validation = toggleActiveSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: validation.error.issues },
        { status: 400 }
      );
    }

    const { isActive } = validation.data;

    await executeQuery(
      `UPDATE Plans SET isActive = @isActive, updatedAt = GETDATE() WHERE id = @id`,
      { id, isActive }
    );

    return NextResponse.json({
      success: true,
      message: `Plan ${isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    console.error("Error toggling plan status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update plan status" },
      { status: 500 }
    );
  }
}
