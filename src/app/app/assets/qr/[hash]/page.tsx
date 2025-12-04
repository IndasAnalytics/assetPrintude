"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { authFetch } from "@/lib/auth-client";

interface Asset {
  id: number;
  assetCode: string;
  name: string;
  description: string | null;
  status: string;
  categoryName: string;
  locationName: string;
  assignedToName: string | null;
  purchaseCost: number | null;
  currentValue: number | null;
}

export default function QRAssetPage() {
  const params = useParams();
  const router = useRouter();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.hash) {
      fetchAssetByQR();
    }
  }, [params.hash]);

  const fetchAssetByQR = async () => {
    try {
      setIsLoading(true);
      const response = await authFetch(`/api/assets/qr/${params.hash}`);
      const data = await response.json();

      if (data.success) {
        setAsset(data.data);
      } else {
        toast.error("Asset not found");
      }
    } catch (error) {
      console.error("Error fetching asset:", error);
      toast.error("Failed to load asset");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      IN_STOCK: "default",
      ASSIGNED: "secondary",
      IN_REPAIR: "destructive",
      DISPOSED: "outline",
    };

    return <Badge variant={variants[status] || "default"}>{status.replace("_", " ")}</Badge>;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Loading asset...</div>;
  }

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Package className="h-16 w-16 text-muted-foreground" />
        <p className="text-xl font-medium">Asset Not Found</p>
        <p className="text-muted-foreground">This QR code doesn't match any assets in your system</p>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/app/assets/scan">Scan Another</Link>
          </Button>
          <Button asChild>
            <Link href="/app/assets">View All Assets</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/app/assets/scan">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scanned Asset</h1>
          <p className="text-muted-foreground">Asset details from QR code</p>
        </div>
      </div>

      {/* Asset Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{asset.name}</CardTitle>
              <CardDescription>{asset.assetCode}</CardDescription>
            </div>
            {getStatusBadge(asset.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Category</p>
              <p className="mt-1">{asset.categoryName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Location</p>
              <p className="mt-1">{asset.locationName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
              <p className="mt-1">{asset.assignedToName || "Unassigned"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Value</p>
              <p className="mt-1">{asset.currentValue ? `₹${asset.currentValue.toFixed(2)}` : "-"}</p>
            </div>
          </div>

          {asset.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="mt-1">{asset.description}</p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button asChild className="flex-1">
              <Link href={`/app/assets/${asset.id}`}>View Full Details</Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/app/assets/scan">Scan Another</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
