import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeQuerySingle } from "@/lib/database";
import { categorySchema } from "@/lib/validations";
import type { Category } from "@/types/asset";

/**
 * GET /api/masters/categories
 * Get all categories for the authenticated tenant
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

    const categories = await executeQuery<Category>(
      `SELECT * FROM Categories
       WHERE tenantId = @tenantId AND isActive = 1
       ORDER BY name ASC`,
      { tenantId }
    );

    return NextResponse.json({
      success: true,
      data: categories,
      total: categories.length,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/masters/categories
 * Create a new category
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

    // Check if category name already exists for this tenant
    const existing = await executeQuerySingle<Category>(
      `SELECT id FROM Categories WHERE tenantId = @tenantId AND name = @name AND isActive = 1`,
      { tenantId, name }
    );

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Category with this name already exists" },
        { status: 409 }
      );
    }

    // Create new category
    const result = await executeQuery<Category>(
      `INSERT INTO Categories (tenantId, name, description)
       OUTPUT INSERTED.*
       VALUES (@tenantId, @name, @description)`,
      {
        tenantId,
        name,
        description: description || null,
      }
    );

    const newCategory = result[0];

    // Log activity
    await executeQuery(
      `INSERT INTO ActivityLogs (tenantId, userId, action, entityType, entityId, description)
       VALUES (@tenantId, @userId, 'CREATE', 'CATEGORY', @entityId, @description)`,
      {
        tenantId,
        userId,
        entityId: newCategory.id.toString(),
        description: `Created category: ${name}`,
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        data: newCategory,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create category" },
      { status: 500 }
    );
  }
}
