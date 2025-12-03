import { NextRequest, NextResponse } from "next/server";
import { executeQuerySingle } from "@/lib/database";
import QRCode from "qrcode";

/**
 * GET /api/qr/print/[id]
 * Get printable QR label with asset information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = request.headers.get("x-tenant-id");

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get asset details
    const asset = await executeQuerySingle<{
      assetCode: string;
      name: string;
      qrHash: string;
      categoryName: string;
      locationName: string;
    }>(
      `SELECT
        a.assetCode,
        a.name,
        a.qrHash,
        c.name as categoryName,
        l.name as locationName
      FROM Assets a
      INNER JOIN Categories c ON a.categoryId = c.id
      INNER JOIN Locations l ON a.locationId = l.id
      WHERE a.id = @id AND a.tenantId = @tenantId AND a.isActive = 1`,
      { id, tenantId }
    );

    if (!asset) {
      return NextResponse.json(
        { success: false, message: "Asset not found" },
        { status: 404 }
      );
    }

    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(asset.qrHash, {
      width: 400,
      margin: 1,
    });

    // Create HTML for printable label
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Asset Label - ${asset.assetCode}</title>
  <style>
    @page {
      size: 4in 2in;
      margin: 0;
    }
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0.25in;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 2in;
      width: 4in;
    }
    .label-container {
      text-align: center;
      border: 2px solid #000;
      padding: 0.15in;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .qr-code {
      margin: 0 auto;
    }
    .qr-code img {
      width: 1.2in;
      height: 1.2in;
    }
    .asset-info {
      margin-top: 0.1in;
    }
    .asset-code {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 4px;
    }
    .asset-name {
      font-size: 12px;
      margin-bottom: 2px;
    }
    .asset-details {
      font-size: 9px;
      color: #666;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="label-container">
    <div class="qr-code">
      <img src="${qrCodeDataURL}" alt="QR Code" />
    </div>
    <div class="asset-info">
      <div class="asset-code">${asset.assetCode}</div>
      <div class="asset-name">${asset.name}</div>
      <div class="asset-details">
        ${asset.categoryName} • ${asset.locationName}
      </div>
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
    `;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Error generating printable label:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate printable label" },
      { status: 500 }
    );
  }
}
