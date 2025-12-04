import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeQuerySingle } from "@/lib/database";
import { z } from "zod";

interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  tenantId: number | null;
  companyName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = z.object({
  email: z.string().email("Valid email is required"),
  fullName: z.string().min(1, "Full name is required"),
  role: z.enum(["SUPER_ADMIN", "CLIENT_ADMIN", "CLIENT_USER"]),
  isActive: z.boolean().optional(),
  tenantId: z.number().optional().nullable(),
});

/**
 * GET /api/admin/users/[id]
 * Get user details (Super Admin only)
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

    const user = await executeQuerySingle<User>(
      `SELECT
        u.*,
        t.companyName
      FROM Users u
      LEFT JOIN Tenants t ON u.tenantId = t.id
      WHERE u.id = @id`,
      { id }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users/[id]
 * Update user (Super Admin only)
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
    const validation = userSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, fullName, role, isActive, tenantId } = validation.data;

    const result = await executeQuery<User>(
      `UPDATE Users SET
        email = @email,
        fullName = @fullName,
        role = @role,
        isActive = @isActive,
        tenantId = @tenantId,
        updatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE id = @id`,
      {
        id,
        email,
        fullName,
        role,
        isActive: isActive !== undefined ? isActive : true,
        tenantId: tenantId || null,
      }
    );

    const updatedUser = result[0];

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete user (Super Admin only)
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

    // Soft delete by setting isActive to false
    await executeQuery(
      `UPDATE Users SET isActive = 0, updatedAt = GETDATE() WHERE id = @id`,
      { id }
    );

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete user" },
      { status: 500 }
    );
  }
}
