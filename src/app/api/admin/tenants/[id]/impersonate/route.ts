import { NextRequest, NextResponse } from "next/server";
import { executeQuerySingle } from "@/lib/database";
import { setAuthCookie } from "@/lib/auth";
import { sign } from "jsonwebtoken";

/**
 * POST /api/admin/tenants/[id]/impersonate
 * Impersonate a tenant as super admin
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userRole = request.headers.get("x-user-role");
    const adminUserId = request.headers.get("x-user-id");

    if (userRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Super admin access required" },
        { status: 403 }
      );
    }

    // Get tenant's admin user
    const tenantAdmin = await executeQuerySingle<{
      id: number;
      email: string;
      role: string;
      tenantId: number;
    }>(
      `SELECT TOP 1 id, email, role, tenantId
       FROM Users
       WHERE tenantId = @tenantId AND role = 'CLIENT_ADMIN' AND isActive = 1
       ORDER BY createdAt ASC`,
      { tenantId: id }
    );

    if (!tenantAdmin) {
      return NextResponse.json(
        { success: false, message: "Tenant admin user not found" },
        { status: 404 }
      );
    }

    // Create JWT token for the tenant admin
    const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
    const token = sign(
      {
        userId: tenantAdmin.id,
        email: tenantAdmin.email,
        role: tenantAdmin.role,
        tenantId: tenantAdmin.tenantId,
        impersonatedBy: adminUserId, // Track who is impersonating
      },
      jwtSecret,
      { expiresIn: "8h" }
    );

    // Set the auth cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: "Impersonation started",
      data: {
        userId: tenantAdmin.id,
        email: tenantAdmin.email,
        tenantId: tenantAdmin.tenantId,
      },
    });
  } catch (error) {
    console.error("Error impersonating tenant:", error);
    return NextResponse.json(
      { success: false, message: "Failed to impersonate tenant" },
      { status: 500 }
    );
  }
}
