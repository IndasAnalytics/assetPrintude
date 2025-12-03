import { NextRequest, NextResponse } from "next/server";
import { executeQuerySingle } from "@/lib/database";
import { createToken, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import type { User } from "@/types/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Find super admin user
    const user = await executeQuerySingle<User>(
      `SELECT * FROM Users WHERE email = @email AND role = 'SUPER_ADMIN' AND isActive = 1`,
      { email }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid admin credentials" },
        { status: 401 }
      );
    }

    // Verify password
    if (!verifyPassword(password, user.password)) {
      return NextResponse.json(
        { success: false, message: "Invalid admin credentials" },
        { status: 401 }
      );
    }

    // Update last login
    await executeQuerySingle(
      `UPDATE Users SET lastLoginAt = GETDATE() WHERE id = @userId`,
      { userId: user.id }
    );

    // Create token (no tenantId for super admin)
    const token = createToken({
      userId: user.id,
      email: user.email,
      role: "SUPER_ADMIN",
      tenantId: null,
    });

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Admin login successful",
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tenantId: null,
      },
    });

    // Set cookie on response
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during login" },
      { status: 500 }
    );
  }
}
