import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeQuerySingle } from "@/lib/database";
import { employeeSchema } from "@/lib/validations";
import type { Employee } from "@/types/asset";

/**
 * GET /api/masters/employees
 * Get all employees for the authenticated tenant
 */
export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get("x-tenant-id");

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const employees = await executeQuery<Employee>(
      `SELECT * FROM Employees
       WHERE tenantId = @tenantId AND isActive = 1
       ORDER BY fullName ASC`,
      { tenantId }
    );

    return NextResponse.json({
      success: true,
      data: employees,
      total: employees.length,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/masters/employees
 * Create a new employee
 */
export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const userId = request.headers.get("x-user-id");

    if (!tenantId || !userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = employeeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input",
          errors: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { employeeCode, fullName, email, phone, department, designation } =
      validation.data;

    // Check if employee code already exists for this tenant
    const existingCode = await executeQuerySingle<Employee>(
      `SELECT id FROM Employees WHERE tenantId = @tenantId AND employeeCode = @employeeCode AND isActive = 1`,
      { tenantId, employeeCode }
    );

    if (existingCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee with this code already exists",
        },
        { status: 409 }
      );
    }

    // Check if email already exists (if provided)
    if (email) {
      const emailExists = await executeQuerySingle<Employee>(
        `SELECT id FROM Employees WHERE tenantId = @tenantId AND email = @email AND isActive = 1`,
        { tenantId, email }
      );

      if (emailExists) {
        return NextResponse.json(
          {
            success: false,
            message: "Employee with this email already exists",
          },
          { status: 409 }
        );
      }
    }

    // Create new employee
    const newEmployee = await executeQuerySingle<Employee>(
      `INSERT INTO Employees (tenantId, employeeCode, fullName, email, phone, department, designation)
       OUTPUT INSERTED.*
       VALUES (@tenantId, @employeeCode, @fullName, @email, @phone, @department, @designation)`,
      {
        tenantId,
        employeeCode,
        fullName,
        email: email || null,
        phone: phone || null,
        department: department || null,
        designation: designation || null,
      }
    );

    if (!newEmployee) {
      return NextResponse.json(
        { success: false, message: "Failed to create employee" },
        { status: 500 }
      );
    }

    // Log activity
    await executeQuery(
      `INSERT INTO ActivityLogs (tenantId, userId, action, entityType, entityId, description)
       VALUES (@tenantId, @userId, 'CREATE', 'EMPLOYEE', @entityId, @description)`,
      {
        tenantId,
        userId,
        entityId: newEmployee.id.toString(),
        description: `Created employee: ${fullName} (${employeeCode})`,
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Employee created successfully",
        data: newEmployee,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create employee" },
      { status: 500 }
    );
  }
}
