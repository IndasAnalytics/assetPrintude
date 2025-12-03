import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeQuerySingle } from "@/lib/database";
import { employeeSchema } from "@/lib/validations";
import type { Employee } from "@/types/asset";

/**
 * GET /api/masters/employees/[id]
 * Get a single employee by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const { id } = await params;

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const employee = await executeQuerySingle<Employee>(
      `SELECT * FROM Employees WHERE id = @id AND tenantId = @tenantId AND isActive = 1`,
      { id, tenantId }
    );

    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Error fetching employee:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch employee" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/masters/employees/[id]
 * Update an existing employee
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const userId = request.headers.get("x-user-id");
    const { id } = await params;

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

    // Check if employee exists and belongs to tenant
    const existing = await executeQuerySingle<Employee>(
      `SELECT id FROM Employees WHERE id = @id AND tenantId = @tenantId AND isActive = 1`,
      { id, tenantId }
    );

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 }
      );
    }

    // Check if new employee code conflicts with another employee
    const codeConflict = await executeQuerySingle<Employee>(
      `SELECT id FROM Employees WHERE tenantId = @tenantId AND employeeCode = @employeeCode AND id != @id AND isActive = 1`,
      { tenantId, employeeCode, id }
    );

    if (codeConflict) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee with this code already exists",
        },
        { status: 409 }
      );
    }

    // Check if email conflicts with another employee (if provided)
    if (email) {
      const emailConflict = await executeQuerySingle<Employee>(
        `SELECT id FROM Employees WHERE tenantId = @tenantId AND email = @email AND id != @id AND isActive = 1`,
        { tenantId, email, id }
      );

      if (emailConflict) {
        return NextResponse.json(
          {
            success: false,
            message: "Employee with this email already exists",
          },
          { status: 409 }
        );
      }
    }

    // Update employee
    const updatedEmployee = await executeQuerySingle<Employee>(
      `UPDATE Employees
       SET employeeCode = @employeeCode,
           fullName = @fullName,
           email = @email,
           phone = @phone,
           department = @department,
           designation = @designation,
           updatedAt = GETDATE()
       OUTPUT INSERTED.*
       WHERE id = @id AND tenantId = @tenantId`,
      {
        id,
        tenantId,
        employeeCode,
        fullName,
        email: email || null,
        phone: phone || null,
        department: department || null,
        designation: designation || null,
      }
    );

    // Log activity
    await executeQuery(
      `INSERT INTO ActivityLogs (tenantId, userId, action, entityType, entityId, description)
       VALUES (@tenantId, @userId, 'UPDATE', 'EMPLOYEE', @entityId, @description)`,
      {
        tenantId,
        userId,
        entityId: id,
        description: `Updated employee: ${fullName} (${employeeCode})`,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Employee updated successfully",
      data: updatedEmployee,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update employee" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/masters/employees/[id]
 * Soft delete an employee (set isActive = false)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const userId = request.headers.get("x-user-id");
    const { id } = await params;

    if (!tenantId || !userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if employee exists
    const employee = await executeQuerySingle<Employee>(
      `SELECT id, fullName, employeeCode FROM Employees WHERE id = @id AND tenantId = @tenantId AND isActive = 1`,
      { id, tenantId }
    );

    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 }
      );
    }

    // Check if employee has assets assigned
    const assets = await executeQuery(
      `SELECT id FROM Assets WHERE assignedToEmployeeId = @id AND tenantId = @tenantId AND isActive = 1`,
      { id, tenantId }
    );

    if (assets.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cannot delete employee with assigned assets. Return or reassign assets first.",
        },
        { status: 400 }
      );
    }

    // Soft delete employee
    await executeQuery(
      `UPDATE Employees SET isActive = 0, updatedAt = GETDATE() WHERE id = @id AND tenantId = @tenantId`,
      { id, tenantId }
    );

    // Log activity
    await executeQuery(
      `INSERT INTO ActivityLogs (tenantId, userId, action, entityType, entityId, description)
       VALUES (@tenantId, @userId, 'DELETE', 'EMPLOYEE', @entityId, @description)`,
      {
        tenantId,
        userId,
        entityId: id,
        description: `Deleted employee: ${employee.fullName} (${employee.employeeCode})`,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete employee" },
      { status: 500 }
    );
  }
}
