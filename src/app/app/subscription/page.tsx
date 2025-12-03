"use client";

import { CreditCard, CheckCircle2, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SubscriptionPage() {
  // In a real app, this would come from the API
  const subscription = {
    plan: "Professional",
    status: "ACTIVE",
    billingCycle: "MONTHLY",
    nextBillingDate: "2025-01-15",
    monthlyPrice: 49.99,
    maxAssets: 1000,
    maxUsers: 10,
    currentAssets: 247,
    currentUsers: 5,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing information
        </p>
      </div>

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
            <Badge variant="default">Active</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Plan Name</p>
              <p className="text-2xl font-bold">{subscription.plan}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Billing Cycle</p>
              <p className="text-2xl font-bold capitalize">
                {subscription.billingCycle.toLowerCase()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly Cost</p>
              <p className="text-2xl font-bold">₹{subscription.monthlyPrice}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                <Calendar className="inline h-4 w-4 mr-1" />
                Next Billing Date
              </p>
              <p className="text-2xl font-bold">{subscription.nextBillingDate}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button>Upgrade Plan</Button>
            <Button variant="outline">Change Billing Cycle</Button>
            <Button variant="destructive">Cancel Subscription</Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Usage</CardTitle>
          <CardDescription>Current usage against your plan limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Assets</span>
              <span className="text-sm text-muted-foreground">
                {subscription.currentAssets} / {subscription.maxAssets}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary"
                style={{
                  width: `${(subscription.currentAssets / subscription.maxAssets) * 100}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Users</span>
              <span className="text-sm text-muted-foreground">
                {subscription.currentUsers} / {subscription.maxUsers}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary"
                style={{
                  width: `${(subscription.currentUsers / subscription.maxUsers) * 100}%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
          <CardDescription>Everything included in your plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Up to {subscription.maxAssets} assets</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Up to {subscription.maxUsers} users</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>QR code generation and scanning</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Repair tracking and management</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Advanced reporting and analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Email support</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Your current payment method on file</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-muted">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">Visa ending in 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/2025</p>
              </div>
            </div>
            <Button variant="outline">Update</Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Your recent invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">December 2024</p>
                <p className="text-sm text-muted-foreground">Paid on Dec 15, 2024</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium">₹{subscription.monthlyPrice}</span>
                <Button variant="ghost" size="sm">
                  Download
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">November 2024</p>
                <p className="text-sm text-muted-foreground">Paid on Nov 15, 2024</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium">₹{subscription.monthlyPrice}</span>
                <Button variant="ghost" size="sm">
                  Download
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">October 2024</p>
                <p className="text-sm text-muted-foreground">Paid on Oct 15, 2024</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium">₹{subscription.monthlyPrice}</span>
                <Button variant="ghost" size="sm">
                  Download
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
