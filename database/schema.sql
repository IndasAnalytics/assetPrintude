-- AssetTrack Database Schema for MSSQL
-- Execute this file to create all required tables
-- Updated to use INT IDENTITY(1,1) instead of GUID

-- 1. Tenants Table
CREATE TABLE Tenants (
    id INT PRIMARY KEY IDENTITY(1,1),
    companyName NVARCHAR(255) NOT NULL,
    subdomain NVARCHAR(100) NULL,
    contactEmail NVARCHAR(255) NOT NULL,
    contactPhone NVARCHAR(50) NULL,
    address NVARCHAR(500) NULL,
    status NVARCHAR(50) DEFAULT 'ACTIVE',
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE()
);

-- Create filtered unique index for subdomain (only when NOT NULL)
CREATE UNIQUE INDEX UQ_Tenants_Subdomain
ON Tenants(subdomain)
WHERE subdomain IS NOT NULL;

-- 2. Plans Table
CREATE TABLE Plans (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(500) NULL,
    monthlyPrice DECIMAL(10,2) NOT NULL,
    annualPrice DECIMAL(10,2) NULL,
    maxAssets INT NULL,
    maxUsers INT NULL,
    features NVARCHAR(MAX) NULL,
    isActive BIT DEFAULT 1,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE()
);

-- 3. Users Table
CREATE TABLE Users (
    id INT PRIMARY KEY IDENTITY(1,1),
    tenantId INT NULL,
    email NVARCHAR(255) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    fullName NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL DEFAULT 'CLIENT_USER',
    isActive BIT DEFAULT 1,
    lastLoginAt DATETIME2 NULL,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Users_Tenants FOREIGN KEY (tenantId) REFERENCES Tenants(id) ON DELETE CASCADE
);

-- 4. Sessions Table
CREATE TABLE Sessions (
    id INT PRIMARY KEY IDENTITY(1,1),
    userId INT NOT NULL,
    token NVARCHAR(500) NOT NULL UNIQUE,
    expiresAt DATETIME2 NOT NULL,
    createdAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Sessions_Users FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

-- 5. Subscriptions Table
CREATE TABLE Subscriptions (
    id INT PRIMARY KEY IDENTITY(1,1),
    tenantId INT NOT NULL,
    planId INT NOT NULL,
    status NVARCHAR(50) DEFAULT 'ACTIVE',
    startDate DATETIME2 NOT NULL,
    endDate DATETIME2 NOT NULL,
    autoRenew BIT DEFAULT 1,
    billingCycle NVARCHAR(20) DEFAULT 'MONTHLY',
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Subscriptions_Tenants FOREIGN KEY (tenantId) REFERENCES Tenants(id) ON DELETE CASCADE,
    CONSTRAINT FK_Subscriptions_Plans FOREIGN KEY (planId) REFERENCES Plans(id)
);

-- 6. Locations Table
CREATE TABLE Locations (
    id INT PRIMARY KEY IDENTITY(1,1),
    tenantId INT NOT NULL,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(500) NULL,
    parentId INT NULL,
    isActive BIT DEFAULT 1,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Locations_Tenants FOREIGN KEY (tenantId) REFERENCES Tenants(id) ON DELETE CASCADE,
    CONSTRAINT FK_Locations_Parent FOREIGN KEY (parentId) REFERENCES Locations(id)
);

-- 7. Bins Table
CREATE TABLE Bins (
    id INT PRIMARY KEY IDENTITY(1,1),
    tenantId INT NOT NULL,
    locationId INT NOT NULL,
    name NVARCHAR(255) NOT NULL,
    capacity INT NULL,
    description NVARCHAR(500) NULL,
    isActive BIT DEFAULT 1,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Bins_Tenants FOREIGN KEY (tenantId) REFERENCES Tenants(id) ON DELETE CASCADE,
    CONSTRAINT FK_Bins_Locations FOREIGN KEY (locationId) REFERENCES Locations(id) ON DELETE NO ACTION
);

-- 8. Categories Table
CREATE TABLE Categories (
    id INT PRIMARY KEY IDENTITY(1,1),
    tenantId INT NOT NULL,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(500) NULL,
    isActive BIT DEFAULT 1,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Categories_Tenants FOREIGN KEY (tenantId) REFERENCES Tenants(id) ON DELETE CASCADE
);

-- 9. Vendors Table
CREATE TABLE Vendors (
    id INT PRIMARY KEY IDENTITY(1,1),
    tenantId INT NOT NULL,
    name NVARCHAR(255) NOT NULL,
    contactPerson NVARCHAR(255) NULL,
    email NVARCHAR(255) NULL,
    phone NVARCHAR(50) NULL,
    address NVARCHAR(500) NULL,
    isActive BIT DEFAULT 1,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Vendors_Tenants FOREIGN KEY (tenantId) REFERENCES Tenants(id) ON DELETE CASCADE
);

-- 10. Employees Table
CREATE TABLE Employees (
    id INT PRIMARY KEY IDENTITY(1,1),
    tenantId INT NOT NULL,
    employeeCode NVARCHAR(50) NOT NULL,
    fullName NVARCHAR(255) NOT NULL,
    department NVARCHAR(255) NULL,
    designation NVARCHAR(255) NULL,
    email NVARCHAR(255) NULL,
    phone NVARCHAR(50) NULL,
    isActive BIT DEFAULT 1,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Employees_Tenants FOREIGN KEY (tenantId) REFERENCES Tenants(id) ON DELETE CASCADE,
    CONSTRAINT UQ_Employees_TenantCode UNIQUE (tenantId, employeeCode)
);

-- 11. Assets Table
CREATE TABLE Assets (
    id INT PRIMARY KEY IDENTITY(1,1),
    tenantId INT NOT NULL,
    assetCode NVARCHAR(50) NOT NULL,
    qrHash NVARCHAR(255) UNIQUE NOT NULL,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    serialNumber NVARCHAR(255) NULL,
    categoryId INT NOT NULL,
    vendorId INT NULL,
    locationId INT NOT NULL,
    binId INT NULL,
    status NVARCHAR(50) DEFAULT 'IN_STOCK',
    assignedToEmployeeId INT NULL,
    assignedAt DATETIME2 NULL,
    purchaseDate DATETIME2 NULL,
    purchaseCost DECIMAL(18,2) NULL,
    currentValue DECIMAL(18,2) NULL,
    depreciationRate DECIMAL(5,2) DEFAULT 15,
    totalCostOfOwnership DECIMAL(18,2) DEFAULT 0,
    warrantyEndDate DATETIME2 NULL,
    isActive BIT DEFAULT 1,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Assets_Tenants FOREIGN KEY (tenantId) REFERENCES Tenants(id) ON DELETE CASCADE,
    CONSTRAINT FK_Assets_Categories FOREIGN KEY (categoryId) REFERENCES Categories(id),
    CONSTRAINT FK_Assets_Vendors FOREIGN KEY (vendorId) REFERENCES Vendors(id),
    CONSTRAINT FK_Assets_Locations FOREIGN KEY (locationId) REFERENCES Locations(id),
    CONSTRAINT FK_Assets_Bins FOREIGN KEY (binId) REFERENCES Bins(id),
    CONSTRAINT FK_Assets_Employees FOREIGN KEY (assignedToEmployeeId) REFERENCES Employees(id),
    CONSTRAINT UQ_Assets_TenantCode UNIQUE (tenantId, assetCode)
);

-- 12. AssetHistory Table
CREATE TABLE AssetHistory (
    id INT PRIMARY KEY IDENTITY(1,1),
    assetId INT NOT NULL,
    tenantId INT NOT NULL,
    action NVARCHAR(100) NOT NULL,
    performedBy INT NOT NULL,
    previousValues NVARCHAR(MAX) NULL,
    newValues NVARCHAR(MAX) NULL,
    notes NVARCHAR(MAX) NULL,
    createdAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_AssetHistory_Assets FOREIGN KEY (assetId) REFERENCES Assets(id) ON DELETE CASCADE,
    CONSTRAINT FK_AssetHistory_Tenants FOREIGN KEY (tenantId) REFERENCES Tenants(id) ON DELETE NO ACTION,
    CONSTRAINT FK_AssetHistory_Users FOREIGN KEY (performedBy) REFERENCES Users(id)
);

-- 13. Repairs Table
CREATE TABLE Repairs (
    id INT PRIMARY KEY IDENTITY(1,1),
    tenantId INT NOT NULL,
    assetId INT NOT NULL,
    vendorId INT NULL,
    problemDescription NVARCHAR(MAX) NOT NULL,
    referenceNumber NVARCHAR(100) NULL,
    status NVARCHAR(50) DEFAULT 'OPEN',
    reportedAt DATETIME2 DEFAULT GETDATE(),
    startedAt DATETIME2 NULL,
    completedAt DATETIME2 NULL,
    estimatedCost DECIMAL(18,2) NULL,
    actualCost DECIMAL(18,2) NULL,
    resolutionNotes NVARCHAR(MAX) NULL,
    reportedBy INT NOT NULL,
    completedBy INT NULL,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Repairs_Tenants FOREIGN KEY (tenantId) REFERENCES Tenants(id) ON DELETE CASCADE,
    CONSTRAINT FK_Repairs_Assets FOREIGN KEY (assetId) REFERENCES Assets(id),
    CONSTRAINT FK_Repairs_Vendors FOREIGN KEY (vendorId) REFERENCES Vendors(id),
    CONSTRAINT FK_Repairs_ReportedBy FOREIGN KEY (reportedBy) REFERENCES Users(id),
    CONSTRAINT FK_Repairs_CompletedBy FOREIGN KEY (completedBy) REFERENCES Users(id)
);

-- 14. ActivityLogs Table
CREATE TABLE ActivityLogs (
    id INT PRIMARY KEY IDENTITY(1,1),
    tenantId INT NULL,
    userId INT NOT NULL,
    action NVARCHAR(255) NOT NULL,
    entityType NVARCHAR(100) NULL,
    entityId NVARCHAR(100) NULL,
    description NVARCHAR(MAX) NULL,
    ipAddress NVARCHAR(50) NULL,
    userAgent NVARCHAR(500) NULL,
    createdAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_ActivityLogs_Tenants FOREIGN KEY (tenantId) REFERENCES Tenants(id) ON DELETE CASCADE,
    CONSTRAINT FK_ActivityLogs_Users FOREIGN KEY (userId) REFERENCES Users(id)
);

-- 15. SystemSettings Table
CREATE TABLE SystemSettings (
    id INT PRIMARY KEY IDENTITY(1,1),
    settingKey NVARCHAR(100) UNIQUE NOT NULL,
    settingValue NVARCHAR(MAX) NOT NULL,
    settingType NVARCHAR(50) DEFAULT 'STRING',
    description NVARCHAR(500) NULL,
    isPublic BIT DEFAULT 0,
    updatedBy INT NULL,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_SystemSettings_Users FOREIGN KEY (updatedBy) REFERENCES Users(id)
);

-- Create Indexes for Performance
CREATE INDEX IX_Users_TenantId ON Users(tenantId);
CREATE INDEX IX_Users_Email ON Users(email);
CREATE INDEX IX_Users_Role ON Users(role);

CREATE INDEX IX_Sessions_Token ON Sessions(token);
CREATE INDEX IX_Sessions_UserId ON Sessions(userId);

CREATE INDEX IX_Subscriptions_TenantId ON Subscriptions(tenantId);
CREATE INDEX IX_Subscriptions_Status ON Subscriptions(status);

CREATE INDEX IX_Locations_TenantId ON Locations(tenantId);
CREATE INDEX IX_Locations_ParentId ON Locations(parentId);

CREATE INDEX IX_Categories_TenantId ON Categories(tenantId);

CREATE INDEX IX_Vendors_TenantId ON Vendors(tenantId);

CREATE INDEX IX_Employees_TenantId ON Employees(tenantId);
CREATE INDEX IX_Employees_EmployeeCode ON Employees(employeeCode);

CREATE INDEX IX_Assets_TenantId ON Assets(tenantId);
CREATE INDEX IX_Assets_TenantId_Status ON Assets(tenantId, status);
CREATE INDEX IX_Assets_TenantId_CategoryId ON Assets(tenantId, categoryId);
CREATE INDEX IX_Assets_QrHash ON Assets(qrHash);
CREATE INDEX IX_Assets_AssetCode ON Assets(assetCode);

CREATE INDEX IX_Repairs_TenantId ON Repairs(tenantId);
CREATE INDEX IX_Repairs_AssetId ON Repairs(assetId);
CREATE INDEX IX_Repairs_Status ON Repairs(status);

CREATE INDEX IX_ActivityLogs_TenantId ON ActivityLogs(tenantId);
CREATE INDEX IX_ActivityLogs_UserId ON ActivityLogs(userId);

PRINT 'Database schema created successfully with INT IDENTITY!';
