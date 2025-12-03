"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  Package,
  Activity,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface DashboardStats {
  totalTenants: number;
  activeTenants: number;
  totalAssets: number;
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  totalRevenue: number;
}

interface RecentTenant {
  id: number;
  companyName: string;
  contactEmail: string;
  status: string;
  planName: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTenants, setRecentTenants] = useState<RecentTenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsResponse = await fetch("/api/admin/dashboard/stats");
      const statsResult = await statsResponse.json();

      if (statsResult.success) {
        setStats(statsResult.data);
      } else {
        toast.error("Failed to load statistics");
      }

      // Fetch recent tenants
      const tenantsResponse = await fetch("/api/admin/tenants?limit=5");
      const tenantsResult = await tenantsResponse.json();

      if (tenantsResult.success) {
        setRecentTenants(tenantsResult.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="mt-2 h-5 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of your AssetTrack platform</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/tenants/new">
            <Button>
              <Building2 className="mr-2 h-4 w-4" />
              Add Tenant
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTenants || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeTenants || 0} active organizations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Across all tenants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAssets || 0}</div>
            <p className="text-xs text-muted-foreground">Platform-wide</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(stats?.monthlyRevenue || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total: ₹{(stats?.totalRevenue || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeSubscriptions || 0}</div>
            <p className="text-xs text-muted-foreground">Paid plans active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/tenants">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Building2 className="mr-2 h-4 w-4" />
                Manage Tenants
              </Button>
            </Link>
            <Link href="/admin/plans">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Plans
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Analytics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start" asChild>
              <Link href="/admin/analytics/platform">
                <Activity className="mr-2 h-4 w-4" />
                Platform Analytics
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" asChild>
              <Link href="/admin/analytics/revenue">
                <DollarSign className="mr-2 h-4 w-4" />
                Revenue Analytics
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tenants */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Tenants</CardTitle>
            <CardDescription>Latest organizations that signed up</CardDescription>
          </div>
          <Link href="/admin/tenants">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentTenants.length > 0 ? (
            <div className="space-y-4">
              {recentTenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{tenant.companyName}</h4>
                      <Badge
                        variant={
                          tenant.status === "ACTIVE"
                            ? "default"
                            : tenant.status === "TRIAL"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {tenant.status}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{tenant.contactEmail}</span>
                      <span>•</span>
                      <span>{tenant.planName}</span>
                      <span>•</span>
                      <span>{new Date(tenant.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Link href={`/admin/tenants/${tenant.id}`}>
                    <Button variant="ghost" size="sm" className="gap-2">
                      View Details
                      <ArrowUpRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-8">
              No tenants registered yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
