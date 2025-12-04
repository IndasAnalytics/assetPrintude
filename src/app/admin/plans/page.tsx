"use client";

import { useState, useEffect } from "react";
import { CreditCard, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { authFetch } from "@/lib/auth-client";

interface Plan {
  id: number;
  name: string;
  description: string | null;
  monthlyPrice: number;
  annualPrice: number | null;
  maxAssets: number | null;
  maxUsers: number | null;
  features: string | null;
  isActive: boolean;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const response = await authFetch("/api/admin/plans");
      const data = await response.json();

      if (data.success) {
        setPlans(data.data);
      } else {
        toast.error("Failed to load plans");
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to load plans");
    } finally {
      setIsLoading(false);
    }
  };

  const parseFeatures = (features: string | null): string[] => {
    if (!features) return [];
    try {
      const parsed = JSON.parse(features);
      // Ensure the parsed result is actually an array
      if (Array.isArray(parsed)) {
        return parsed;
      }
      console.warn("Features is not an array:", parsed);
      return [];
    } catch (error) {
      console.warn("Failed to parse features:", error);
      return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
          <p className="text-muted-foreground">
            Manage pricing plans for your customers
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Plan
        </Button>
      </div>

      {/* Plans Grid */}
      {isLoading ? (
        <div className="text-center py-12">Loading plans...</div>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No plans configured</p>
            <Button>Create your first plan</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className={!plan.isActive ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {!plan.isActive && <Badge variant="outline">Inactive</Badge>}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">₹{plan.monthlyPrice}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  {plan.annualPrice && (
                    <p className="text-sm text-muted-foreground mt-1">
                      ₹{plan.annualPrice}/year (save{" "}
                      {Math.round((1 - plan.annualPrice / (plan.monthlyPrice * 12)) * 100)}
                      %)
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

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    Edit
                  </Button>
                  <Button
                    variant={plan.isActive ? "destructive" : "default"}
                    className="flex-1"
                  >
                    {plan.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
