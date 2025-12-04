"use client";

import { useEffect, useState } from "react";
import { CreditCard, CheckCircle2, Calendar, AlertCircle, TrendingUp, Users as UsersIcon, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { authFetch } from "@/lib/auth-client";
import { format } from "date-fns";

interface SubscriptionData {
  planName: string | null;
  status: string;
  maxUsers: number;
  maxAssets: number;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  isExpired: boolean;
  daysRemaining: number | null;
  currentAssets: number;
  currentUsers: number;
  features: string[];
  isSuperAdmin?: boolean;
}

interface AvailablePlan {
  id: number;
  name: string;
  description: string | null;
  monthlyPrice: number;
  annualPrice: number | null;
  maxAssets: number | null;
  maxUsers: number | null;
  features: string | null;
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [availablePlans, setAvailablePlans] = useState<AvailablePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  useEffect(() => {
    fetchSubscription();
    fetchAvailablePlans();
  }, []);

  const fetchSubscription = async () => {
    try {
      setIsLoading(true);
      const response = await authFetch("/api/subscription/details");
      const data = await response.json();

      if (data.success) {
        setSubscription(data.data);
      } else {
        toast.error("Failed to load subscription details");
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
      toast.error("Failed to load subscription");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailablePlans = async () => {
    try {
      setIsLoadingPlans(true);
      const response = await authFetch("/api/plans");
      const data = await response.json();

      if (data.success) {
        setAvailablePlans(data.data);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const parseFeatures = (features: string | null): string[] => {
    if (!features) return [];
    try {
      const parsed = JSON.parse(features);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch (error) {
      return [];
    }
  };

  const getStatusBadge = (status: string, isExpired: boolean) => {
    if (isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }

    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      ACTIVE: "default",
      TRIAL: "secondary",
      SUSPENDED: "destructive",
      CANCELLED: "outline",
    };

    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const handleContactSupport = () => {
    toast.info("Please contact support at support@assettrack.com to manage your subscription.");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="mt-2 h-5 w-96" />
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">No subscription information available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription and view usage details
        </p>
      </div>

      {/* Expiry Warning */}
      {subscription.isExpired && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your subscription has expired. Please contact your administrator to renew your subscription.
            You currently have read-only access.
          </AlertDescription>
        </Alert>
      )}

      {!subscription.isExpired && subscription.daysRemaining !== null && subscription.daysRemaining <= 30 && (
        <Alert variant={subscription.daysRemaining <= 7 ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your subscription will expire in {subscription.daysRemaining} day{subscription.daysRemaining !== 1 ? "s" : ""}.
            Please contact your administrator to extend your subscription.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Plan
              </CardTitle>
              <CardDescription>Your active subscription details</CardDescription>
            </div>
            {getStatusBadge(subscription.status, subscription.isExpired)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Plan Name</p>
              <p className="text-2xl font-bold">{subscription.planName || "No Plan"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className="text-2xl font-bold capitalize">
                {subscription.isExpired ? "Expired" : subscription.status}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                <Calendar className="inline h-4 w-4 mr-1" />
                Start Date
              </p>
              <p className="text-lg font-bold">
                {subscription.subscriptionStartDate
                  ? format(new Date(subscription.subscriptionStartDate), "MMM dd, yyyy")
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                <Calendar className="inline h-4 w-4 mr-1" />
                End Date
              </p>
              <p className="text-lg font-bold">
                {subscription.subscriptionEndDate
                  ? format(new Date(subscription.subscriptionEndDate), "MMM dd, yyyy")
                  : "-"}
              </p>
            </div>
          </div>

          {subscription.daysRemaining !== null && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="font-medium">Time Remaining</span>
                </div>
                <span className="text-2xl font-bold">
                  {subscription.daysRemaining > 0 ? `${subscription.daysRemaining} days` : "Expired"}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleContactSupport}>Contact Support</Button>
            <Button variant="outline" onClick={handleContactSupport}>
              Upgrade Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Usage</CardTitle>
          <CardDescription>Current usage against your plan limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Assets</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {subscription.currentAssets} / {subscription.maxAssets}
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted">
              <div
                className={`h-3 rounded-full transition-all ${
                  subscription.currentAssets >= subscription.maxAssets
                    ? "bg-destructive"
                    : subscription.currentAssets >= subscription.maxAssets * 0.8
                    ? "bg-yellow-500"
                    : "bg-primary"
                }`}
                style={{
                  width: `${Math.min((subscription.currentAssets / subscription.maxAssets) * 100, 100)}%`,
                }}
              />
            </div>
            {subscription.currentAssets >= subscription.maxAssets && (
              <p className="mt-1 text-xs text-destructive">
                You've reached your asset limit. Please upgrade your plan to add more assets.
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Users</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {subscription.currentUsers} / {subscription.maxUsers}
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted">
              <div
                className={`h-3 rounded-full transition-all ${
                  subscription.currentUsers >= subscription.maxUsers
                    ? "bg-destructive"
                    : subscription.currentUsers >= subscription.maxUsers * 0.8
                    ? "bg-yellow-500"
                    : "bg-primary"
                }`}
                style={{
                  width: `${Math.min((subscription.currentUsers / subscription.maxUsers) * 100, 100)}%`,
                }}
              />
            </div>
            {subscription.currentUsers >= subscription.maxUsers && (
              <p className="mt-1 text-xs text-destructive">
                You've reached your user limit. Please upgrade your plan to add more users.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Features */}
      {subscription.features && subscription.features.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Plan Features</CardTitle>
            <CardDescription>Everything included in your plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {subscription.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>Contact support for assistance</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            For subscription changes, billing inquiries, or technical support, please contact your administrator
            or reach out to our support team.
          </p>
          <Button onClick={handleContactSupport}>
            Contact Support
          </Button>
        </CardContent>
      </Card>

      {/* Available Plans */}
      {!subscription?.isSuperAdmin && availablePlans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>
              Explore other subscription plans available for your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availablePlans.map((plan) => (
                <Card key={plan.id} className="relative">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {plan.description}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold">₹{plan.monthlyPrice}</span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                        {plan.annualPrice && (
                          <p className="text-sm text-muted-foreground mt-1">
                            ₹{plan.annualPrice}/year (save{" "}
                            {Math.round((1 - plan.annualPrice / (plan.monthlyPrice * 12)) * 100)}%)
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>
                            {plan.maxAssets === null
                              ? "Unlimited assets"
                              : `Up to ${plan.maxAssets} assets`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>
                            {plan.maxUsers === null
                              ? "Unlimited users"
                              : `Up to ${plan.maxUsers} users`}
                          </span>
                        </div>
                        {parseFeatures(plan.features).map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      <Button
                        className="w-full"
                        variant={
                          subscription?.planName === plan.name ? "outline" : "default"
                        }
                        disabled={subscription?.planName === plan.name}
                        onClick={handleContactSupport}
                      >
                        {subscription?.planName === plan.name
                          ? "Current Plan"
                          : "Contact to Upgrade"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
