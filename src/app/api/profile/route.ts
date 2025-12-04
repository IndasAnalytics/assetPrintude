import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeQuerySingle } from "@/lib/database";
import { z } from "zod";

interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  tenantId: number | null;
  companyName: string | null;
}

const updateProfileSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
});

/**
 * GET /api/profile
 * Get current user profile
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

    const user = await executeQuerySingle<User>(
      `SELECT
        u.id,
        u.email,
        u.fullName,
        u.role,
        u.tenantId,
        t.companyName
      FROM Users u
      LEFT JOIN Tenants t ON u.tenantId = t.id
      WHERE u.id = @userId`,
      { userId }
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
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile
 * Update current user profile
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: validation.error.issues },
        { status: 400 }
      );
    }

    const { fullName } = validation.data;

    const result = await executeQuery<User>(
      `UPDATE Users SET
        fullName = @fullName,
        updatedAt = GETDATE()
      OUTPUT INSERTED.id, INSERTED.email, INSERTED.fullName, INSERTED.role, INSERTED.tenantId
      WHERE id = @userId`,
      { userId, fullName }
    );

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Get company name
    const updatedUser = result[0];
    let companyName = null;

    if (updatedUser.tenantId) {
      const tenant = await executeQuerySingle<{ companyName: string }>(
        `SELECT companyName FROM Tenants WHERE id = @tenantId`,
        { tenantId: updatedUser.tenantId }
      );
      if (tenant) {
        companyName = tenant.companyName;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        ...updatedUser,
        companyName,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update profile" },
      { status: 500 }
    );
  }
}
