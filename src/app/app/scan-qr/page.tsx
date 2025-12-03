"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QrCode, Package, MapPin, User, ArrowRight, Camera, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface AssetData {
  id: number;
  assetCode: string;
  name: string;
  status: string;
  categoryName: string;
  locationName: string;
  assignedToName: string | null;
}

export default function ScanQRPage() {
  const [scanning, setScanning] = useState(false);
  const [asset, setAsset] = useState<AssetData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => console.error("Error clearing scanner:", err));
      }
    };
  }, []);

  const startScanning = () => {
    setScanning(true);
    setAsset(null);
    setError(null);

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scanner.render(onScanSuccess, onScanError);
    scannerRef.current = scanner;
  };

  const onScanSuccess = async (decodedText: string) => {
    // Stop scanning
    if (scannerRef.current) {
      scannerRef.current.clear().catch((err) => console.error("Error clearing scanner:", err));
      scannerRef.current = null;
    }
    setScanning(false);

    // Resolve QR code
    try {
      const response = await fetch(`/api/qr/resolve?hash=${encodeURIComponent(decodedText)}`);
      const result = await response.json();

      if (result.success) {
        setAsset(result.data);
        toast.success("Asset found!");
      } else {
        setError(result.message || "Asset not found");
        toast.error("Asset not found");
      }
    } catch (err) {
      console.error("Error resolving QR code:", err);
      setError("Failed to resolve QR code");
      toast.error("Failed to resolve QR code");
    }
  };

  const onScanError = (errorMessage: string) => {
    // Ignore scan errors (they happen frequently during scanning)
    // console.log("Scan error:", errorMessage);
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch((err) => console.error("Error clearing scanner:", err));
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const resetScanner = () => {
    setAsset(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scan QR Code</h1>
        <p className="text-muted-foreground">Scan asset QR codes to view details instantly</p>
      </div>

      {/* Scanner Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code Scanner
          </CardTitle>
          <CardDescription>
            Point your camera at an asset QR code to scan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!scanning && !asset && !error && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-6 rounded-full bg-primary/10 p-6">
                <Camera className="h-16 w-16 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Ready to Scan</h3>
              <p className="mb-6 text-center text-sm text-muted-foreground">
                Click the button below to activate your camera and start scanning QR codes
              </p>
              <Button onClick={startScanning} className="gap-2">
                <Camera className="h-4 w-4" />
                Start Scanning
              </Button>
            </div>
          )}

          {scanning && (
            <div className="space-y-4">
              <div id="qr-reader" className="w-full" />
              <div className="flex justify-center">
                <Button variant="destructive" onClick={stopScanning} className="gap-2">
                  <X className="h-4 w-4" />
                  Stop Scanning
                </Button>
              </div>
              <Alert>
                <Camera className="h-4 w-4" />
                <AlertDescription>
                  Position the QR code within the scanning area. The scanner will automatically detect and read the code.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {error && !scanning && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className="flex justify-center gap-2">
                <Button onClick={resetScanner} variant="outline">
                  Reset
                </Button>
                <Button onClick={startScanning} className="gap-2">
                  <Camera className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {asset && !scanning && (
            <div className="space-y-6">
              <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-900 dark:text-green-100">
                  Asset successfully scanned and identified!
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">{asset.name}</h3>
                  <Badge
                    variant={
                      asset.status === "IN_STOCK"
                        ? "default"
                        : asset.status === "ASSIGNED"
                        ? "secondary"
                        : asset.status === "IN_REPAIR"
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {asset.status.replace("_", " ")}
                  </Badge>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-lg border p-4">
                    <Package className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Asset Code</p>
                      <p className="text-lg font-semibold">{asset.assetCode}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border p-4">
                    <Package className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Category</p>
                      <p className="text-lg font-semibold">{asset.categoryName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border p-4">
                    <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Location</p>
                      <p className="text-lg font-semibold">{asset.locationName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border p-4">
                    <User className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
                      <p className="text-lg font-semibold">
                        {asset.assignedToName || "Not assigned"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href={`/app/assets/${asset.id}`} className="flex-1">
                  <Button className="w-full gap-2">
                    View Full Details <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Button onClick={resetScanner} variant="outline" className="gap-2">
                  Scan Another
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>How to Scan</CardTitle>
          <CardDescription>Follow these simple steps to scan asset QR codes</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                1
              </span>
              <span>Click the "Start Scanning" button to activate your camera</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                2
              </span>
              <span>Point your camera at the QR code on the asset label</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                3
              </span>
              <span>The scanner will automatically detect and read the code</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                4
              </span>
              <span>View asset details or scan another code</span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
