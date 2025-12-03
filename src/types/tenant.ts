export type TenantStatus = "ACTIVE" | "TRIAL" | "SUSPENDED" | "EXPIRED";

export interface Tenant {
  id: number;
  companyName: string;
  subdomain: string | null;
  contactEmail: string;
  contactPhone: string | null;
  address: string | null;
  status: TenantStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "SUSPENDED" | "CANCELLED" | "TRIAL";
export type BillingCycle = "MONTHLY" | "ANNUAL";

export interface Plan {
  id: number;
  name: string;
  description: string | null;
  monthlyPrice: number;
  annualPrice: number | null;
  maxAssets: number | null;
  maxUsers: number | null;
  features: string | null; // JSON string
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: number;
  tenantId: number;
  planId: number;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  billingCycle: BillingCycle;
  createdAt: Date;
  updatedAt: Date;
  plan?: Plan;
}

export interface Invoice {
  id: number;
  subscriptionId: number;
  tenantId: number;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
  invoiceDate: Date;
  dueDate: Date;
  paidAt: Date | null;
  paymentMethod: string | null;
  transactionId: string | null;
  createdAt: Date;
}

export interface TenantWithSubscription extends Tenant {
  subscription?: Subscription;
  userCount?: number;
  assetCount?: number;
}
