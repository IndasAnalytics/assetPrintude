import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";

interface User {
  id: number;
  tenantId: number | null;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}

/**
 * GET /api/admin/users
 * Get all users (Super Admin only)
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

    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get("role");

    let query = `
      SELECT
        u.*,
        t.companyName
      FROM Users u
      LEFT JOIN Tenants t ON u.tenantId = t.id
      WHERE 1=1
    `;

    const params: Record<string, any> = {};

    if (roleFilter && roleFilter !== "all") {
      query += ` AND u.role = @role`;
      params.role = roleFilter;
    }

    query += ` ORDER BY u.createdAt DESC`;

    const users = await executeQuery<User>(query, params);

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
