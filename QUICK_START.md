# AssetTrack - Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

### Step 1: Database Setup (2 minutes)

#### Option A: Local MSSQL
```sql
-- 1. Open SQL Server Management Studio (SSMS)
-- 2. Create new database
CREATE DATABASE AssetTrackDB;

-- 3. Execute schema.sql
-- File > Open > database/schema.sql
-- Execute (F5)

-- 4. Execute seed.sql
-- File > Open > database/seed.sql
-- Execute (F5)
```

#### Option B: Azure SQL
```bash
# Create database on Azure Portal
# Then run the SQL files using Azure Data Studio
```

### Step 2: Environment Variables (1 minute)

Create `.env.local` in project root:

```env
# Database
DB_USER=sa
DB_PASSWORD=YourPassword123
DB_SERVER=localhost
DB_NAME=AssetTrackDB
DB_ENCRYPT=false

# Authentication
JWT_SECRET=my-super-secret-jwt-key-change-in-production
COOKIE_SECRET=my-super-secret-cookie-key-change-in-production
DOMAIN_URL=http://localhost:3000
```

### Step 3: Install shadcn/ui Components (1 minute)

```bash
# Install all required shadcn/ui components at once
npx shadcn@latest add button input card dialog dropdown-menu select tabs checkbox label table badge textarea form skeleton toast avatar separator alert-dialog
```

### Step 4: Start Development Server (1 minute)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ✅ Test the Application

### 1. **Landing Page**
Visit: http://localhost:3000
- See professional marketing page
- Click through features
- Test navigation links

### 2. **Create Your First Account**

#### Register a New Company
1. Go to: http://localhost:3000/auth/client/register
2. Fill in the form:
   - **Company Name:** Test Company
   - **Full Name:** John Doe
   - **Email:** john@testcompany.com
   - **Password:** test123
3. Click "Create Account & Start Trial"
4. You'll be auto-logged in and redirected to dashboard!

### 3. **View Dashboard**
You should now see:
- ✅ Sidebar navigation
- ✅ Metrics cards (Total Assets, In Stock, etc.)
- ✅ Subscription status banner (Trial)
- ✅ Asset status breakdown
- ✅ Profile dropdown in header

### 4. **Test Admin Login**

1. Logout from client dashboard
2. Go to: http://localhost:3000/auth/admin/login
3. Use default admin credentials:
   - **Email:** admin@assettrack.com
   - **Password:** admin123
4. Login successful!

---

## 🧪 Test Authentication Flow

### Test Client Login
```
1. Go to http://localhost:3000/auth/client/login
2. Email: john@testcompany.com
3. Password: test123
4. Click "Sign In"
5. Redirected to /app/dashboard
```

### Test Logout
```
1. Click profile dropdown (top right)
2. Click "Logout"
3. Redirected to login page
4. Cookie cleared
```

### Test Protected Routes
```
1. Logout if logged in
2. Try to visit: http://localhost:3000/app/dashboard
3. You'll be redirected to login page
4. Middleware is working!
```

---

## 🎯 What Works Right Now

### ✅ **Public Pages**
- Landing page with all sections
- Features showcase
- Call-to-action buttons

### ✅ **Authentication**
- Client registration (creates tenant + user + trial subscription)
- Client login
- Admin login
- Logout
- Session management
- Route protection

### ✅ **Client Dashboard**
- Metrics display
- Subscription status
- Asset statistics
- Recent activity
- Sidebar navigation
- User profile dropdown

### ✅ **Database**
- 15 tables created
- Relationships configured
- Indexes for performance
- Seed data loaded (3 plans + admin user)

---

## 🔍 Verify Everything Works

### Check Database Tables
```sql
-- In SSMS, run:
SELECT COUNT(*) as TableCount
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE';
-- Should return 15+

-- Check plans
SELECT * FROM Plans;
-- Should show 3 plans: Starter, Professional, Enterprise

-- Check admin user
SELECT * FROM Users WHERE role = 'SUPER_ADMIN';
-- Should show admin@assettrack.com
```

### Check Your Registered Account
```sql
-- Check tenant created
SELECT * FROM Tenants WHERE companyName = 'Test Company';

-- Check user created
SELECT * FROM Users WHERE email = 'john@testcompany.com';

-- Check subscription created
SELECT s.*, p.name as PlanName
FROM Subscriptions s
JOIN Plans p ON s.planId = p.id
WHERE s.status = 'TRIAL';
```

---

## 🐛 Troubleshooting

### Issue: Database Connection Failed
```env
# Check your .env.local file:
# For local MSSQL on Windows:
DB_SERVER=localhost
DB_ENCRYPT=false

# For Azure SQL:
DB_SERVER=yourserver.database.windows.net
DB_ENCRYPT=true
```

### Issue: shadcn/ui Components Not Found
```bash
# Make sure components are installed:
npx shadcn@latest add button input card
```

### Issue: Toast Notifications Not Showing
Check that `<Toaster />` is in `src/app/layout.tsx`:
```tsx
import { Toaster } from "sonner";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
```

### Issue: Middleware Redirect Loop
Check `src/middleware.ts` - public routes should include:
```ts
const publicRoutes = ["/", "/features", "/about"];
const authRoutes = ["/auth/client/login", "/auth/client/register", "/auth/admin/login"];
```

---

## 📱 Mobile Testing

The application is fully responsive! Test on:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

All pages adapt automatically using Tailwind CSS breakpoints.

---

## 🎨 UI Components Used

From shadcn/ui:
- ✅ Button (with variants: default, outline, ghost, destructive)
- ✅ Input (with validation states)
- ✅ Card (with header, content, description)
- ✅ Dialog (for modals - will use later)
- ✅ Dropdown Menu (user profile menu)
- ✅ Badge (status indicators)
- ✅ Label (form labels)

From Sonner:
- ✅ Toast notifications (success, error, loading)

---

## 📊 Sample Data Available

After running seed.sql:

### Plans
1. **Starter** - ₹499/month (100 assets, 5 users)
2. **Professional** - ₹1,999/month (1000 assets, 25 users)
3. **Enterprise** - ₹4,999/month (unlimited)

### Default Admin
- Email: admin@assettrack.com
- Password: admin123
- Role: SUPER_ADMIN

### System Settings
- APP_NAME: AssetTrack
- DEPRECIATION_RATE: 15%
- TRIAL_PERIOD_DAYS: 30

---

## 🎉 You're Ready!

The application is now:
- ✅ Running on localhost:3000
- ✅ Connected to database
- ✅ Authentication working
- ✅ Dashboard displaying
- ✅ Ready for next features

### Next Steps:
1. Test account registration and login
2. Explore the dashboard
3. Check the sidebar navigation (links to be built next)
4. Review [COMPLETED_FEATURES.md](COMPLETED_FEATURES.md) for full details
5. See [IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md) for next phases

---

## 📞 Need Help?

Check these files:
- [INSTALLATION.md](INSTALLATION.md) - Detailed installation guide
- [COMPLETED_FEATURES.md](COMPLETED_FEATURES.md) - All implemented features
- [IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md) - Progress tracker
- [ASSET_TRACK_BLUEPRINT.md](ASSET_TRACK_BLUEPRINT.md) - Full technical blueprint
- [schemas.md](schemas.md) - Complete database schema
- [project-summary.md](project-summary.md) - Project overview

Happy tracking! 🚀
