# AssetTrack Database Schemas

## Database Schema for Microsoft SQL Server (MSSQL)

This document contains all database table schemas for the AssetTrack multi-tenant SaaS application.

---

## Table of Contents
1. [Authentication & Users](#authentication--users)
2. [Tenants & Subscriptions](#tenants--subscriptions)
3. [Master Data](#master-data)
4. [Assets & Asset Management](#assets--asset-management)
5. [Repairs & Maintenance](#repairs--maintenance)
6. [Audit & Logs](#audit--logs)
7. [System Configuration](#system-configuration)
8. [Indexes & Performance](#indexes--performance)

---

## 1. Authentication & Users

### Users Table
```sql
CREATE TABLE Users (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    tenantId NVARCHAR(36) NULL, -- NULL for super admins
    email NVARCHAR(255) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL, -- Raw password storage as requested
    fullName NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL DEFAULT 'CLIENT_USER', -- SUPER_ADMIN, CLIENT_ADMIN, CLIENT_USER
    isActive BIT DEFAULT 1,
    lastLoginAt DATETIME2 NULL,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_Users_Tenants FOREIGN KEY (tenantId) REFERENCES Tenants(id) ON DELETE CASCADE
);
```

### Sessions Table
```sql
CREATE TABLE Sessions (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    userId NVARCHAR(36) NOT NULL,
    token NVARCHAR(500) NOT NULL UNIQUE,
    expiresAt DATETIME2 NOT NULL,
    createdAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_Sessions_Users FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);
```

---

## 2. Tenants & Subscriptions

### Tenants Table
```sql
CREATE TABLE Tenants (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    companyName NVARCHAR(255) NOT NULL,
    subdomain NVARCHAR(100) UNIQUE NULL, -- Optional for future subdomain feature
    contactEmail NVARCHAR(255) NOT NULL,
    contactPhone NVARCHAR(50) NULL,
    address NVARCHAR(500) NULL,
    status NVARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, TRIAL, SUSPENDED, EXPIRED
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE()
);
```

### Plans Table
```sql
CREATE TABLE Plans (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(100) NOT NULL, -- Starter, Professional, Enterprise
    description NVARCHAR(500) NULL,
    monthlyPrice DECIMAL(10,2) NOT NULL,
    annualPrice DECIMAL(10,2) NULL,
    maxAssets INT NULL, -- NULL = unlimited
    maxUsers INT NULL, -- NULL = unlimited
    features NVARCHAR(MAX) NULL, -- JSON string of features
    isActive BIT DEFAULT 1,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE()
);
```

### Subscriptions Table
```sql
CREATE TABLE Subscriptions (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    tenantId NVARCHAR(36) NOT NULL,
    planId NVARCHAR(36) NOT NULL,
    status NVARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, EXPIRED, SUSPENDED, CANCELLED, TRIAL
    startDate DATETIME2 NOT NULL,
    endDate DATETIME2 NOT NULL,
    autoRenew BIT DEFAULT 1,
    billingCycle NVARCHAR(20) DEFAULT 'MONTHLY', -- MONTHLY, ANNUAL
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_Subscriptions_Tenants FOREIGN KEY (tenantId) REFERENCES Tenants(id) ON DELETE CASCADE,
    CONSTRAINT FK_Subscriptions_Plans FOREIGN KEY (planId) REFERENCES Plans(id)
);
```

### Invoices Table
```sql
CREATE TABLE Invoices (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    subscriptionId NVARCHAR(36) NOT NULL,
    tenantId NVARCHAR(36) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status NVARCHAR(50) DEFAULT 'PENDING', -- PENDING, PAID, FAILED, CANCELLED
    invoiceDate DATETIME2 DEFAULT GETDATE(),
    dueDate DATETIME2 NOT NULL,
    paidAt DATETIME2 NULL,
    paymentMethod NVARCHAR(100) NULL,
    transactionId NVARCHAR(255) NULL,
    createdAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_Invoices_Subscriptions FOREIGN KEY (subscriptionId) REFERENCES Subscriptions(id),
    CONSTRAINT FK_Invoices_Tenants FOREIGN KEY (tenantId) REFERENCES Tenants(id)
);
```

---

## 3. Master Data

### Locations Table
```sql
CREATE TABLE Locations (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    tenantId NVARCHAR(36) NOT NULL,
    name NVARCHAR(255) NOT NULL,
    parentLocationId NVARCHAR(36) NULL, -- For hierarchical locations
    city NVARCHAR(100) NULL,
    zone NVARCHAR(100) NULL,
    address NVARCHAR(500) NULL,
    isActive BIT DEFAULT 1,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_Locations_Tenants FOREIGN KEY (tenantId) REFERENCES Tenants(id) ON DELETE CASCADE,
    CONSTRAINT FK_Locations_Parent FOREIGN KEY (parentLocationId) REFERENCES Locations(id)
);
```

### Bins Table
```sql
CREATE TABLE Bins (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    tenantId NVARCHAR(36) NOT NULL,
    locationId NVARCHAR(36) NOT NULL,
    name NVARCHAR(255) NOT NULL, -- Rack 1, Shelf B, etc.
    capacity INT NULL,
    description NVARCHAR(500) NULL,
    isActive BIT DEFAULT 1,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_Bins_Tenants FOREIGN KEY (tenantId) REFERENCES Tenants(id) ON DELETE CASCADE,
    CONSTRAINT FK_Bins_Locations FOREIGN KEY (locationId) REFERENCES Locations(id) ON DELETE NO ACTION
);
```

### Categories Table
```sql
CREATE TABLE Categories (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    tenantId NVARCHAR(36) NOT NULL,
    name NVARCHAR(255) NOT NULL, -- IT, Machinery, Furniture, etc.
    description NVARCHAR(500) NULL,
    isActive BIT DEFAULT 1,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_Categories_Tenants FOREIGN KEY (tenantId) REFERENCES Tenants(id) ON DELETE CASCADE
);
```

### Vendors Table
```sql
CREATE TABLE Vendors (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    tenantId NVARCHAR(36) NOT NULL,
    name NVARCHAR(255) NOT NULL,
    contactPerson NVARCHAR(255) NULL,
    email NVARCHAR(255) NULL,
    phone NVARCHAR(50) NULL,
    address NVARCHAR(500) NULL,
    vendorType NVARCHAR(50) DEFAULT 'BOTH', -- PURCHASE, REPAIR, BOTH
    isActive BIT DEFAULT 1,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_Vendors_Tenants FOREIGN KEY (tenantId) REFERENCES Tenants(id) ON DELETE CASCADE
);
```

### Employees Table
```sql
CREATE TABLE Employees (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    tenantId NVARCHAR(36) NOT NULL,
    employeeCode NVARCHAR(50) NOT NULL,
    name NVARCHAR(255) NOT NULL,
    department NVARCHAR(255) NULL,
    email NVARCHAR(255) NULL,
    phone NVARCHAR(50) NULL,
    isActive BIT DEFAULT 1,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_Employees_Tenants FOREIGN KEY (tenantId) REFERENCES Tenants(id) ON DELETE CASCADE,
    CONSTRAINT UQ_Employees_TenantCode UNIQUE (tenantId, employeeCode)
);
```

---

## 4. Assets & Asset Management

### Assets Table
```sql
CREATE TABLE Assets (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    tenantId NVARCHAR(36) NOT NULL,
    assetCode NVARCHAR(50) NOT NULL,
    qrHash NVARCHAR(255) UNIQUE NOT NULL, -- For QR code URL
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    serialNumber NVARCHAR(255) NULL,

    -- Classification
    categoryId NVARCHAR(36) NOT NULL,

    -- Location
    locationId NVARCHAR(36) NOT NULL,
    binId NVARCHAR(36) NULL,

    -- Status
    status NVARCHAR(50) DEFAULT 'IN_STOCK', -- IN_STOCK, ISSUED, UNDER_REPAIR, SCRAPPED

    -- Assignment
    assignedToEmployeeId NVARCHAR(36) NULL,
    assignedAt DATETIME2 NULL,

    -- Financial
    purchaseDate DATETIME2 NULL,
    purchaseCost DECIMAL(18,2) NULL,
    currentValue DECIMAL(18,2) NULL, -- Depreciated value
    totalCostOfOwnership DECIMAL(18,2) DEFAULT 0, -- Purchase + Repairs

    -- Warranty
    warrantyEndDate DATETIME2 NULL,

    -- Metadata
    isActive BIT DEFAULT 1,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_Assets_Tenants FOREIGN KEY (tenantId) REFERENCES Tenants(id) ON DELETE CASCADE,
    CONSTRAINT FK_Assets_Categories FOREIGN KEY (categoryId) REFERENCES Categories(id),
    CONSTRAINT FK_Assets_Locations FOREIGN KEY (locationId) REFERENCES Locations(id),
    CONSTRAINT FK_Assets_Bins FOREIGN KEY (binId) REFERENCES Bins(id),
    CONSTRAINT FK_Assets_Employees FOREIGN KEY (assignedToEmployeeId) REFERENCES Employees(id),
    CONSTRAINT UQ_Assets_TenantCode UNIQUE (tenantId, assetCode)
);
```

### AssetHistory Table (Audit Trail)
```sql
CREATE TABLE AssetHistory (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    assetId NVARCHAR(36) NOT NULL,
    tenantId NVARCHAR(36) NOT NULL,
    action NVARCHAR(100) NOT NULL, -- CREATED, EDITED, ISSUED, RETURNED, REPAIR_STARTED, REPAIR_COMPLETED, SCRAPPED
    performedBy NVARCHAR(36) NOT NULL, -- User ID
    previousValues NVARCHAR(MAX) NULL, -- JSON of changed fields
    newValues NVARCHAR(MAX) NULL, -- JSON of changed fields
    notes NVARCHAR(MAX) NULL,
    createdAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_AssetHistory_Assets FOREIGN KEY (assetId) REFERENCES Assets(id) ON DELETE CASCADE,
    CONSTRAINT FK_AssetHistory_Tenants FOREIGN KEY (tenantId) REFERENCES Tenants(id) ON DELETE NO ACTION,
    CONSTRAINT FK_AssetHistory_Users FOREIGN KEY (performedBy) REFERENCES Users(id)
);
```

---

## 5. Repairs & Maintenance

### Repairs Table
```sql
CREATE TABLE Repairs (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    tenantId NVARCHAR(36) NOT NULL,
    assetId NVARCHAR(36) NOT NULL,
    vendorId NVARCHAR(36) NULL,

    -- Repair Details
    problemDescription NVARCHAR(MAX) NOT NULL,
    referenceNumber NVARCHAR(100) NULL, -- RMA, Ticket number, etc.
    status NVARCHAR(50) DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, COMPLETED, CANCELLED

    -- Dates
    reportedAt DATETIME2 DEFAULT GETDATE(),
    startedAt DATETIME2 NULL,
    completedAt DATETIME2 NULL,

    -- Cost
    estimatedCost DECIMAL(18,2) NULL,
    actualCost DECIMAL(18,2) NULL,

    -- Resolution
    resolutionNotes NVARCHAR(MAX) NULL,

    -- Metadata
    reportedBy NVARCHAR(36) NOT NULL, -- User ID
    completedBy NVARCHAR(36) NULL, -- User ID
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_Repairs_Tenants FOREIGN KEY (tenantId) REFERENCES Tenants(id) ON DELETE CASCADE,
    CONSTRAINT FK_Repairs_Assets FOREIGN KEY (assetId) REFERENCES Assets(id),
    CONSTRAINT FK_Repairs_Vendors FOREIGN KEY (vendorId) REFERENCES Vendors(id),
    CONSTRAINT FK_Repairs_ReportedBy FOREIGN KEY (reportedBy) REFERENCES Users(id),
    CONSTRAINT FK_Repairs_CompletedBy FOREIGN KEY (completedBy) REFERENCES Users(id)
);
```

---

## 6. Audit & Logs

### ActivityLogs Table
```sql
CREATE TABLE ActivityLogs (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    tenantId NVARCHAR(36) NULL, -- NULL for super admin actions
    userId NVARCHAR(36) NOT NULL,
    action NVARCHAR(255) NOT NULL, -- LOGIN, CREATE_ASSET, DELETE_VENDOR, etc.
    entityType NVARCHAR(100) NULL, -- ASSET, VENDOR, EMPLOYEE, etc.
    entityId NVARCHAR(36) NULL,
    details NVARCHAR(MAX) NULL, -- JSON with additional info
    ipAddress NVARCHAR(50) NULL,
    userAgent NVARCHAR(500) NULL,
    createdAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_ActivityLogs_Tenants FOREIGN KEY (tenantId) REFERENCES Tenants(id) ON DELETE CASCADE,
    CONSTRAINT FK_ActivityLogs_Users FOREIGN KEY (userId) REFERENCES Users(id)
);
```

---

## 7. System Configuration

### SystemSettings Table
```sql
CREATE TABLE SystemSettings (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    settingKey NVARCHAR(100) UNIQUE NOT NULL,
    settingValue NVARCHAR(MAX) NOT NULL,
    settingType NVARCHAR(50) DEFAULT 'STRING', -- STRING, JSON, NUMBER, BOOLEAN
    description NVARCHAR(500) NULL,
    isPublic BIT DEFAULT 0, -- Public settings visible to all tenants
    updatedBy NVARCHAR(36) NULL, -- Super Admin User ID
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_SystemSettings_Users FOREIGN KEY (updatedBy) REFERENCES Users(id)
);
```

### TenantSettings Table
```sql
CREATE TABLE TenantSettings (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    tenantId NVARCHAR(36) NOT NULL,
    settingKey NVARCHAR(100) NOT NULL,
    settingValue NVARCHAR(MAX) NOT NULL,
    settingType NVARCHAR(50) DEFAULT 'STRING',
    updatedBy NVARCHAR(36) NULL,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_TenantSettings_Tenants FOREIGN KEY (tenantId) REFERENCES Tenants(id) ON DELETE CASCADE,
    CONSTRAINT FK_TenantSettings_Users FOREIGN KEY (updatedBy) REFERENCES Users(id),
    CONSTRAINT UQ_TenantSettings UNIQUE (tenantId, settingKey)
);
```

---

## 8. Indexes & Performance

### Performance Indexes
```sql
-- Users Indexes
CREATE INDEX IX_Users_TenantId ON Users(tenantId);
CREATE INDEX IX_Users_Email ON Users(email);
CREATE INDEX IX_Users_Role ON Users(role);

-- Sessions Indexes
CREATE INDEX IX_Sessions_Token ON Sessions(token);
CREATE INDEX IX_Sessions_UserId ON Sessions(userId);
CREATE INDEX IX_Sessions_ExpiresAt ON Sessions(expiresAt);

-- Tenants Indexes
CREATE INDEX IX_Tenants_Status ON Tenants(status);
CREATE INDEX IX_Tenants_Subdomain ON Tenants(subdomain) WHERE subdomain IS NOT NULL;

-- Subscriptions Indexes
CREATE INDEX IX_Subscriptions_TenantId ON Subscriptions(tenantId);
CREATE INDEX IX_Subscriptions_Status ON Subscriptions(status);
CREATE INDEX IX_Subscriptions_EndDate ON Subscriptions(endDate);

-- Assets Indexes (Critical for Performance)
CREATE INDEX IX_Assets_TenantId ON Assets(tenantId);
CREATE INDEX IX_Assets_TenantId_Status ON Assets(tenantId, status);
CREATE INDEX IX_Assets_TenantId_CategoryId ON Assets(tenantId, categoryId);
CREATE INDEX IX_Assets_TenantId_LocationId ON Assets(tenantId, locationId);
CREATE INDEX IX_Assets_QrHash ON Assets(qrHash);
CREATE INDEX IX_Assets_AssetCode ON Assets(assetCode);
CREATE INDEX IX_Assets_AssignedEmployee ON Assets(assignedToEmployeeId) WHERE assignedToEmployeeId IS NOT NULL;

-- Locations Indexes
CREATE INDEX IX_Locations_TenantId ON Locations(tenantId);
CREATE INDEX IX_Locations_ParentId ON Locations(parentLocationId) WHERE parentLocationId IS NOT NULL;

-- Bins Indexes
CREATE INDEX IX_Bins_TenantId ON Bins(tenantId);
CREATE INDEX IX_Bins_LocationId ON Bins(locationId);

-- Categories Indexes
CREATE INDEX IX_Categories_TenantId ON Categories(tenantId);

-- Vendors Indexes
CREATE INDEX IX_Vendors_TenantId ON Vendors(tenantId);
CREATE INDEX IX_Vendors_Type ON Vendors(vendorType);

-- Employees Indexes
CREATE INDEX IX_Employees_TenantId ON Employees(tenantId);
CREATE INDEX IX_Employees_Code ON Employees(employeeCode);

-- Repairs Indexes
CREATE INDEX IX_Repairs_TenantId ON Repairs(tenantId);
CREATE INDEX IX_Repairs_AssetId ON Repairs(assetId);
CREATE INDEX IX_Repairs_Status ON Repairs(status);
CREATE INDEX IX_Repairs_VendorId ON Repairs(vendorId) WHERE vendorId IS NOT NULL;

-- AssetHistory Indexes
CREATE INDEX IX_AssetHistory_AssetId ON AssetHistory(assetId);
CREATE INDEX IX_AssetHistory_TenantId ON AssetHistory(tenantId);
CREATE INDEX IX_AssetHistory_CreatedAt ON AssetHistory(createdAt DESC);

-- ActivityLogs Indexes
CREATE INDEX IX_ActivityLogs_TenantId ON ActivityLogs(tenantId);
CREATE INDEX IX_ActivityLogs_UserId ON ActivityLogs(userId);
CREATE INDEX IX_ActivityLogs_CreatedAt ON ActivityLogs(createdAt DESC);
CREATE INDEX IX_ActivityLogs_EntityType_EntityId ON ActivityLogs(entityType, entityId);
```

---

## Initial Seed Data

### Default Plans
```sql
INSERT INTO Plans (id, name, description, monthlyPrice, annualPrice, maxAssets, maxUsers, features, isActive)
VALUES
    (NEWID(), 'Starter', 'Basic plan for small teams', 499.00, 4990.00, 100, 5,
     '{"qr_enabled": true, "reports": "basic", "support": "email"}', 1),
    (NEWID(), 'Professional', 'For growing businesses', 1999.00, 19990.00, 1000, 25,
     '{"qr_enabled": true, "reports": "advanced", "support": "priority", "api_access": true}', 1),
    (NEWID(), 'Enterprise', 'Unlimited everything', 4999.00, 49990.00, NULL, NULL,
     '{"qr_enabled": true, "reports": "advanced", "support": "24x7", "api_access": true, "custom_integration": true}', 1);
```

### Default Super Admin
```sql
INSERT INTO Users (id, tenantId, email, password, fullName, role, isActive)
VALUES
    (NEWID(), NULL, 'admin@assettrack.com', 'admin123', 'Super Admin', 'SUPER_ADMIN', 1);
```

### Default System Settings
```sql
INSERT INTO SystemSettings (id, settingKey, settingValue, settingType, description, isPublic)
VALUES
    (NEWID(), 'APP_NAME', 'AssetTrack', 'STRING', 'Application Name', 1),
    (NEWID(), 'APP_LOGO_URL', '/logo.png', 'STRING', 'Application Logo URL', 1),
    (NEWID(), 'THEME_PRIMARY_COLOR', '#3B82F6', 'STRING', 'Primary Theme Color', 1),
    (NEWID(), 'DEPRECIATION_RATE', '15', 'NUMBER', 'Annual Depreciation Rate (%)', 0),
    (NEWID(), 'QR_CODE_BASE_URL', 'https://app.assettrack.com/qr', 'STRING', 'Base URL for QR Codes', 0),
    (NEWID(), 'TRIAL_PERIOD_DAYS', '30', 'NUMBER', 'Trial Period in Days', 0);
```

---

## Views for Reporting

### Asset Summary View
```sql
CREATE VIEW vw_AssetSummary AS
SELECT
    a.tenantId,
    a.id AS assetId,
    a.assetCode,
    a.name AS assetName,
    a.status,
    c.name AS categoryName,
    l.name AS locationName,
    b.name AS binName,
    e.name AS assignedToEmployee,
    a.purchaseCost,
    a.currentValue,
    a.totalCostOfOwnership,
    a.warrantyEndDate,
    CASE
        WHEN a.warrantyEndDate < GETDATE() THEN 'EXPIRED'
        WHEN a.warrantyEndDate < DATEADD(MONTH, 3, GETDATE()) THEN 'EXPIRING_SOON'
        ELSE 'VALID'
    END AS warrantyStatus,
    a.createdAt
FROM Assets a
LEFT JOIN Categories c ON a.categoryId = c.id
LEFT JOIN Locations l ON a.locationId = l.id
LEFT JOIN Bins b ON a.binId = b.id
LEFT JOIN Employees e ON a.assignedToEmployeeId = e.id
WHERE a.isActive = 1;
```

### Tenant Usage View
```sql
CREATE VIEW vw_TenantUsage AS
SELECT
    t.id AS tenantId,
    t.companyName,
    t.status AS tenantStatus,
    COUNT(DISTINCT u.id) AS totalUsers,
    COUNT(DISTINCT a.id) AS totalAssets,
    COUNT(DISTINCT CASE WHEN a.status = 'IN_STOCK' THEN a.id END) AS assetsInStock,
    COUNT(DISTINCT CASE WHEN a.status = 'ISSUED' THEN a.id END) AS assetsIssued,
    COUNT(DISTINCT CASE WHEN a.status = 'UNDER_REPAIR' THEN a.id END) AS assetsUnderRepair,
    COUNT(DISTINCT CASE WHEN r.status = 'OPEN' THEN r.id END) AS openRepairs,
    s.status AS subscriptionStatus,
    s.endDate AS subscriptionEndDate,
    p.name AS planName
FROM Tenants t
LEFT JOIN Users u ON t.id = u.tenantId AND u.isActive = 1
LEFT JOIN Assets a ON t.id = a.tenantId AND a.isActive = 1
LEFT JOIN Repairs r ON t.id = r.tenantId
LEFT JOIN Subscriptions s ON t.id = s.tenantId AND s.status = 'ACTIVE'
LEFT JOIN Plans p ON s.planId = p.id
GROUP BY t.id, t.companyName, t.status, s.status, s.endDate, p.name;
```

---

## Stored Procedures

### Calculate Asset Depreciation
```sql
CREATE PROCEDURE sp_CalculateAssetDepreciation
    @AssetId NVARCHAR(36)
AS
BEGIN
    DECLARE @PurchaseCost DECIMAL(18,2);
    DECLARE @PurchaseDate DATETIME2;
    DECLARE @DepreciationRate DECIMAL(5,2);
    DECLARE @YearsOld DECIMAL(10,2);
    DECLARE @CurrentValue DECIMAL(18,2);

    -- Get depreciation rate from settings
    SELECT @DepreciationRate = CAST(settingValue AS DECIMAL(5,2))
    FROM SystemSettings
    WHERE settingKey = 'DEPRECIATION_RATE';

    -- Get asset purchase details
    SELECT @PurchaseCost = purchaseCost, @PurchaseDate = purchaseDate
    FROM Assets
    WHERE id = @AssetId;

    -- Calculate years since purchase
    SET @YearsOld = DATEDIFF(DAY, @PurchaseDate, GETDATE()) / 365.0;

    -- Calculate current value (straight-line depreciation)
    SET @CurrentValue = @PurchaseCost * POWER((1 - @DepreciationRate/100), @YearsOld);

    -- Ensure value doesn't go below 0
    IF @CurrentValue < 0 SET @CurrentValue = 0;

    -- Update asset current value
    UPDATE Assets
    SET currentValue = @CurrentValue, updatedAt = GETDATE()
    WHERE id = @AssetId;

    SELECT @CurrentValue AS CalculatedValue;
END;
```

### Get Tenant Dashboard Stats
```sql
CREATE PROCEDURE sp_GetTenantDashboardStats
    @TenantId NVARCHAR(36)
AS
BEGIN
    -- Total Assets
    DECLARE @TotalAssets INT;
    SELECT @TotalAssets = COUNT(*) FROM Assets WHERE tenantId = @TenantId AND isActive = 1;

    -- Assets by Status
    DECLARE @InStock INT, @Issued INT, @UnderRepair INT, @Scrapped INT;
    SELECT
        @InStock = COUNT(CASE WHEN status = 'IN_STOCK' THEN 1 END),
        @Issued = COUNT(CASE WHEN status = 'ISSUED' THEN 1 END),
        @UnderRepair = COUNT(CASE WHEN status = 'UNDER_REPAIR' THEN 1 END),
        @Scrapped = COUNT(CASE WHEN status = 'SCRAPPED' THEN 1 END)
    FROM Assets
    WHERE tenantId = @TenantId AND isActive = 1;

    -- Warranty Expiring Soon (next 90 days)
    DECLARE @WarrantyExpiring INT;
    SELECT @WarrantyExpiring = COUNT(*)
    FROM Assets
    WHERE tenantId = @TenantId
        AND isActive = 1
        AND warrantyEndDate BETWEEN GETDATE() AND DATEADD(DAY, 90, GETDATE());

    -- Open Repairs
    DECLARE @OpenRepairs INT;
    SELECT @OpenRepairs = COUNT(*)
    FROM Repairs
    WHERE tenantId = @TenantId AND status IN ('OPEN', 'IN_PROGRESS');

    -- Return results
    SELECT
        @TotalAssets AS totalAssets,
        @InStock AS inStock,
        @Issued AS issued,
        @UnderRepair AS underRepair,
        @Scrapped AS scrapped,
        @WarrantyExpiring AS warrantyExpiring,
        @OpenRepairs AS openRepairs;
END;
```

---

## Migration Scripts Order

Execute these in order when setting up a new database:

1. **Tenants** (no dependencies)
2. **Plans** (no dependencies)
3. **Users** (depends on: Tenants)
4. **Sessions** (depends on: Users)
5. **Subscriptions** (depends on: Tenants, Plans)
6. **Invoices** (depends on: Subscriptions, Tenants)
7. **Locations** (depends on: Tenants)
8. **Bins** (depends on: Tenants, Locations)
9. **Categories** (depends on: Tenants)
10. **Vendors** (depends on: Tenants)
11. **Employees** (depends on: Tenants)
12. **Assets** (depends on: Tenants, Categories, Locations, Bins, Employees)
13. **AssetHistory** (depends on: Assets, Tenants, Users)
14. **Repairs** (depends on: Tenants, Assets, Vendors, Users)
15. **ActivityLogs** (depends on: Tenants, Users)
16. **SystemSettings** (no dependencies)
17. **TenantSettings** (depends on: Tenants, Users)
18. **Indexes** (after all tables)
19. **Views** (after all tables)
20. **Stored Procedures** (after all tables)
21. **Seed Data** (last)

---

## Backup & Maintenance

### Regular Maintenance Tasks
```sql
-- Update statistics weekly
UPDATE STATISTICS Assets;
UPDATE STATISTICS Repairs;
UPDATE STATISTICS ActivityLogs;

-- Rebuild indexes monthly
ALTER INDEX ALL ON Assets REBUILD;
ALTER INDEX ALL ON Repairs REBUILD;

-- Archive old activity logs (older than 1 year)
DELETE FROM ActivityLogs
WHERE createdAt < DATEADD(YEAR, -1, GETDATE());
```

This schema provides a complete, production-ready database structure for the AssetTrack multi-tenant SaaS application.