import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";
import { z } from "zod";

interface Tenant {
  id: number;
  companyName: string;
  subdomain: string | null;
  contactEmail: string;
  contactPhone: string | null;
  address: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const tenantSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  subdomain: z.string().optional().nullable(),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "SUSPENDED", "TRIAL", "CANCELLED"]),
  planId: z.number().optional().nullable(),
  maxUsers: z.number().int().min(1, "Max users must be at least 1"),
  maxAssets: z.number().int().min(1, "Max assets must be at least 1"),
  subscriptionStartDate: z.string().optional().nullable(),
  subscriptionEndDate: z.string().optional().nullable(),
});

/**
 * GET /api/admin/tenants
 * Get all tenants (Super Admin only)
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

    const tenants = await executeQuery<Tenant>(
      `SELECT * FROM Tenants ORDER BY createdAt DESC`,
      {}
    );

    return NextResponse.json({
      success: true,
      data: tenants,
    });
  } catch (error) {
    console.error("Error fetching tenants:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch tenants" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/tenants
 * Create new tenant (Super Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role");

    if (userRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Super admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = tenantSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: validation.error.issues },
        { status: 400 }
      );
    }

    const {
      companyName,
      subdomain,
      contactEmail,
      contactPhone,
      address,
      status,
      planId,
      maxUsers,
      maxAssets,
      subscriptionStartDate,
      subscriptionEndDate,
    } = validation.data;

    const result = await executeQuery<Tenant>(
      `INSERT INTO Tenants (companyName, subdomain, contactEmail, contactPhone, address, status, planId, maxUsers, maxAssets, subscriptionStartDate, subscriptionEndDate)
       OUTPUT INSERTED.*
       VALUES (@companyName, @subdomain, @contactEmail, @contactPhone, @address, @status, @planId, @maxUsers, @maxAssets, @subscriptionStartDate, @subscriptionEndDate)`,
      {
        companyName,
        subdomain,
        contactEmail,
        contactPhone,
        address,
        status,
        planId,
        maxUsers,
        maxAssets,
        subscriptionStartDate,
        subscriptionEndDate,
      }
    );

    const newTenant = result[0];

    return NextResponse.json({
      success: true,
      message: "Tenant created successfully",
      data: newTenant,
    });
  } catch (error) {
    console.error("Error creating tenant:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create tenant" },
      { status: 500 }
    );
  }
}
