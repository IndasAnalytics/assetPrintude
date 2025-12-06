"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SubscriptionBanner } from "@/components/subscription-banner";
import {
  Package,
  PackageCheck,
  PackagePlus,
  Wrench,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface DashboardData {
  stats: {
    totalAssets: number;
    inStock: number;
    issued: number;
    underRepair: number;
    disposed: number;
    warrantyExpiring: number;
    openRepairs: number;
    totalValue: number;
  };
  recentAssets: Array<{
    id: number;
    assetCode: string;
    name: string;
    category: string;
    status: string;
  }>;
  recentRepairs: Array<{
    id: number;
    assetName: string;
    problemDescription: string;
    status: string;
    daysAgo: number;
  }>;
  subscription: {
    planName: string;
    status: string;
    daysUntilExpiry: number;
    renewalDate: string | null;
  };
}

export default function ClientDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await authFetch("/api/dashboard/stats");
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        toast.error("Failed to load dashboard data");
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
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="mt-2 h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
      </div>
    );
  }

  const { stats, recentAssets, recentRepairs, subscription } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your asset management</p>
        </div>
        <Link href="/app/assets/new">
          <Button className="gap-2">
            <PackagePlus className="h-4 w-4" />
            Add New Asset
          </Button>
        </Link>
      </div>

      {/* Subscription Warning Banner */}
      <SubscriptionBanner />

      {/* Subscription Status Banner */}
      {subscription && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Plan: <span className="font-bold">{subscription.planName}</span> | Status:{" "}
                  <span className="font-bold">{subscription.status}</span>
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {subscription.status === "TRIAL" && subscription.daysUntilExpiry > 0
                    ? `Trial expires in ${subscription.daysUntilExpiry} days`
                    : subscription.renewalDate
                    ? `Renews on ${new Date(subscription.renewalDate).toLocaleDateString()}`
                    : ""}
                </p>
              </div>
            </div>
            <Link href="/app/subscription">
              <Button variant="outline" size="sm" className="gap-2">
                View Details <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssets}</div>
            <p className="text-xs text-muted-foreground">
              Total value: ₹{stats.totalValue.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <PackageCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inStock}</div>
            <p className="text-xs text-muted-foreground">Available for use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Repair</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.underRepair}</div>
            <p className="text-xs text-muted-foreground">{stats.openRepairs} open requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warranty Expiring</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.warrantyExpiring}</div>
            <p className="text-xs text-muted-foreground">Next 90 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Asset Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Status Breakdown</CardTitle>
          <CardDescription>Distribution of assets by current status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.totalAssets > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <span className="text-sm font-medium">In Stock</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-64 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${(stats.inStock / stats.totalAssets) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold">{stats.inStock}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-orange-500" />
                    <span className="text-sm font-medium">Issued</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-64 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-orange-500"
                        style={{ width: `${(stats.issued / stats.totalAssets) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold">{stats.issued}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <span className="text-sm font-medium">Under Repair</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-64 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-yellow-500"
                        style={{ width: `${(stats.underRepair / stats.totalAssets) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold">{stats.underRepair}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-gray-500" />
                    <span className="text-sm font-medium">Disposed</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-64 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-gray-500"
                        style={{ width: `${(stats.disposed / stats.totalAssets) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold">{stats.disposed}</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No assets yet. Add your first asset to get started!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recently Added Assets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recently Added Assets</CardTitle>
              <CardDescription>Latest additions to your inventory</CardDescription>
            </div>
            <Link href="/app/assets">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentAssets.length > 0 ? (
              <div className="space-y-4">
                {recentAssets.map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{asset.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{asset.assetCode}</span>
                        <span>•</span>
                        <span>{asset.category}</span>
                      </div>
                    </div>
                    <Badge variant={asset.status === "IN_STOCK" ? "default" : "secondary"}>
                      {asset.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No recent assets</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Repairs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Repairs</CardTitle>
              <CardDescription>Active repair requests</CardDescription>
            </div>
            <Link href="/app/repairs">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentRepairs.length > 0 ? (
              <div className="space-y-4">
                {recentRepairs.map((repair) => (
                  <div key={repair.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{repair.assetName}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{repair.problemDescription.substring(0, 30)}...</span>
                        <span>•</span>
                        <span>{repair.daysAgo}d ago</span>
                      </div>
                    </div>
                    <Badge variant={repair.status === "OPEN" ? "destructive" : "outline"}>
                      {repair.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active repairs
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
