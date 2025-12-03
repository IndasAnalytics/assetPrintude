import { z } from "zod";

// Auth Validations
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Asset Validations
export const assetSchema = z.object({
  name: z.string().min(1, "Asset name is required"),
  description: z.string().optional(),
  serialNumber: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  locationId: z.string().min(1, "Location is required"),
  binId: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchaseCost: z.number().min(0, "Purchase cost must be positive").optional(),
  warrantyEndDate: z.string().optional(),
});

// Master Data Validations
export const locationSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

export const binSchema = z.object({
  name: z.string().min(1, "Bin name is required"),
  locationId: z.string().min(1, "Location is required"),
  capacity: z.number().min(0).optional(),
  description: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
});

export const vendorSchema = z.object({
  name: z.string().min(1, "Vendor name is required"),
  contactPerson: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const employeeSchema = z.object({
  employeeCode: z.string().min(1, "Employee code is required"),
  fullName: z.string().min(1, "Name is required"),
  department: z.string().optional(),
  designation: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
});

// Repair Validations
export const repairStartSchema = z.object({
  vendorId: z.string().optional(),
  problemDescription: z.string().min(1, "Problem description is required"),
  referenceNumber: z.string().optional(),
  estimatedCost: z.number().min(0).optional(),
});

export const repairCompleteSchema = z.object({
  actualCost: z.number().min(0, "Actual cost is required"),
  resolutionNotes: z.string().optional(),
  completedAt: z.string().optional(),
});

// Issue/Return Validations
export const issueAssetSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  purpose: z.string().optional(),
  notes: z.string().optional(),
});

export const returnAssetSchema = z.object({
  notes: z.string().optional(),
});

// Subscription & Plan Validations
export const planSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  description: z.string().optional(),
  monthlyPrice: z.number().min(0, "Monthly price must be positive"),
  annualPrice: z.number().min(0).optional(),
  maxAssets: z.number().min(0).optional(),
  maxUsers: z.number().min(0).optional(),
  features: z.string().optional(), // JSON string
});

export const subscriptionSchema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  planId: z.string().min(1, "Plan is required"),
  billingCycle: z.enum(["MONTHLY", "ANNUAL"]),
  startDate: z.string(),
  endDate: z.string(),
  autoRenew: z.boolean().default(true),
});

// Tenant Validations
export const tenantSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactEmail: z.string().email("Invalid email"),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  subdomain: z.string().optional(),
});

export const tenantStatusSchema = z.object({
  status: z.enum(["ACTIVE", "TRIAL", "SUSPENDED", "EXPIRED"]),
});

// User Profile Validations
export const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// System Settings Validations
export const systemSettingSchema = z.object({
  settingKey: z.string().min(1, "Setting key is required"),
  settingValue: z.string().min(1, "Setting value is required"),
  settingType: z.enum(["STRING", "JSON", "NUMBER", "BOOLEAN"]).default("STRING"),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

// Type exports for TypeScript
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type AssetFormData = z.infer<typeof assetSchema>;
export type LocationFormData = z.infer<typeof locationSchema>;
export type BinFormData = z.infer<typeof binSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type VendorFormData = z.infer<typeof vendorSchema>;
export type EmployeeFormData = z.infer<typeof employeeSchema>;
export type RepairStartFormData = z.infer<typeof repairStartSchema>;
export type RepairCompleteFormData = z.infer<typeof repairCompleteSchema>;
export type IssueAssetFormData = z.infer<typeof issueAssetSchema>;
export type PlanFormData = z.infer<typeof planSchema>;
export type SubscriptionFormData = z.infer<typeof subscriptionSchema>;
export type TenantFormData = z.infer<typeof tenantSchema>;
