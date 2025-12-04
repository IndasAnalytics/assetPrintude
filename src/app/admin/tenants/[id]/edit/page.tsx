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

interface Plan {
  id: number;
  name: string;
}

interface Tenant {
  id: number;
  companyName: string;
  subdomain: string | null;
  contactEmail: string;
  contactPhone: string | null;
  address: string | null;
  status: string;
  planId: number | null;
  maxUsers: number;
  maxAssets: number;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
}

export default function EditTenantPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);

  const [formData, setFormData] = useState({
    companyName: "",
    subdomain: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    status: "ACTIVE",
    planId: "",
    maxUsers: "10",
    maxAssets: "100",
    subscriptionStartDate: "",
    subscriptionEndDate: "",
  });

  useEffect(() => {
    if (params.id) {
      fetchTenant();
      fetchPlans();
    }
  }, [params.id]);

  const fetchTenant = async () => {
    try {
      setIsFetching(true);
      const response = await authFetch(`/api/admin/tenants/${params.id}`);
      const data = await response.json();

      if (data.success) {
        const tenant: Tenant = data.data;
        setFormData({
          companyName: tenant.companyName,
          subdomain: tenant.subdomain || "",
          contactEmail: tenant.contactEmail,
          contactPhone: tenant.contactPhone || "",
          address: tenant.address || "",
          status: tenant.status,
          planId: tenant.planId ? tenant.planId.toString() : "",
          maxUsers: tenant.maxUsers.toString(),
          maxAssets: tenant.maxAssets.toString(),
          subscriptionStartDate: tenant.subscriptionStartDate
            ? tenant.subscriptionStartDate.split("T")[0]
            : "",
          subscriptionEndDate: tenant.subscriptionEndDate
            ? tenant.subscriptionEndDate.split("T")[0]
            : "",
        });
      } else {
        toast.error("Failed to load tenant");
        router.push("/admin/tenants");
      }
    } catch (error) {
      console.error("Error fetching tenant:", error);
      toast.error("Failed to load tenant");
      router.push("/admin/tenants");
    } finally {
      setIsFetching(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await authFetch("/api/admin/plans");
      const data = await response.json();
      if (data.success) {
        setPlans(data.data);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyName || !formData.contactEmail) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authFetch(`/api/admin/tenants/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: formData.companyName,
          subdomain: formData.subdomain || null,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone || null,
          address: formData.address || null,
          status: formData.status,
          planId: formData.planId ? parseInt(formData.planId) : null,
          maxUsers: parseInt(formData.maxUsers),
          maxAssets: parseInt(formData.maxAssets),
          subscriptionStartDate: formData.subscriptionStartDate || null,
          subscriptionEndDate: formData.subscriptionEndDate || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Tenant updated successfully");
        router.push(`/admin/tenants/${params.id}`);
      } else {
        toast.error(data.message || "Failed to update tenant");
      }
    } catch (error) {
      console.error("Error updating tenant:", error);
      toast.error("Failed to update tenant");
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
          <Link href={`/admin/tenants/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Tenant</h1>
          <p className="text-muted-foreground">Update tenant information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  placeholder="e.g., Acme Corp"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subdomain">Subdomain</Label>
                <Input
                  id="subdomain"
                  placeholder="e.g., acme"
                  value={formData.subdomain}
                  onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="contact@example.com"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  placeholder="+1 234 567 8900"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Company address..."
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="TRIAL">Trial</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Details */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="plan">Plan</Label>
              <Select value={formData.planId} onValueChange={(value) => setFormData({ ...formData, planId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id.toString()}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="maxUsers">Max Users *</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  min="1"
                  value={formData.maxUsers}
                  onChange={(e) => setFormData({ ...formData, maxUsers: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxAssets">Max Assets *</Label>
                <Input
                  id="maxAssets"
                  type="number"
                  min="1"
                  value={formData.maxAssets}
                  onChange={(e) => setFormData({ ...formData, maxAssets: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="subscriptionStartDate">Subscription Start Date</Label>
                <Input
                  id="subscriptionStartDate"
                  type="date"
                  value={formData.subscriptionStartDate}
                  onChange={(e) => setFormData({ ...formData, subscriptionStartDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subscriptionEndDate">Subscription End Date</Label>
                <Input
                  id="subscriptionEndDate"
                  type="date"
                  value={formData.subscriptionEndDate}
                  onChange={(e) => setFormData({ ...formData, subscriptionEndDate: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Tenant
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href={`/admin/tenants/${params.id}`}>Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
