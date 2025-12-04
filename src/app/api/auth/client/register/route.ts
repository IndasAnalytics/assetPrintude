import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeQuerySingle } from "@/lib/database";
import { createToken, hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";
import type { User } from "@/types/auth";

interface Tenant {
  id: number;
  companyName: string;
  contactEmail: string;
  status: string;
}

interface Plan {
  id: number;
  name: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: validation.error.issues },
        { status: 400 }
      );
    }

    const { companyName, fullName, email, password } = validation.data;

    // Check if email already exists
    const existingUser = await executeQuerySingle<User>(
      `SELECT id FROM Users WHERE email = @email`,
      { email }
    );

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 409 }
      );
    }

    // Get Starter plan (for trial)
    const starterPlan = await executeQuerySingle<Plan>(
      `SELECT * FROM Plans WHERE name = 'Starter' AND isActive = 1`
    );

    if (!starterPlan) {
      return NextResponse.json(
        { success: false, message: "Starter plan not found. Please contact support." },
        { status: 500 }
      );
    }

    // Create tenant
    const newTenant = await executeQuerySingle<Tenant>(
      `INSERT INTO Tenants (companyName, contactEmail, status)
       OUTPUT INSERTED.*
       VALUES (@companyName, @email, 'TRIAL')`,
      { companyName, email }
    );

    if (!newTenant) {
      return NextResponse.json(
        { success: false, message: "Failed to create tenant" },
        { status: 500 }
      );
    }

    const tenantId = newTenant.id;

    // Create user (admin for this tenant)
    const hashedPassword = hashPassword(password);
    const newUser = await executeQuerySingle<User>(
      `INSERT INTO Users (tenantId, email, password, fullName, role, isActive)
       OUTPUT INSERTED.*
       VALUES (@tenantId, @email, @password, @fullName, 'CLIENT_ADMIN', 1)`,
      { tenantId, email, password: hashedPassword, fullName }
    );

    if (!newUser) {
      return NextResponse.json(
        { success: false, message: "Failed to create user" },
        { status: 500 }
      );
    }

    const userId = newUser.id;

    // Create trial subscription (30 days)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // 30 day trial

    await executeQuery(
      `INSERT INTO Subscriptions (tenantId, planId, status, startDate, endDate, billingCycle)
       VALUES (@tenantId, @planId, 'TRIAL', @startDate, @endDate, 'MONTHLY')`,
      {
        tenantId,
        planId: starterPlan.id,
        startDate,
        endDate,
      }
    );

    // Log activity
    await executeQuery(
      `INSERT INTO ActivityLogs (tenantId, userId, action, description)
       VALUES (@tenantId, @userId, 'TENANT_REGISTERED', @description)`,
      {
        tenantId,
        userId,
        description: JSON.stringify({ companyName, email }),
      }
    );

    // Create token
    const token = createToken({
      userId,
      email,
      role: "CLIENT_ADMIN",
      tenantId,
    });

    // Return token in response body for Bearer authentication
    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      token, // Return token for client to store
      user: {
        id: userId,
        email,
        fullName,
        role: "CLIENT_ADMIN",
        tenantId,
      },
    });
  } catch (error) {
    console.error("Client registration error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
