"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Asset {
  id: number;
  name: string;
  assetCode: string;
}

interface Vendor {
  id: number;
  name: string;
}

export default function NewRepairPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [formData, setFormData] = useState({
    assetId: "",
    vendorId: "",
    problemDescription: "",
    referenceNumber: "",
    estimatedCost: "",
  });

  useEffect(() => {
    fetchAssets();
    fetchVendors();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await fetch("/api/assets");
      const data = await response.json();
      if (data.success) {
        setAssets(data.data);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await fetch("/api/masters/vendors");
      const data = await response.json();
      if (data.success) {
        setVendors(data.data);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.assetId || !formData.problemDescription) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/repairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: parseInt(formData.assetId),
          vendorId: formData.vendorId ? parseInt(formData.vendorId) : null,
          problemDescription: formData.problemDescription,
          referenceNumber: formData.referenceNumber || null,
          estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Repair request created successfully");
        router.push(`/app/repairs/${data.data.id}`);
      } else {
        toast.error(data.message || "Failed to create repair request");
      }
    } catch (error) {
      console.error("Error creating repair:", error);
      toast.error("Failed to create repair request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/app/repairs">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Repair Request</h1>
          <p className="text-muted-foreground">Create a new repair request for an asset</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Repair Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="asset">Asset *</Label>
              <Select value={formData.assetId} onValueChange={(value) => setFormData({ ...formData, assetId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an asset" />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id.toString()}>
                      {asset.name} ({asset.assetCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="problemDescription">Problem Description *</Label>
              <Textarea
                id="problemDescription"
                placeholder="Describe the problem..."
                rows={4}
                value={formData.problemDescription}
                onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="vendor">Vendor (Optional)</Label>
              <Select value={formData.vendorId} onValueChange={(value) => setFormData({ ...formData, vendorId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id.toString()}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="referenceNumber">Reference Number (Optional)</Label>
              <Input
                id="referenceNumber"
                placeholder="e.g., REP-2024-001"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="estimatedCost">Estimated Cost (Optional)</Label>
              <Input
                id="estimatedCost"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Repair Request
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/app/repairs">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
