export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface ApiError {
  success: false;
  message: string;
  error: string;
  statusCode?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface DashboardStats {
  totalAssets: number;
  inStock: number;
  issued: number;
  underRepair: number;
  scrapped: number;
  warrantyExpiring: number;
  openRepairs: number;
}

export interface TenantUsageStats {
  tenantId: string;
  companyName: string;
  totalUsers: number;
  totalAssets: number;
  assetsInStock: number;
  assetsIssued: number;
  assetsUnderRepair: number;
  openRepairs: number;
  subscriptionStatus: string;
  planName: string;
}

export interface ReportData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

export interface AssetStatusReport {
  status: string;
  count: number;
  percentage: number;
}

export interface RepairCostReport {
  month: string;
  totalCost: number;
  repairCount: number;
  averageCost: number;
}

export interface WarrantyExpiryReport {
  assetId: string;
  assetCode: string;
  assetName: string;
  warrantyEndDate: Date;
  daysUntilExpiry: number;
}
