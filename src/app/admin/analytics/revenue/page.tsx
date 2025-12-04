"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, Users, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { authFetch } from "@/lib/auth-client";

interface RevenueAnalytics {
  month: string;
  year: number;
  monthlyRevenue: number;
  annualRevenue: number;
  newSubscriptions: number;
  cancelledSubscriptions: number;
  activeSubscriptions: number;
}

interface RevenueData {
  analytics: RevenueAnalytics[];
  totals: {
    totalMonthlyRevenue: number;
    totalAnnualRevenue: number;
    totalNewSubscriptions: number;
    totalCancelled: number;
    currentActive: number;
  };
}

export default function RevenueAnalyticsPage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState("12");

  useEffect(() => {
    fetchAnalytics();
  }, [months]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await authFetch(`/api/admin/analytics/revenue?months=${months}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        toast.error("Failed to load revenue analytics");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load revenue analytics");
    } finally {
      setLoading(false);
    }
  };

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

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Failed to load revenue analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenue Analytics</h1>
          <p className="text-muted-foreground">
            Monthly revenue trends and subscription metrics
          </p>
        </div>
        <Select value={months} onValueChange={setMonths}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6">Last 6 months</SelectItem>
            <SelectItem value="12">Last 12 months</SelectItem>
            <SelectItem value="24">Last 24 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{data.totals.totalMonthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">From monthly subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Annual Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{data.totals.totalAnnualRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">From annual subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totals.currentActive}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{data.totals.totalNewSubscriptions - data.totals.totalCancelled}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.totals.totalNewSubscriptions} new, {data.totals.totalCancelled} cancelled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Breakdown</CardTitle>
          <CardDescription>Revenue and subscription metrics by month</CardDescription>
        </CardHeader>
        <CardContent>
          {data.analytics.length > 0 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-7 gap-2 border-b pb-2 text-xs font-medium text-muted-foreground">
                <div>Period</div>
                <div className="text-right">Monthly Rev</div>
                <div className="text-right">Annual Rev</div>
                <div className="text-right">New</div>
                <div className="text-right">Cancelled</div>
                <div className="text-right">Active</div>
                <div className="text-right">Total Rev</div>
              </div>
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {data.analytics.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-7 gap-2 rounded-lg border p-3 text-sm hover:bg-muted/50"
                  >
                    <div className="font-medium">
                      {item.month} {item.year}
                    </div>
                    <div className="text-right">
                      ₹{item.monthlyRevenue.toLocaleString()}
                    </div>
                    <div className="text-right">
                      ₹{item.annualRevenue.toLocaleString()}
                    </div>
                    <div className="text-right">
                      {item.newSubscriptions > 0 ? (
                        <span className="text-green-600">+{item.newSubscriptions}</span>
                      ) : (
                        "-"
                      )}
                    </div>
                    <div className="text-right">
                      {item.cancelledSubscriptions > 0 ? (
                        <span className="text-red-600">-{item.cancelledSubscriptions}</span>
                      ) : (
                        "-"
                      )}
                    </div>
                    <div className="text-right font-medium">{item.activeSubscriptions}</div>
                    <div className="text-right font-semibold">
                      ₹{(item.monthlyRevenue + item.annualRevenue).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No revenue data available for the selected period
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Sources</CardTitle>
            <CardDescription>Breakdown by subscription type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Monthly Subscriptions</span>
                  <span className="text-sm font-bold">
                    ₹{data.totals.totalMonthlyRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${
                        ((data.totals.totalMonthlyRevenue /
                          (data.totals.totalMonthlyRevenue + data.totals.totalAnnualRevenue)) *
                          100) ||
                        0
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Annual Subscriptions</span>
                  <span className="text-sm font-bold">
                    ₹{data.totals.totalAnnualRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width: `${
                        ((data.totals.totalAnnualRevenue /
                          (data.totals.totalMonthlyRevenue + data.totals.totalAnnualRevenue)) *
                          100) ||
                        0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Health</CardTitle>
            <CardDescription>Growth and churn metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Churn Rate</span>
                <span className="text-2xl font-bold text-red-600">
                  {data.totals.currentActive > 0
                    ? ((data.totals.totalCancelled / data.totals.currentActive) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Growth Rate</span>
                <span className="text-2xl font-bold text-green-600">
                  {data.totals.currentActive > 0
                    ? (
                        ((data.totals.totalNewSubscriptions - data.totals.totalCancelled) /
                          data.totals.currentActive) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Retention Rate</span>
                <span className="text-2xl font-bold text-blue-600">
                  {data.totals.currentActive > 0
                    ? (
                        ((data.totals.currentActive - data.totals.totalCancelled) /
                          data.totals.currentActive) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
