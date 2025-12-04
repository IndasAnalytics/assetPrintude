"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Wrench, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { format } from "date-fns";
import { authFetch } from "@/lib/auth-client";

interface Repair {
  id: number;
  assetName: string;
  assetCode: string;
  problemDescription: string;
  status: string;
  reportedAt: string;
  reportedByName: string;
  vendorName: string | null;
  estimatedCost: number | null;
  actualCost: number | null;
}

export default function RepairsPage() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchRepairs();
  }, [statusFilter]);

  const fetchRepairs = async () => {
    try {
      setIsLoading(true);
      let url = "/api/repairs";

      if (statusFilter && statusFilter !== "all") {
        url += `?status=${statusFilter}`;
      }

      const response = await authFetch(url);
      const data = await response.json();

      if (data.success) {
        setRepairs(data.data);
      } else {
        toast.error("Failed to load repairs");
      }
    } catch (error) {
      console.error("Error fetching repairs:", error);
      toast.error("Failed to load repairs");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      OPEN: "destructive",
      IN_PROGRESS: "default",
      COMPLETED: "secondary",
      CANCELLED: "outline",
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
          <h1 className="text-3xl font-bold tracking-tight">Repairs</h1>
          <p className="text-muted-foreground">Track and manage asset repairs</p>
        </div>
        <Button asChild>
          <Link href="/app/repairs/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Repair Request
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Repairs Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Problem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reported By</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Reported Date</TableHead>
              <TableHead className="text-right">Estimated Cost</TableHead>
              <TableHead className="text-right">Actual Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading repairs...
                </TableCell>
              </TableRow>
            ) : repairs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Wrench className="h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No repair requests found</p>
                    <Button size="sm" asChild>
                      <Link href="/app/repairs/new">Create your first repair request</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              repairs.map((repair) => (
                <TableRow key={repair.id}>
                  <TableCell>
                    <div>
                      <Link
                        href={`/app/repairs/${repair.id}`}
                        className="font-medium hover:underline"
                      >
                        {repair.assetName}
                      </Link>
                      <p className="text-sm text-muted-foreground">{repair.assetCode}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {repair.problemDescription}
                  </TableCell>
                  <TableCell>{getStatusBadge(repair.status)}</TableCell>
                  <TableCell>{repair.reportedByName}</TableCell>
                  <TableCell>{repair.vendorName || "-"}</TableCell>
                  <TableCell>
                    {format(new Date(repair.reportedAt), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    {repair.estimatedCost ? `₹${repair.estimatedCost.toFixed(2)}` : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {repair.actualCost ? `₹${repair.actualCost.toFixed(2)}` : "-"}
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
