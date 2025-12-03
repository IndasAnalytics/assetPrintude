import { NextRequest, NextResponse } from "next/server";
import { executeQuerySingle } from "@/lib/database";
import QRCode from "qrcode";

/**
 * POST /api/qr/generate
 * Generate QR code for asset
 */
export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get("x-tenant-id");

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { assetId } = body;

    if (!assetId) {
      return NextResponse.json(
        { success: false, message: "Asset ID is required" },
        { status: 400 }
      );
    }

    // Get asset with QR hash
    const asset = await executeQuerySingle<{ qrHash: string; name: string }>(
      `SELECT qrHash, name FROM Assets WHERE id = @assetId AND tenantId = @tenantId AND isActive = 1`,
      { assetId, tenantId }
    );

    if (!asset) {
      return NextResponse.json(
        { success: false, message: "Asset not found" },
        { status: 404 }
      );
    }

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(asset.qrHash, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        qrHash: asset.qrHash,
        assetName: asset.name,
        qrCodeDataURL,
      },
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
