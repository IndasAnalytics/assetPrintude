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

interface Vendor {
  id: number;
  name: string;
}

interface Repair {
  id: number;
  assetId: number;
  assetName: string;
  assetCode: string;
  vendorId: number | null;
  problemDescription: string;
  referenceNumber: string | null;
  status: string;
  estimatedCost: number | null;
  actualCost: number | null;
  resolutionNotes: string | null;
}

export default function EditRepairPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [assetInfo, setAssetInfo] = useState({ name: "", code: "" });

  const [formData, setFormData] = useState({
    vendorId: "",
    problemDescription: "",
    referenceNumber: "",
    status: "OPEN",
    estimatedCost: "",
    actualCost: "",
    resolutionNotes: "",
  });

  useEffect(() => {
    if (params.id) {
      fetchRepair();
      fetchVendors();
    }
  }, [params.id]);

  const fetchRepair = async () => {
    try {
      setIsFetching(true);
      const response = await fetch(`/api/repairs/${params.id}`);
      const data = await response.json();

      if (data.success) {
        const repair: Repair = data.data;
        setAssetInfo({ name: repair.assetName, code: repair.assetCode });
        setFormData({
          vendorId: repair.vendorId ? repair.vendorId.toString() : "",
          problemDescription: repair.problemDescription,
          referenceNumber: repair.referenceNumber || "",
          status: repair.status,
          estimatedCost: repair.estimatedCost ? repair.estimatedCost.toString() : "",
          actualCost: repair.actualCost ? repair.actualCost.toString() : "",
          resolutionNotes: repair.resolutionNotes || "",
        });
      } else {
        toast.error("Failed to load repair");
        router.push("/app/repairs");
      }
    } catch (error) {
      console.error("Error fetching repair:", error);
      toast.error("Failed to load repair");
      router.push("/app/repairs");
    } finally {
      setIsFetching(false);
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

    if (!formData.problemDescription) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/repairs/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: formData.vendorId ? parseInt(formData.vendorId) : null,
          problemDescription: formData.problemDescription,
          referenceNumber: formData.referenceNumber || null,
          status: formData.status,
          estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : null,
          actualCost: formData.actualCost ? parseFloat(formData.actualCost) : null,
          resolutionNotes: formData.resolutionNotes || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Repair updated successfully");
        router.push(`/app/repairs/${params.id}`);
      } else {
        toast.error(data.message || "Failed to update repair");
      }
    } catch (error) {
      console.error("Error updating repair:", error);
      toast.error("Failed to update repair");
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
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/app/repairs/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Update Repair Request</h1>
          <p className="text-muted-foreground">
            {assetInfo.name} ({assetInfo.code})
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Repair Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
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
              <Label htmlFor="resolutionNotes">Resolution Notes</Label>
              <Textarea
                id="resolutionNotes"
                placeholder="Describe how the problem was resolved..."
                rows={4}
                value={formData.resolutionNotes}
                onChange={(e) => setFormData({ ...formData, resolutionNotes: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="vendor">Vendor</Label>
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
              <Label htmlFor="referenceNumber">Reference Number</Label>
              <Input
                id="referenceNumber"
                placeholder="e.g., REP-2024-001"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="estimatedCost">Estimated Cost</Label>
                <Input
                  id="estimatedCost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="actualCost">Actual Cost</Label>
                <Input
                  id="actualCost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.actualCost}
                  onChange={(e) => setFormData({ ...formData, actualCost: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Repair
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/app/repairs/${params.id}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
