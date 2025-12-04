import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";
import { z } from "zod";

const toggleSchema = z.object({
  isActive: z.boolean(),
});

/**
 * POST /api/admin/users/[id]/toggle-active
 * Activate or deactivate a user (Super Admin only)
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
    const validation = toggleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: validation.error.issues },
        { status: 400 }
      );
    }

    const { isActive } = validation.data;

    await executeQuery(
      `UPDATE Users SET isActive = @isActive, updatedAt = GETDATE() WHERE id = @id`,
      { id, isActive }
    );

    return NextResponse.json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user status" },
      { status: 500 }
    );
  }
}
