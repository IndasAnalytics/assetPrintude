-- Migration: Add missing columns to Tenants table and isActive to other tables
-- Run this script on your AssetTrackDB database

USE AssetTrackDB;
GO

-- Add missing columns to Tenants table
PRINT 'Updating Tenants table...';

-- Add planId column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Tenants]') AND name = 'planId')
BEGIN
    ALTER TABLE Tenants ADD planId INT NULL;
    PRINT 'Added planId column to Tenants table';

    -- Add foreign key constraint to Plans table
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Tenants_Plans')
    BEGIN
        ALTER TABLE Tenants ADD CONSTRAINT FK_Tenants_Plans FOREIGN KEY (planId) REFERENCES Plans(id);
        PRINT 'Added FK constraint FK_Tenants_Plans';
    END
END
ELSE
BEGIN
    PRINT 'planId column already exists in Tenants table';
END
GO

-- Add maxUsers column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Tenants]') AND name = 'maxUsers')
BEGIN
    ALTER TABLE Tenants ADD maxUsers INT NOT NULL DEFAULT 10;
    PRINT 'Added maxUsers column to Tenants table';
END
ELSE
BEGIN
    PRINT 'maxUsers column already exists in Tenants table';
END
GO

-- Add maxAssets column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Tenants]') AND name = 'maxAssets')
BEGIN
    ALTER TABLE Tenants ADD maxAssets INT NOT NULL DEFAULT 100;
    PRINT 'Added maxAssets column to Tenants table';
END
ELSE
BEGIN
    PRINT 'maxAssets column already exists in Tenants table';
END
GO

-- Add subscriptionStartDate column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Tenants]') AND name = 'subscriptionStartDate')
BEGIN
    ALTER TABLE Tenants ADD subscriptionStartDate DATE NULL;
    PRINT 'Added subscriptionStartDate column to Tenants table';
END
ELSE
BEGIN
    PRINT 'subscriptionStartDate column already exists in Tenants table';
END
GO

-- Add subscriptionEndDate column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Tenants]') AND name = 'subscriptionEndDate')
BEGIN
    ALTER TABLE Tenants ADD subscriptionEndDate DATE NULL;
    PRINT 'Added subscriptionEndDate column to Tenants table';
END
ELSE
BEGIN
    PRINT 'subscriptionEndDate column already exists in Tenants table';
END
GO

-- Add isActive column to Tenants table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Tenants]') AND name = 'isActive')
BEGIN
    ALTER TABLE Tenants ADD isActive BIT NOT NULL DEFAULT 1;
    PRINT 'Added isActive column to Tenants table';
END
ELSE
BEGIN
    PRINT 'isActive column already exists in Tenants table';
END
GO

-- Add isActive column to Users table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'isActive')
BEGIN
    ALTER TABLE Users ADD isActive BIT NOT NULL DEFAULT 1;
    PRINT 'Added isActive column to Users table';
END
ELSE
BEGIN
    PRINT 'isActive column already exists in Users table';
END
GO

-- Add isActive column to Assets table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Assets]') AND name = 'isActive')
BEGIN
    ALTER TABLE Assets ADD isActive BIT NOT NULL DEFAULT 1;
    PRINT 'Added isActive column to Assets table';
END
ELSE
BEGIN
    PRINT 'isActive column already exists in Assets table';
END
GO

-- Plans table already has isActive column - skipping
PRINT 'Plans table already has isActive column - skipping';
GO

-- Add isActive column to Employees table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Employees]') AND name = 'isActive')
BEGIN
    ALTER TABLE Employees ADD isActive BIT NOT NULL DEFAULT 1;
    PRINT 'Added isActive column to Employees table';
END
ELSE
BEGIN
    PRINT 'isActive column already exists in Employees table';
END
GO

-- Add isActive column to Vendors table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Vendors]') AND name = 'isActive')
BEGIN
    ALTER TABLE Vendors ADD isActive BIT NOT NULL DEFAULT 1;
    PRINT 'Added isActive column to Vendors table';
END
ELSE
BEGIN
    PRINT 'isActive column already exists in Vendors table';
END
GO

-- Add isActive column to Categories table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Categories]') AND name = 'isActive')
BEGIN
    ALTER TABLE Categories ADD isActive BIT NOT NULL DEFAULT 1;
    PRINT 'Added isActive column to Categories table';
END
ELSE
BEGIN
    PRINT 'isActive column already exists in Categories table';
END
GO

-- Add isActive column to Locations table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Locations]') AND name = 'isActive')
BEGIN
    ALTER TABLE Locations ADD isActive BIT NOT NULL DEFAULT 1;
    PRINT 'Added isActive column to Locations table';
END
ELSE
BEGIN
    PRINT 'isActive column already exists in Locations table';
END
GO

-- Add isActive column to Bins table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Bins]') AND name = 'isActive')
BEGIN
    ALTER TABLE Bins ADD isActive BIT NOT NULL DEFAULT 1;
    PRINT 'Added isActive column to Bins table';
END
ELSE
BEGIN
    PRINT 'isActive column already exists in Bins table';
END
GO

-- Add isActive column to Repairs table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Repairs]') AND name = 'isActive')
BEGIN
    ALTER TABLE Repairs ADD isActive BIT NOT NULL DEFAULT 1;
    PRINT 'Added isActive column to Repairs table';
END
ELSE
BEGIN
    PRINT 'isActive column already exists in Repairs table';
END
GO

PRINT 'Migration completed successfully!';
PRINT 'All tables now have the isActive column for soft-delete functionality.';
GO
