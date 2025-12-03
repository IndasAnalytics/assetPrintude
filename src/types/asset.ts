export type AssetStatus = "IN_STOCK" | "ISSUED" | "UNDER_REPAIR" | "SCRAPPED";

export interface Asset {
  id: number;
  tenantId: number;
  assetCode: string;
  qrHash: string;
  name: string;
  description: string | null;
  serialNumber: string | null;
  categoryId: number;
  vendorId: number | null;
  locationId: number;
  binId: number | null;
  status: AssetStatus;
  assignedToEmployeeId: number | null;
  assignedAt: Date | null;
  purchaseDate: Date | null;
  purchaseCost: number | null;
  currentValue: number | null;
  depreciationRate: number;
  totalCostOfOwnership: number;
  warrantyEndDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetWithRelations extends Asset {
  category?: Category;
  location?: Location;
  bin?: Bin;
  vendor?: Vendor;
  assignedToEmployee?: Employee;
}

export interface Location {
  id: number;
  tenantId: number;
  name: string;
  description: string | null;
  parentId: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Bin {
  id: number;
  tenantId: number;
  locationId: number;
  name: string;
  capacity: number | null;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: number;
  tenantId: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vendor {
  id: number;
  tenantId: number;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee {
  id: number;
  tenantId: number;
  employeeCode: string;
  fullName: string;
  department: string | null;
  designation: string | null;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type AssetAction =
  | "CREATED"
  | "EDITED"
  | "ISSUED"
  | "RETURNED"
  | "REPAIR_STARTED"
  | "REPAIR_COMPLETED"
  | "SCRAPPED";

export interface AssetHistory {
  id: number;
  assetId: number;
  tenantId: number;
  action: AssetAction;
  performedBy: number;
  previousValues: string | null; // JSON
  newValues: string | null; // JSON
  notes: string | null;
  createdAt: Date;
}

export type RepairStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface Repair {
  id: number;
  tenantId: number;
  assetId: number;
  vendorId: number | null;
  problemDescription: string;
  referenceNumber: string | null;
  status: RepairStatus;
  reportedAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  estimatedCost: number | null;
  actualCost: number | null;
  resolutionNotes: string | null;
  reportedBy: number;
  completedBy: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RepairWithRelations extends Repair {
  asset?: Asset;
  vendor?: Vendor;
}

export interface AssetFormData {
  name: string;
  description?: string;
  serialNumber?: string;
  categoryId: number;
  vendorId?: number;
  locationId: number;
  binId?: number;
  purchaseDate?: string;
  purchaseCost?: number;
  warrantyEndDate?: string;
}

export interface AssetFilters {
  category?: number;
  status?: AssetStatus;
  location?: number;
  employee?: number;
  search?: string;
}
