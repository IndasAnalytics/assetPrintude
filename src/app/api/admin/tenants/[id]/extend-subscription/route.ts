import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";
import { z } from "zod";

const extensionSchema = z.object({
  months: z.number().int().min(1, "Months must be at least 1"),
});

/**
 * POST /api/admin/tenants/[id]/extend-subscription
 * Extend tenant subscription (Super Admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userRole = request.headers.get("x-user-role");

    if (userRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Super admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = extensionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: validation.error.issues },
        { status: 400 }
      );
    }

    const { months } = validation.data;

    // Extend subscription by X months from current end date (or from now if no end date)
    await executeQuery(
      `UPDATE Tenants SET
        subscriptionEndDate = DATEADD(MONTH, @months, COALESCE(subscriptionEndDate, GETDATE())),
        subscriptionStartDate = COALESCE(subscriptionStartDate, GETDATE()),
        status = CASE
          WHEN status = 'SUSPENDED' THEN 'ACTIVE'
          ELSE status
        END,
        updatedAt = GETDATE()
      WHERE id = @id`,
      { id, months }
    );

    return NextResponse.json({
      success: true,
      message: `Subscription extended by ${months} month(s)`,
    });
  } catch (error) {
    console.error("Error extending subscription:", error);
    return NextResponse.json(
      { success: false, message: "Failed to extend subscription" },
      { status: 500 }
    );
  }
}
