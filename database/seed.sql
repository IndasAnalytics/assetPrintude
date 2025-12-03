-- AssetTrack Seed Data
-- Execute this after running schema.sql
-- Updated for INT IDENTITY schema

-- Insert Default Plans
INSERT INTO Plans (name, description, monthlyPrice, annualPrice, maxAssets, maxUsers, features, isActive)
VALUES
    ('Starter', 'Perfect for small teams getting started', 499.00, 4990.00, 100, 5,
     '{"qr_enabled": true, "reports": "basic", "support": "email"}', 1),
    ('Professional', 'For growing businesses with advanced needs', 1999.00, 19990.00, 1000, 25,
     '{"qr_enabled": true, "reports": "advanced", "support": "priority", "api_access": true}', 1),
    ('Enterprise', 'Unlimited everything for large organizations', 4999.00, 49990.00, NULL, NULL,
     '{"qr_enabled": true, "reports": "advanced", "support": "24x7", "api_access": true, "custom_integration": true, "white_label": true}', 1);

-- Insert Default Super Admin User (tenantId is NULL for super admins)
INSERT INTO Users (tenantId, email, password, fullName, role, isActive)
VALUES
    (NULL, 'admin@assettrack.com', 'admin123', 'Super Admin', 'SUPER_ADMIN', 1);

-- Insert Default System Settings
INSERT INTO SystemSettings (settingKey, settingValue, settingType, description, isPublic)
VALUES
    ('APP_NAME', 'AssetTrack', 'STRING', 'Application Name', 1),
    ('APP_LOGO_URL', '/logo.png', 'STRING', 'Application Logo URL', 1),
    ('THEME_PRIMARY_COLOR', '#3B82F6', 'STRING', 'Primary Theme Color', 1),
    ('DEPRECIATION_RATE', '15', 'NUMBER', 'Annual Depreciation Rate (%)', 0),
    ('QR_CODE_BASE_URL', 'http://localhost:3000/qr', 'STRING', 'Base URL for QR Codes', 0),
    ('TRIAL_PERIOD_DAYS', '30', 'NUMBER', 'Trial Period in Days', 0);

PRINT 'Seed data inserted successfully!';
PRINT '';
PRINT 'Default Super Admin Login:';
PRINT 'Email: admin@assettrack.com';
PRINT 'Password: admin123';
PRINT '';
PRINT 'IMPORTANT: Change the default admin password after first login!';
