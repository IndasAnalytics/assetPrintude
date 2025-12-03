-- Direct fix for Tenants subdomain UNIQUE constraint
-- This script directly drops the constraint by its exact name

-- Step 1: Drop the existing UNIQUE constraint by exact name
BEGIN TRY
    ALTER TABLE Tenants DROP CONSTRAINT UQ__Tenants__E956860BE54A5ACA;
    PRINT 'Successfully dropped constraint: UQ__Tenants__E956860BE54A5ACA';
END TRY
BEGIN CATCH
    PRINT 'Error dropping constraint or constraint does not exist';
    PRINT ERROR_MESSAGE();
END CATCH
GO

-- Step 2: Create filtered unique index (allows multiple NULLs, enforces uniqueness for non-NULL values)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_Tenants_Subdomain' AND object_id = OBJECT_ID('Tenants'))
BEGIN
    CREATE UNIQUE INDEX UQ_Tenants_Subdomain
    ON Tenants(subdomain)
    WHERE subdomain IS NOT NULL;
    PRINT 'Created filtered unique index: UQ_Tenants_Subdomain';
END
ELSE
BEGIN
    PRINT 'Filtered unique index already exists';
END
GO

PRINT 'Fix completed!';
