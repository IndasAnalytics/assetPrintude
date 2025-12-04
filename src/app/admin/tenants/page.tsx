"use client";

import { useState, useEffect } from "react";
import { Building2, Plus, Search } from "lucide-react";
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
import { format } from "date-fns";
import { authFetch } from "@/lib/auth-client";

interface Tenant {
  id: number;
  companyName: string;
  subdomain: string | null;
  contactEmail: string;
  contactPhone: string | null;
  status: string;
  createdAt: string;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setIsLoading(true);
      const response = await authFetch("/api/admin/tenants");
      const data = await response.json();

      if (data.success) {
        setTenants(data.data);
      } else {
        toast.error("Failed to load tenants");
      }
    } catch (error) {
      console.error("Error fetching tenants:", error);
      toast.error("Failed to load tenants");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTenants = tenants.filter((tenant) =>
    tenant.companyName.toLowerCase().includes(search.toLowerCase()) ||
    tenant.contactEmail.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      ACTIVE: "default",
      SUSPENDED: "destructive",
      CANCELLED: "outline",
    };

    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
          <p className="text-muted-foreground">
            Manage all client organizations
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Tenant
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by company name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tenants Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Subdomain</TableHead>
              <TableHead>Contact Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading tenants...
                </TableCell>
              </TableRow>
            ) : filteredTenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Building2 className="h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No tenants found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">{tenant.companyName}</TableCell>
                  <TableCell>{tenant.subdomain || "-"}</TableCell>
                  <TableCell>{tenant.contactEmail}</TableCell>
                  <TableCell>{tenant.contactPhone || "-"}</TableCell>
                  <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                  <TableCell>
                    {format(new Date(tenant.createdAt), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
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
