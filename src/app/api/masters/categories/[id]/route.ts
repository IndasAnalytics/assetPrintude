import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeQuerySingle } from "@/lib/database";
import { categorySchema } from "@/lib/validations";
import type { Category } from "@/types/asset";

/**
 * GET /api/masters/categories/[id]
 * Get a single category by ID
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

    const category = await executeQuerySingle<Category>(
      `SELECT * FROM Categories WHERE id = @id AND tenantId = @tenantId AND isActive = 1`,
      { id, tenantId }
    );

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/masters/categories/[id]
 * Update an existing category
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
    const validation = categorySchema.safeParse(body);

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

    const { name, description } = validation.data;

    // Check if category exists and belongs to tenant
    const existing = await executeQuerySingle<Category>(
      `SELECT id FROM Categories WHERE id = @id AND tenantId = @tenantId AND isActive = 1`,
      { id, tenantId }
    );

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    // Check if new name conflicts with another category
    const nameConflict = await executeQuerySingle<Category>(
      `SELECT id FROM Categories WHERE tenantId = @tenantId AND name = @name AND id != @id AND isActive = 1`,
      { tenantId, name, id }
    );

    if (nameConflict) {
      return NextResponse.json(
        { success: false, message: "Category with this name already exists" },
        { status: 409 }
      );
    }

    // Update category
    const updatedCategory = await executeQuerySingle<Category>(
      `UPDATE Categories
       SET name = @name,
           description = @description,
           updatedAt = GETDATE()
       OUTPUT INSERTED.*
       WHERE id = @id AND tenantId = @tenantId`,
      {
        id,
        tenantId,
        name,
        description: description || null,
      }
    );

    // Log activity
    await executeQuery(
      `INSERT INTO ActivityLogs (tenantId, userId, action, entityType, entityId, description)
       VALUES (@tenantId, @userId, 'UPDATE', 'CATEGORY', @entityId, @description)`,
      {
        tenantId,
        userId,
        entityId: id,
        description: `Updated category: ${name}`,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update category" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/masters/categories/[id]
 * Soft delete a category (set isActive = false)
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

    // Check if category exists
    const category = await executeQuerySingle<Category>(
      `SELECT id, name FROM Categories WHERE id = @id AND tenantId = @tenantId AND isActive = 1`,
      { id, tenantId }
    );

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category has assets
    const assets = await executeQuery(
      `SELECT id FROM Assets WHERE categoryId = @id AND tenantId = @tenantId AND isActive = 1`,
      { id, tenantId }
    );

    if (assets.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete category with assets. Reassign assets first.",
        },
        { status: 400 }
      );
    }

    // Soft delete category
    await executeQuery(
      `UPDATE Categories SET isActive = 0, updatedAt = GETDATE() WHERE id = @id AND tenantId = @tenantId`,
      { id, tenantId }
    );

    // Log activity
    await executeQuery(
      `INSERT INTO ActivityLogs (tenantId, userId, action, entityType, entityId, description)
       VALUES (@tenantId, @userId, 'DELETE', 'CATEGORY', @entityId, @description)`,
      {
        tenantId,
        userId,
        entityId: id,
        description: `Deleted category: ${category.name}`,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete category" },
      { status: 500 }
    );
  }
}
