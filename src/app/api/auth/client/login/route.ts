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

    // Find user
    const user = await executeQuerySingle<User>(
      `SELECT * FROM Users WHERE email = @email AND role != 'SUPER_ADMIN' AND isActive = 1`,
      { email }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    if (!verifyPassword(password, user.password)) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user has tenantId (client users must belong to a tenant)
    if (!user.tenantId) {
      return NextResponse.json(
        { success: false, message: "Invalid account type. Please use admin login." },
        { status: 403 }
      );
    }

    // Update last login
    await executeQuerySingle(
      `UPDATE Users SET lastLoginAt = GETDATE() WHERE id = @userId`,
      { userId: user.id }
    );

    // Create token
    const token = createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    // Return token in response body for Bearer authentication
    return NextResponse.json({
      success: true,
      message: "Login successful",
      token, // Return token for client to store
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId,
      },
    });
  } catch (error) {
    console.error("Client login error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during login" },
      { status: 500 }
    );
  }
}
