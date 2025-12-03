-- Fix for Tenants subdomain UNIQUE constraint issue
-- Run this script to allow multiple NULL subdomains

-- Step 1: Find and drop the existing UNIQUE constraint
DECLARE @ConstraintName NVARCHAR(200);
SELECT @ConstraintName = name
FROM sys.key_constraints
WHERE parent_object_id = OBJECT_ID('Tenants')
  AND type = 'UQ'
  AND COL_NAME(parent_object_id, parent_column_id) = 'subdomain';

IF @ConstraintName IS NOT NULL
BEGIN
    DECLARE @SQL NVARCHAR(500);
    SET @SQL = 'ALTER TABLE Tenants DROP CONSTRAINT ' + @ConstraintName;
    EXEC sp_executesql @SQL;
    PRINT 'Dropped constraint: ' + @ConstraintName;
END
ELSE
BEGIN
    PRINT 'No UNIQUE constraint found on subdomain column';
END

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

PRINT 'Fix completed successfully!';
