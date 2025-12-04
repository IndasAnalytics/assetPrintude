"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Edit, Trash2, ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { authFetch } from "@/lib/auth-client";

interface Tenant {
  id: number;
  companyName: string;
  subdomain: string | null;
  contactEmail: string;
  contactPhone: string | null;
  address: string | null;
  status: string;
  planName: string | null;
  maxUsers: number;
  maxAssets: number;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  createdAt: string;
}

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [extensionMonths, setExtensionMonths] = useState("1");

  useEffect(() => {
    if (params.id) {
      fetchTenant();
    }
  }, [params.id]);

  const fetchTenant = async () => {
    try {
      setIsLoading(true);
      const response = await authFetch(`/api/admin/tenants/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setTenant(data.data);
      } else {
        toast.error("Failed to load tenant");
      }
    } catch (error) {
      console.error("Error fetching tenant:", error);
      toast.error("Failed to load tenant");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await authFetch(`/api/admin/tenants/${params.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Tenant deleted successfully");
        router.push("/admin/tenants");
      } else {
        toast.error(data.message || "Failed to delete tenant");
      }
    } catch (error) {
      console.error("Error deleting tenant:", error);
      toast.error("Failed to delete tenant");
    }
  };

  const handleExtendSubscription = async () => {
    try {
      const months = parseInt(extensionMonths);
      if (isNaN(months) || months < 1) {
        toast.error("Please enter a valid number of months");
        return;
      }

      const response = await authFetch(`/api/admin/tenants/${params.id}/extend-subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ months }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Subscription extended by ${months} month(s)`);
        setIsExtendDialogOpen(false);
        fetchTenant(); // Refresh tenant data
      } else {
        toast.error(data.message || "Failed to extend subscription");
      }
    } catch (error) {
      console.error("Error extending subscription:", error);
      toast.error("Failed to extend subscription");
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

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Loading tenant...</div>;
  }

  if (!tenant) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Building2 className="h-16 w-16 text-muted-foreground" />
        <p className="text-muted-foreground">Tenant not found</p>
        <Button asChild>
          <Link href="/admin/tenants">Back to Tenants</Link>
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
            <Link href="/admin/tenants">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{tenant.companyName}</h1>
            <p className="text-muted-foreground">{tenant.contactEmail}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/tenants/${params.id}/edit`}>
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
                  This will permanently delete the tenant "{tenant.companyName}". This action cannot be undone.
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

      <div className="grid gap-6 md:grid-cols-2">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Company Information</CardTitle>
              {getStatusBadge(tenant.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Company Name</p>
              <p className="mt-1">{tenant.companyName}</p>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium text-muted-foreground">Subdomain</p>
              <p className="mt-1">{tenant.subdomain || "-"}</p>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium text-muted-foreground">Contact Email</p>
              <p className="mt-1">{tenant.contactEmail}</p>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium text-muted-foreground">Contact Phone</p>
              <p className="mt-1">{tenant.contactPhone || "-"}</p>
            </div>

            {tenant.address && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p className="mt-1">{tenant.address}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Subscription Information */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Plan</p>
              <p className="mt-1">{tenant.planName || "No plan assigned"}</p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Max Users</p>
                <p className="mt-1 text-2xl font-bold">{tenant.maxUsers}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Max Assets</p>
                <p className="mt-1 text-2xl font-bold">{tenant.maxAssets}</p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium text-muted-foreground">Subscription Start</p>
              <p className="mt-1">
                {tenant.subscriptionStartDate
                  ? format(new Date(tenant.subscriptionStartDate), "MMM dd, yyyy")
                  : "-"}
              </p>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium text-muted-foreground">Subscription End</p>
              <p className="mt-1">
                {tenant.subscriptionEndDate
                  ? format(new Date(tenant.subscriptionEndDate), "MMM dd, yyyy")
                  : "-"}
              </p>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium text-muted-foreground">Created At</p>
              <p className="mt-1 text-sm">
                {format(new Date(tenant.createdAt), "MMM dd, yyyy HH:mm")}
              </p>
            </div>

            <div className="pt-4">
              <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Calendar className="mr-2 h-4 w-4" />
                    Extend Subscription
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Extend Subscription</DialogTitle>
                    <DialogDescription>
                      Extend the subscription period for {tenant.companyName}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="months">Number of Months</Label>
                      <Input
                        id="months"
                        type="number"
                        min="1"
                        value={extensionMonths}
                        onChange={(e) => setExtensionMonths(e.target.value)}
                        placeholder="Enter months"
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Current end date: {tenant.subscriptionEndDate
                        ? format(new Date(tenant.subscriptionEndDate), "MMM dd, yyyy")
                        : "Not set"}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsExtendDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleExtendSubscription}>
                      Extend Subscription
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
