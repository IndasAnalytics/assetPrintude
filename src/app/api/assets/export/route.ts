import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";

interface AssetExport {
  assetCode: string;
  name: string;
  serialNumber: string | null;
  categoryName: string;
  locationName: string;
  binName: string | null;
  status: string;
  assignedToName: string | null;
  purchaseDate: string | null;
  purchaseCost: number | null;
  currentValue: number | null;
  vendorName: string | null;
}

/**
 * GET /api/assets/export
 * Export assets data to CSV/JSON
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
        a.name,
        a.serialNumber,
        c.name as categoryName,
        l.name as locationName,
        b.name as binName,
        a.status,
        e.fullName as assignedToName,
        a.purchaseDate,
        a.purchaseCost,
        a.currentValue,
        v.name as vendorName
      FROM Assets a
      INNER JOIN Categories c ON a.categoryId = c.id
      INNER JOIN Locations l ON a.locationId = l.id
      LEFT JOIN Bins b ON a.binId = b.id
      LEFT JOIN Employees e ON a.assignedToEmployeeId = e.id
      LEFT JOIN Vendors v ON a.vendorId = v.id
      WHERE a.tenantId = @tenantId AND a.isActive = 1
    `;

    const params: any = { tenantId };

    if (status) {
      query += ` AND a.status = @status`;
      params.status = status;
    }

    query += ` ORDER BY a.createdAt DESC`;

    const assets = await executeQuery<AssetExport>(query, params);

    if (format === "csv") {
      // Convert to CSV
      const headers = [
        "Asset Code",
        "Name",
        "Serial Number",
        "Category",
        "Location",
        "Bin",
        "Status",
        "Assigned To",
        "Purchase Date",
        "Purchase Cost",
        "Current Value",
        "Vendor",
      ];

      const csvRows = [headers.join(",")];

      assets.forEach((asset) => {
        const row = [
          asset.assetCode,
          `"${asset.name}"`,
          asset.serialNumber || "",
          asset.categoryName,
          asset.locationName,
          asset.binName || "",
          asset.status,
          asset.assignedToName || "",
          asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : "",
          asset.purchaseCost || "",
          asset.currentValue || "",
          asset.vendorName || "",
        ];
        csvRows.push(row.join(","));
      });

      const csv = csvRows.join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="assets-export-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // Return JSON by default
    return NextResponse.json({
      success: true,
      data: assets,
      count: assets.length,
    });
  } catch (error) {
    console.error("Error exporting assets:", error);
    return NextResponse.json(
      { success: false, message: "Failed to export assets" },
      { status: 500 }
    );
  }
}
