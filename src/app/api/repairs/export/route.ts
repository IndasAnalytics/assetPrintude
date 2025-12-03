import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";

interface RepairExport {
  assetCode: string;
  assetName: string;
  problemDescription: string;
  status: string;
  reportedAt: string;
  completedAt: string | null;
  estimatedCost: number | null;
  actualCost: number | null;
  vendorName: string | null;
  reportedByName: string;
}

/**
 * GET /api/repairs/export
 * Export repairs data to CSV/JSON
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

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get("format") || "json";
    const status = searchParams.get("status");

    let query = `
      SELECT
        a.assetCode,
        a.name as assetName,
        r.problemDescription,
        r.status,
        r.reportedAt,
        r.completedAt,
        r.estimatedCost,
        r.actualCost,
        v.name as vendorName,
        u.fullName as reportedByName
      FROM Repairs r
      INNER JOIN Assets a ON r.assetId = a.id
      LEFT JOIN Vendors v ON r.vendorId = v.id
      INNER JOIN Users u ON r.reportedBy = u.id
      WHERE r.tenantId = @tenantId
    `;

    const params: any = { tenantId };

    if (status) {
      query += ` AND r.status = @status`;
      params.status = status;
    }

    query += ` ORDER BY r.reportedAt DESC`;

    const repairs = await executeQuery<RepairExport>(query, params);

    if (format === "csv") {
      // Convert to CSV
      const headers = [
        "Asset Code",
        "Asset Name",
        "Problem",
        "Status",
        "Reported At",
        "Completed At",
        "Estimated Cost",
        "Actual Cost",
        "Vendor",
        "Reported By",
      ];

      const csvRows = [headers.join(",")];

      repairs.forEach((repair) => {
        const row = [
          repair.assetCode,
          `"${repair.assetName}"`,
          `"${repair.problemDescription}"`,
          repair.status,
          new Date(repair.reportedAt).toLocaleDateString(),
          repair.completedAt ? new Date(repair.completedAt).toLocaleDateString() : "",
          repair.estimatedCost || "",
          repair.actualCost || "",
          repair.vendorName || "",
          repair.reportedByName,
        ];
        csvRows.push(row.join(","));
      });

      const csv = csvRows.join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="repairs-export-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // Return JSON by default
    return NextResponse.json({
      success: true,
      data: repairs,
      count: repairs.length,
    });
  } catch (error) {
    console.error("Error exporting repairs:", error);
    return NextResponse.json(
      { success: false, message: "Failed to export repairs" },
      { status: 500 }
    );
  }
}
