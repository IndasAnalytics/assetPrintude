"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Package, Wrench, Users, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { authFetch } from "@/lib/auth-client";

interface PlatformAnalytics {
  date: string;
  newTenants: number;
  newAssets: number;
  newRepairs: number;
  activeUsers: number;
}

export default function PlatformAnalyticsPage() {
  const [data, setData] = useState<PlatformAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState("30");

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await authFetch(`/api/admin/analytics/platform?days=${days}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        toast.error("Failed to load analytics");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    return {
      totalNewTenants: data.reduce((sum, item) => sum + item.newTenants, 0),
      totalNewAssets: data.reduce((sum, item) => sum + item.newAssets, 0),
      totalNewRepairs: data.reduce((sum, item) => sum + item.newRepairs, 0),
      totalActiveUsers: data.length > 0 ? data[data.length - 1].activeUsers : 0,
    };
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
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
          <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
          <p className="text-muted-foreground">Daily platform activity and growth metrics</p>
        </div>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Tenants</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.totalNewTenants}</div>
            <p className="text-xs text-muted-foreground">In the last {days} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.totalNewAssets}</div>
            <p className="text-xs text-muted-foreground">Across all tenants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Repairs</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.totalNewRepairs}</div>
            <p className="text-xs text-muted-foreground">Repair requests filed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.totalActiveUsers}</div>
            <p className="text-xs text-muted-foreground">Recent activity</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Activity</CardTitle>
          <CardDescription>Detailed breakdown of platform activity per day</CardDescription>
        </CardHeader>
        <CardContent>
          {data.length > 0 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-5 gap-4 border-b pb-2 text-sm font-medium text-muted-foreground">
                <div>Date</div>
                <div className="text-right">New Tenants</div>
                <div className="text-right">New Assets</div>
                <div className="text-right">New Repairs</div>
                <div className="text-right">Active Users</div>
              </div>
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {data.slice().reverse().map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-5 gap-4 rounded-lg border p-3 text-sm hover:bg-muted/50"
                  >
                    <div className="font-medium">
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                    <div className="text-right">
                      {item.newTenants > 0 && (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <TrendingUp className="h-3 w-3" />
                          {item.newTenants}
                        </span>
                      )}
                      {item.newTenants === 0 && "-"}
                    </div>
                    <div className="text-right">
                      {item.newAssets > 0 && (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <TrendingUp className="h-3 w-3" />
                          {item.newAssets}
                        </span>
                      )}
                      {item.newAssets === 0 && "-"}
                    </div>
                    <div className="text-right">
                      {item.newRepairs > 0 && (
                        <span className="inline-flex items-center gap-1 text-amber-600">
                          <TrendingUp className="h-3 w-3" />
                          {item.newRepairs}
                        </span>
                      )}
                      {item.newRepairs === 0 && "-"}
                    </div>
                    <div className="text-right">{item.activeUsers}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No activity data available for the selected period
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
