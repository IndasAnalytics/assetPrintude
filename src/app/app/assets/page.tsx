"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Plus, Search, Filter, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Asset {
  id: number;
  assetCode: string;
  name: string;
  status: string;
  categoryName: string;
  locationName: string;
  assignedToName: string | null;
  purchaseCost: number | null;
  currentValue: number | null;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchAssets();
  }, [statusFilter]);

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      let url = "/api/assets";
      const params = new URLSearchParams();

      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (search) {
        params.append("search", search);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setAssets(data.data);
      } else {
        toast.error("Failed to load assets");
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
      toast.error("Failed to load assets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAssets();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      IN_STOCK: "default",
      ASSIGNED: "secondary",
      IN_REPAIR: "destructive",
      DISPOSED: "outline",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assets</h1>
          <p className="text-muted-foreground">Manage your organization's assets</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/app/assets/scan">
              <QrCode className="mr-2 h-4 w-4" />
              Scan QR
            </Link>
          </Button>
          <Button asChild>
            <Link href="/app/assets/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Asset
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, code, or serial number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="IN_STOCK">In Stock</SelectItem>
            <SelectItem value="ASSIGNED">Assigned</SelectItem>
            <SelectItem value="IN_REPAIR">In Repair</SelectItem>
            <SelectItem value="DISPOSED">Disposed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assets Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead className="text-right">Purchase Cost</TableHead>
              <TableHead className="text-right">Current Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading assets...
                </TableCell>
              </TableRow>
            ) : assets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Package className="h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No assets found</p>
                    <Button size="sm" asChild>
                      <Link href="/app/assets/new">Add your first asset</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/app/assets/${asset.id}`}
                      className="hover:underline"
                    >
                      {asset.assetCode}
                    </Link>
                  </TableCell>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>{asset.categoryName}</TableCell>
                  <TableCell>{asset.locationName}</TableCell>
                  <TableCell>{getStatusBadge(asset.status)}</TableCell>
                  <TableCell>{asset.assignedToName || "-"}</TableCell>
                  <TableCell className="text-right">
                    {asset.purchaseCost
                      ? `₹${asset.purchaseCost.toFixed(2)}`
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {asset.currentValue
                      ? `₹${asset.currentValue.toFixed(2)}`
                      : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
