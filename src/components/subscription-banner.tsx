"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { authFetch } from "@/lib/auth-client";
import Link from "next/link";

interface SubscriptionInfo {
  isExpired: boolean;
  daysRemaining: number | null;
  status: string;
  subscriptionEndDate: string | null;
}

export function SubscriptionBanner() {
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetchSubscriptionInfo();
  }, []);

  const fetchSubscriptionInfo = async () => {
    try {
      const response = await authFetch("/api/subscription/status");
      const data = await response.json();

      if (data.success && data.data) {
        const info = data.data;

        // Show banner if subscription is expired or expiring soon (within 7 days)
        if (info.isExpired || (info.daysRemaining !== null && info.daysRemaining <= 7)) {
          setSubscriptionInfo(info);
          setIsVisible(true);
        }
      }
    } catch (error) {
      console.error("Error fetching subscription info:", error);
    }
  };

  if (!isVisible || !subscriptionInfo) {
    return null;
  }

  const isExpired = subscriptionInfo.isExpired;
  const daysRemaining = subscriptionInfo.daysRemaining;

  return (
    <Alert
      variant={isExpired ? "destructive" : "default"}
      className="mb-6"
    >
      <div className="flex items-center gap-4">
        {isExpired ? (
          <AlertCircle className="h-5 w-5" />
        ) : (
          <Clock className="h-5 w-5" />
        )}
        <div className="flex-1">
          <AlertDescription>
            {isExpired ? (
              <span className="font-semibold">
                Your subscription has expired. You have read-only access.
              </span>
            ) : (
              <span className="font-semibold">
                Your subscription expires in {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}.
              </span>
            )}
            {" "}
            Please contact your administrator to renew your subscription.
          </AlertDescription>
        </div>
        <Button variant={isExpired ? "secondary" : "outline"} size="sm" asChild>
          <Link href="/app/subscription">
            View Details
          </Link>
        </Button>
      </div>
    </Alert>
  );
}
