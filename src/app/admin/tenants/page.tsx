"use client";

import { useState, useEffect } from "react";
import { Building2, Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { authFetch } from "@/lib/auth-client";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);

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

  const handleDeleteClick = (tenant: Tenant) => {
    setTenantToDelete(tenant);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tenantToDelete) return;

    try {
      const response = await authFetch(`/api/admin/tenants/${tenantToDelete.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Tenant deleted successfully");
        fetchTenants(); // Refresh list
        setDeleteDialogOpen(false);
        setTenantToDelete(null);
      } else {
        toast.error(data.message || "Failed to delete tenant");
      }
    } catch (error) {
      console.error("Error deleting tenant:", error);
      toast.error("Failed to delete tenant");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      ACTIVE: "default",
      TRIAL: "secondary",
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
        <Button asChild>
          <Link href="/admin/tenants/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Tenant
          </Link>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/tenants/${tenant.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/tenants/${tenant.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(tenant)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the tenant "{tenantToDelete?.companyName}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
