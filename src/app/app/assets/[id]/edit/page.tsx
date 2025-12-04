"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { authFetch } from "@/lib/auth-client";

interface Category {
  id: number;
  name: string;
}

interface Location {
  id: number;
  name: string;
}

interface Vendor {
  id: number;
  name: string;
}

interface Bin {
  id: number;
  name: string;
}

interface Asset {
  id: number;
  assetCode: string;
  name: string;
  description: string | null;
  serialNumber: string | null;
  categoryId: number;
  vendorId: number | null;
  locationId: number;
  binId: number | null;
  status: string;
  purchaseDate: string | null;
  purchaseCost: number | null;
  currentValue: number | null;
  depreciationRate: number;
  warrantyEndDate: string | null;
}

export default function EditAssetPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [bins, setBins] = useState<Bin[]>([]);

  const [formData, setFormData] = useState({
    assetCode: "",
    name: "",
    description: "",
    serialNumber: "",
    categoryId: "",
    vendorId: "",
    locationId: "",
    binId: "",
    status: "IN_STOCK",
    purchaseDate: "",
    purchaseCost: "",
    currentValue: "",
    depreciationRate: "15",
    warrantyEndDate: "",
  });

  useEffect(() => {
    if (params.id) {
      fetchAsset();
      fetchMasterData();
    }
  }, [params.id]);

  useEffect(() => {
    if (formData.locationId) {
      fetchBins(formData.locationId);
    }
  }, [formData.locationId]);

  const fetchAsset = async () => {
    try {
      setIsFetching(true);
      const response = await authFetch(`/api/assets/${params.id}`);
      const data = await response.json();

      if (data.success) {
        const asset: Asset = data.data;
        setFormData({
          assetCode: asset.assetCode,
          name: asset.name,
          description: asset.description || "",
          serialNumber: asset.serialNumber || "",
          categoryId: asset.categoryId.toString(),
          vendorId: asset.vendorId ? asset.vendorId.toString() : "",
          locationId: asset.locationId.toString(),
          binId: asset.binId ? asset.binId.toString() : "",
          status: asset.status,
          purchaseDate: asset.purchaseDate ? asset.purchaseDate.split("T")[0] : "",
          purchaseCost: asset.purchaseCost ? asset.purchaseCost.toString() : "",
          currentValue: asset.currentValue ? asset.currentValue.toString() : "",
          depreciationRate: asset.depreciationRate.toString(),
          warrantyEndDate: asset.warrantyEndDate ? asset.warrantyEndDate.split("T")[0] : "",
        });
      } else {
        toast.error("Failed to load asset");
        router.push("/app/assets");
      }
    } catch (error) {
      console.error("Error fetching asset:", error);
      toast.error("Failed to load asset");
      router.push("/app/assets");
    } finally {
      setIsFetching(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const [categoriesRes, locationsRes, vendorsRes] = await Promise.all([
        authFetch("/api/masters/categories"),
        authFetch("/api/masters/locations"),
        authFetch("/api/masters/vendors"),
      ]);

      const [categoriesData, locationsData, vendorsData] = await Promise.all([
        categoriesRes.json(),
        locationsRes.json(),
        vendorsRes.json(),
      ]);

      if (categoriesData.success) setCategories(categoriesData.data);
      if (locationsData.success) setLocations(locationsData.data);
      if (vendorsData.success) setVendors(vendorsData.data);
    } catch (error) {
      console.error("Error fetching master data:", error);
      toast.error("Failed to load form data");
    }
  };

  const fetchBins = async (locationId: string) => {
    try {
      const response = await authFetch(`/api/bins?locationId=${locationId}`);
      const data = await response.json();
      if (data.success) {
        setBins(data.data);
      }
    } catch (error) {
      console.error("Error fetching bins:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.assetCode || !formData.name || !formData.categoryId || !formData.locationId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authFetch(`/api/assets/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetCode: formData.assetCode,
          name: formData.name,
          description: formData.description || null,
          serialNumber: formData.serialNumber || null,
          categoryId: parseInt(formData.categoryId),
          vendorId: formData.vendorId ? parseInt(formData.vendorId) : null,
          locationId: parseInt(formData.locationId),
          binId: formData.binId ? parseInt(formData.binId) : null,
          status: formData.status,
          purchaseDate: formData.purchaseDate || null,
          purchaseCost: formData.purchaseCost ? parseFloat(formData.purchaseCost) : null,
          currentValue: formData.currentValue ? parseFloat(formData.currentValue) : null,
          depreciationRate: parseFloat(formData.depreciationRate),
          warrantyEndDate: formData.warrantyEndDate || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Asset updated successfully");
        router.push(`/app/assets/${params.id}`);
      } else {
        toast.error(data.message || "Failed to update asset");
      }
    } catch (error) {
      console.error("Error updating asset:", error);
      toast.error("Failed to update asset");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/app/assets/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Asset</h1>
          <p className="text-muted-foreground">Update asset information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="assetCode">Asset Code *</Label>
                <Input
                  id="assetCode"
                  placeholder="e.g., ASSET-001"
                  value={formData.assetCode}
                  onChange={(e) => setFormData({ ...formData, assetCode: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Asset Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Dell Laptop"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Additional details about the asset..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN_STOCK">In Stock</SelectItem>
                    <SelectItem value="ASSIGNED">Assigned</SelectItem>
                    <SelectItem value="IN_REPAIR">In Repair</SelectItem>
                    <SelectItem value="DISPOSED">Disposed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Classification */}
        <Card>
          <CardHeader>
            <CardTitle>Classification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="vendor">Vendor</Label>
                <Select value={formData.vendorId} onValueChange={(value) => setFormData({ ...formData, vendorId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
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
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="location">Location *</Label>
                <Select value={formData.locationId} onValueChange={(value) => setFormData({ ...formData, locationId: value, binId: "" })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id.toString()}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bin">Bin</Label>
                <Select value={formData.binId} onValueChange={(value) => setFormData({ ...formData, binId: value })} disabled={!formData.locationId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bin" />
                  </SelectTrigger>
                  <SelectContent>
                    {bins.map((bin) => (
                      <SelectItem key={bin.id} value={bin.id.toString()}>
                        {bin.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="purchaseCost">Purchase Cost</Label>
                <Input
                  id="purchaseCost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.purchaseCost}
                  onChange={(e) => setFormData({ ...formData, purchaseCost: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="currentValue">Current Value</Label>
                <Input
                  id="currentValue"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.currentValue}
                  onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="depreciationRate">Depreciation Rate (%/year)</Label>
                <Input
                  id="depreciationRate"
                  type="number"
                  step="0.01"
                  value={formData.depreciationRate}
                  onChange={(e) => setFormData({ ...formData, depreciationRate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="warrantyEndDate">Warranty End Date</Label>
              <Input
                id="warrantyEndDate"
                type="date"
                value={formData.warrantyEndDate}
                onChange={(e) => setFormData({ ...formData, warrantyEndDate: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Asset
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href={`/app/assets/${params.id}`}>Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
