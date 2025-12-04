/**
 * Subscription validation utilities
 * Checks if a tenant's subscription is active and valid
 */

export interface SubscriptionStatus {
  isActive: boolean;
  isExpired: boolean;
  isReadOnly: boolean;
  daysRemaining: number | null;
  message: string | null;
}

/**
 * Check if subscription is active and not expired
 */
export function checkSubscriptionStatus(
  subscriptionEndDate: Date | string | null,
  status: string
): SubscriptionStatus {
  // If no subscription end date, assume unlimited access
  if (!subscriptionEndDate) {
    return {
      isActive: status === "ACTIVE",
      isExpired: false,
      isReadOnly: status !== "ACTIVE",
      daysRemaining: null,
      message: status !== "ACTIVE" ? "Account is not active" : null,
    };
  }

  const now = new Date();
  const endDate = new Date(subscriptionEndDate);
  const diffTime = endDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Subscription expired
  if (daysRemaining < 0) {
    return {
      isActive: false,
      isExpired: true,
      isReadOnly: true,
      daysRemaining: 0,
      message: "Your subscription has expired. Please contact your administrator to renew.",
    };
  }

  // Subscription expiring soon (within 7 days)
  if (daysRemaining <= 7) {
    return {
      isActive: status === "ACTIVE",
      isExpired: false,
      isReadOnly: status !== "ACTIVE",
      daysRemaining,
      message: `Your subscription will expire in ${daysRemaining} day(s). Please renew soon.`,
    };
  }

  // Subscription active
  return {
    isActive: status === "ACTIVE",
    isExpired: false,
    isReadOnly: status !== "ACTIVE",
    daysRemaining,
    message: null,
  };
}

/**
 * Check if user can perform write operations
 */
export function canPerformWriteOperation(subscriptionStatus: SubscriptionStatus): boolean {
  return subscriptionStatus.isActive && !subscriptionStatus.isExpired && !subscriptionStatus.isReadOnly;
}

/**
 * Get subscription warning message for UI
 */
export function getSubscriptionWarning(subscriptionStatus: SubscriptionStatus): string | null {
  if (subscriptionStatus.isExpired) {
    return "🔒 Your subscription has expired. You have read-only access. Please contact support to renew.";
  }

  if (subscriptionStatus.daysRemaining !== null && subscriptionStatus.daysRemaining <= 7) {
    return `⚠️ Your subscription expires in ${subscriptionStatus.daysRemaining} day(s). Please renew to continue using all features.`;
  }

  return null;
}
