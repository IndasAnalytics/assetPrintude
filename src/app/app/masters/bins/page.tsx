"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Search, Edit, Trash2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { authFetch } from "@/lib/auth-client";

interface Bin {
  id: number;
  name: string;
  locationName: string;
  capacity: number | null;
  description: string | null;
}

export default function BinsPage() {
  const [bins, setBins] = useState<Bin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchBins();
  }, []);

  const fetchBins = async () => {
    try {
      setIsLoading(true);
      const response = await authFetch("/api/bins");
      const data = await response.json();

      if (data.success) {
        setBins(data.data);
      } else {
        toast.error("Failed to load bins");
      }
    } catch (error) {
      console.error("Error fetching bins:", error);
      toast.error("Failed to load bins");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBins = bins.filter((bin) =>
    bin.name.toLowerCase().includes(search.toLowerCase()) ||
    bin.locationName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bins</h1>
          <p className="text-muted-foreground">Manage storage bins within locations</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Bin
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search bins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Bins Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bin Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredBins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <p className="text-muted-foreground">No bins found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredBins.map((bin) => (
                <TableRow key={bin.id}>
                  <TableCell className="font-medium">{bin.name}</TableCell>
                  <TableCell>{bin.locationName}</TableCell>
                  <TableCell>{bin.capacity || "-"}</TableCell>
                  <TableCell className="max-w-xs truncate">{bin.description || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
