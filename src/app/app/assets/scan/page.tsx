"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { QrCode, Camera, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export default function ScanQRPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scanner = useRef<Html5Qrcode | null>(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (scanner.current) {
        scanner.current.stop().catch((err) => {
          // Ignore errors if scanner is already stopped
          console.log("Scanner cleanup:", err);
        });
      }
    };
  }, []); // Empty dependency array - only run on mount/unmount

  const startScanning = async () => {
    try {
      setError(null);
      const html5QrCode = new Html5Qrcode("qr-reader");
      scanner.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // QR code scanned successfully
          toast.success("QR Code scanned!");
          html5QrCode.stop().then(() => {
            setIsScanning(false);
            scanner.current = null; // Clear reference after stopping
            // Navigate to asset details page
            router.push(`/app/assets/qr/${decodedText}`);
          }).catch(console.error);
        },
        (errorMessage) => {
          // Ignore scanning errors, they happen frequently
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error("Error starting scanner:", err);
      setError("Failed to start camera. Please check permissions.");
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (scanner.current) {
      scanner.current
        .stop()
        .then(() => {
          setIsScanning(false);
          scanner.current = null;
        })
        .catch(console.error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scan QR Code</h1>
        <p className="text-muted-foreground">Scan an asset QR code to view details</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code Scanner
            </CardTitle>
            <CardDescription>
              Position the QR code within the camera frame
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              id="qr-reader"
              className="w-full aspect-square rounded-lg border bg-muted overflow-hidden"
            />

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              {!isScanning ? (
                <Button onClick={startScanning} className="w-full">
                  <Camera className="mr-2 h-4 w-4" />
                  Start Scanning
                </Button>
              ) : (
                <Button onClick={stopScanning} variant="destructive" className="w-full">
                  Stop Scanning
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                1
              </div>
              <div className="flex-1">
                <p className="font-medium">Allow Camera Access</p>
                <p className="text-sm text-muted-foreground">
                  Grant permission when prompted to use your device camera
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                2
              </div>
              <div className="flex-1">
                <p className="font-medium">Position QR Code</p>
                <p className="text-sm text-muted-foreground">
                  Center the QR code within the scanning frame
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                3
              </div>
              <div className="flex-1">
                <p className="font-medium">View Asset Details</p>
                <p className="text-sm text-muted-foreground">
                  Automatically redirected to asset information
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-lg border bg-muted p-4">
              <p className="text-sm font-medium">Tips for Best Results</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• Ensure good lighting conditions</li>
                <li>• Hold camera steady</li>
                <li>• Keep QR code flat and visible</li>
                <li>• Avoid glare and shadows</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
