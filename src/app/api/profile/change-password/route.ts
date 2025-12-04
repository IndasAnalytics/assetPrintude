import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeQuerySingle } from "@/lib/database";
import { z } from "zod";
import bcrypt from "bcryptjs";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

interface User {
  id: number;
  passwordHash: string;
}

/**
 * POST /api/profile/change-password
 * Change user password
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = changePasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: validation.error.issues },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;

    // Get current user
    const user = await executeQuerySingle<User>(
      `SELECT id, passwordHash FROM Users WHERE id = @userId`,
      { userId }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await executeQuery(
      `UPDATE Users SET
        passwordHash = @passwordHash,
        updatedAt = GETDATE()
      WHERE id = @userId`,
      { userId, passwordHash: newPasswordHash }
    );

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { success: false, message: "Failed to change password" },
      { status: 500 }
    );
  }
}
