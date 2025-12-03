"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Edit, Trash2, QrCode, Download, ArrowLeft, UserPlus, UserMinus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { IssueAssetDialog } from "@/components/IssueAssetDialog";
import { ReturnAssetDialog } from "@/components/ReturnAssetDialog";
import { toast } from "sonner";
import { format } from "date-fns";
import QRCode from "qrcode";

interface Asset {
  id: number;
  assetCode: string;
  qrHash: string;
  name: string;
  description: string | null;
  serialNumber: string | null;
  status: string;
  categoryName: string;
  locationName: string;
  binName: string | null;
  vendorName: string | null;
  assignedToName: string | null;
  assignedToEmployeeId: number | null;
  purchaseDate: string | null;
  purchaseCost: number | null;
  currentValue: number | null;
  depreciationRate: number;
  warrantyEndDate: string | null;
  createdAt: string;
}

interface AssetHistoryRecord {
  id: number;
  assetId: number;
  action: string;
  performedBy: number;
  performedByName: string;
  previousValues: string | null;
  newValues: string | null;
  notes: string | null;
  createdAt: string;
}

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [history, setHistory] = useState<AssetHistoryRecord[]>([]);
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchAsset();
      fetchHistory();
    }
  }, [params.id]);

  const fetchAsset = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/assets/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setAsset(data.data);
        // Generate QR code
        const qrUrl = await QRCode.toDataURL(data.data.qrHash);
        setQrCodeUrl(qrUrl);
      } else {
        toast.error("Failed to load asset");
      }
    } catch (error) {
      console.error("Error fetching asset:", error);
      toast.error("Failed to load asset");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(`/api/assets/${params.id}/history`);
      const data = await response.json();

      if (data.success) {
        setHistory(data.data);
      }
    } catch (error) {
      console.error("Error fetching asset history:", error);
    }
  };

  const handleAssetUpdate = () => {
    fetchAsset();
    fetchHistory();
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/assets/${params.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Asset deleted successfully");
        router.push("/app/assets");
      } else {
        toast.error(data.message || "Failed to delete asset");
      }
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast.error("Failed to delete asset");
    }
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement("a");
      link.download = `${asset?.assetCode}-qr.png`;
      link.href = qrCodeUrl;
      link.click();
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
        <p className="text-muted-foreground">Asset not found</p>
        <Button asChild>
          <Link href="/app/assets">Back to Assets</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/app/assets">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{asset.name}</h1>
            <p className="text-muted-foreground">{asset.assetCode}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {asset.status === "IN_STOCK" && (
            <Button onClick={() => setIsIssueDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Issue Asset
            </Button>
          )}
          {asset.status === "ASSIGNED" && asset.assignedToEmployeeId && (
            <Button variant="secondary" onClick={() => setIsReturnDialogOpen(true)}>
              <UserMinus className="mr-2 h-4 w-4" />
              Return Asset
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href={`/app/assets/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the asset "{asset.name}". This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Asset Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(asset.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="mt-1">{asset.categoryName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p className="mt-1">{asset.locationName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bin</p>
                  <p className="mt-1">{asset.binName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Serial Number</p>
                  <p className="mt-1">{asset.serialNumber || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vendor</p>
                  <p className="mt-1">{asset.vendorName || "-"}</p>
                </div>
              </div>
              {asset.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p className="mt-1">{asset.description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Purchase Date</p>
                  <p className="mt-1">
                    {asset.purchaseDate ? format(new Date(asset.purchaseDate), "MMM dd, yyyy") : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Purchase Cost</p>
                  <p className="mt-1">{asset.purchaseCost ? `₹${asset.purchaseCost.toFixed(2)}` : "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Value</p>
                  <p className="mt-1">{asset.currentValue ? `₹${asset.currentValue.toFixed(2)}` : "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Depreciation Rate</p>
                  <p className="mt-1">{asset.depreciationRate}% per year</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Warranty End Date</p>
                  <p className="mt-1">
                    {asset.warrantyEndDate ? format(new Date(asset.warrantyEndDate), "MMM dd, yyyy") : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {asset.assignedToName && (
            <Card>
              <CardHeader>
                <CardTitle>Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
                  <p className="mt-1">{asset.assignedToName}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* QR Code */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code
              </CardTitle>
              <CardDescription>Scan to view asset details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {qrCodeUrl && (
                <div className="flex justify-center">
                  <img src={qrCodeUrl} alt="Asset QR Code" className="w-48 h-48" />
                </div>
              )}
              <Button onClick={downloadQRCode} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p className="mt-1 text-sm">{format(new Date(asset.createdAt), "MMM dd, yyyy HH:mm")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Asset History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Asset History
          </CardTitle>
          <CardDescription>Timeline of all actions performed on this asset</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No history records found</p>
          ) : (
            <div className="space-y-4">
              {history.map((record, index) => (
                <div key={record.id} className="relative">
                  {index !== history.length - 1 && (
                    <div className="absolute left-2 top-8 bottom-0 w-px bg-border" />
                  )}
                  <div className="flex gap-4">
                    <div className="relative flex h-4 w-4 mt-1 shrink-0 items-center justify-center rounded-full border bg-background">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <div className="flex-1 space-y-1 pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">
                            {record.action.replace(/_/g, " ")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            by {record.performedByName}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(record.createdAt), "MMM dd, yyyy HH:mm")}
                        </p>
                      </div>
                      {record.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{record.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <IssueAssetDialog
        assetId={asset.id}
        assetName={asset.name}
        open={isIssueDialogOpen}
        onOpenChange={setIsIssueDialogOpen}
        onSuccess={handleAssetUpdate}
      />

      <ReturnAssetDialog
        assetId={asset.id}
        assetName={asset.name}
        assignedToName={asset.assignedToName || ""}
        open={isReturnDialogOpen}
        onOpenChange={setIsReturnDialogOpen}
        onSuccess={handleAssetUpdate}
      />
    </div>
  );
}
