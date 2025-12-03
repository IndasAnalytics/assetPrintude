# AssetTrack SaaS Implementation Blueprint

## Project Overview
Multi-tenant Asset Management System with QR-based tracking, built with Next.js 16, React 19, TypeScript, shadcn/ui, and MSSQL.

## Dependencies to Install

### Core Dependencies
```bash
# Core Framework
npm install next@latest react@latest react-dom@latest typescript@latest

# UI Components & Styling
npm install tailwindcss@latest class-variance-authority clsx tailwind-merge lucide-react

# shadcn/ui Components
npm install @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-checkbox @radix-ui/react-label @radix-ui/react-toast
npm install @hookform/resolvers react-hook-form zod

# Toast Notifications
npm install sonner

# Charts
npm install recharts

# Database (Custom MSSQL)
npm install mssql

# QR Code Handling
npm install qrcode @types/qrcode html5-qrcode

# Date Handling
npm install date-fns

# Cookie-based Auth
npm install js-cookie @types/js-cookie crypto-js
```

### Development Dependencies
```bash
npm install -D @types/node @types/react @types/react-dom eslint eslint-config-next
```

---

## Architecture & Tech Stack

### Frontend
- **Next.js 16** (Latest) (App Router)
- **React 19**
- **TypeScript 5**
- **shadcn/ui + Tailwind CSS 4** for professional styling
- **HTML5 QR Code Scanner** for mobile scanning
- **Sonner** for toast notifications (instead of alerts)
- **Dialog** components for modals
- **Responsive design** with mobile-first approach

### Backend (Next.js API Routes)
- **Next.js API Routes** for all CRUD operations
- **Multi-tenant isolation** using tenantId
- **Middleware** for authentication and tenant detection
- **Type-safe API responses** with proper error handling

### Database
- **Microsoft SQL Server (MSSQL)** with custom database layer
- **Tenant isolation** with proper indexing
- **Manual SQL migrations** for schema versioning
- **Connection pooling** for production performance

### Authentication
- **Custom cookie-based authentication**
- **Email/password login** with raw password storage
- **Role-based access control**: Super Admin, Client Admin, Client User
- **Session management** with secure HTTP-only cookies
- **JWT tokens** stored in cookies for API authentication
- **Middleware-based route protection**

### UI/UX Components
- **shadcn/ui** component library
- **Professional theming** with consistent design system
- **Responsive layouts** for desktop, tablet, and mobile
- **Loading states** and skeleton screens
- **Form validation** with real-time feedback

---

## Project Structure

```
src/
├── app/
│   ├── (marketing)/                 # Public website pages
│   │   ├── page.tsx                # Landing page
│   │   ├── features/
│   │   ├── pricing/
│   │   └── about/
│   ├── auth/                        # Authentication pages
│   │   ├── client/
│   │   │   ├── login/
│   │   │   └── register/
│   │   └── admin/
│   │       └── login/
│   ├── app/                         # Client workspace (tenant-specific)
│   │   ├── layout.tsx              # Client app layout
│   │   ├── dashboard/
│   │   ├── assets/
│   │   │   ├── page.tsx           # Asset list
│   │   │   ├── [id]/              # Asset details
│   │   │   ├── add/
│   │   │   └── scan/              # QR scanner
│   │   ├── repairs/
│   │   ├── masters/
│   │   │   ├── locations/
│   │   │   ├── categories/
│   │   │   ├── vendors/
│   │   │   └── employees/
│   │   ├── reports/
│   │   └── subscription/
│   ├── admin/                      # Super admin portal
│   │   ├── layout.tsx             # Admin layout
│   │   ├── dashboard/
│   │   ├── tenants/
│   │   ├── plans/
│   │   ├── subscriptions/
│   │   └── analytics/
│   ├── api/                        # API routes
│   │   ├── auth/
│   │   ├── assets/
│   │   ├── repairs/
│   │   ├── masters/
│   │   ├── qr/
│   │   ├── tenants/
│   │   ├── subscriptions/
│   │   └── admin/
│   ├── globals.css
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Redirect to landing
├── components/
│   ├── ui/                         # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── toast.tsx (Sonner)
│   │   ├── table.tsx
│   │   ├── form.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   ├── checkbox.tsx
│   │   └── tabs.tsx
│   ├── forms/                      # Form components
│   │   ├── asset-form.tsx
│   │   ├── repair-form.tsx
│   │   ├── employee-form.tsx
│   │   ├── location-form.tsx
│   │   └── vendor-form.tsx
│   ├── charts/                     # Dashboard charts
│   │   ├── asset-chart.tsx
│   │   ├── repair-chart.tsx
│   │   └── revenue-chart.tsx
│   ├── layout/                     # Layout components
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   ├── navigation.tsx
│   │   └── footer.tsx
│   └── qr/                         # QR code components
│       ├── qr-scanner.tsx
│       ├── qr-generator.tsx
│       └── qr-label.tsx
├── lib/
│   ├── auth.ts                     # Auth configuration
│   ├── database.ts                 # Database connection
│   ├── validations.ts              # Zod schemas
│   ├── permissions.ts              # Role-based permissions
│   ├── utils.ts                    # Utility functions
│   ├── mssql.ts                    # MSSQL specific utilities
│   └── cookies.ts                  # Cookie management utilities
├── types/
│   ├── auth.ts
│   ├── asset.ts
│   ├── tenant.ts
│   └── api.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useTenant.ts
│   └── useAssets.ts
├── styles/
│   └── globals.css                 # Global styles with theme
├── database/
│   ├── migrations/                 # SQL migration files
│   ├── schema.sql                  # Database schema definition
│   └── seed.sql                    # Database seeding data
└── middleware/
    └── auth.ts                     # Authentication middleware
```

---

## Pages Required

### Public Marketing Pages (3 pages)
1. **Landing Page** (`/`) - Hero, features, pricing, CTAs
2. **Features Page** (`/features`) - Detailed feature showcase
3. **About Page** (`/about`) - Company information

### Authentication Pages (3 pages)
1. **Client Login** (`/auth/client/login`)
2. **Client Registration** (`/auth/client/register`)
3. **Admin Login** (`/auth/admin/login`)

### Client Workspace Pages (15 pages)
1. **Dashboard** (`/app/dashboard`) - Overview with charts and metrics
2. **Asset List** (`/app/assets`) - Main asset registry
3. **Asset Details** (`/app/assets/[id]`) - Individual asset profile
4. **Add Asset** (`/app/assets/add`) - Asset creation form
5. **QR Scanner** (`/app/assets/scan`) - Mobile QR scanning
6. **Repairs List** (`/app/repairs`) - Repair management
7. **Locations & Bins** (`/app/masters/locations`) - Location management
8. **Categories** (`/app/masters/categories`) - Category management
9. **Vendors** (`/app/masters/vendors`) - Vendor management
10. **Employees** (`/app/masters/employees`) - Employee management
11. **Asset Reports** (`/app/reports/assets`) - Asset analytics
12. **Repair Reports** (`/app/reports/repairs`) - Repair analytics
13. **Financial Reports** (`/app/reports/financial`) - Cost analysis
14. **Subscription** (`/app/subscription`) - Current plan and billing
15. **Profile Settings** (`/app/profile`) - User settings

### Super Admin Portal Pages (6 pages)
1. **Admin Dashboard** (`/admin/dashboard`) - SaaS overview
2. **Tenants Management** (`/admin/tenants`) - Client management
3. **Plans Management** (`/admin/plans`) - Subscription plans
4. **Subscriptions** (`/admin/subscriptions`) - All subscriptions
5. **Analytics** (`/admin/analytics`) - Platform analytics
6. **System Settings** (`/admin/settings`) - Platform configuration

**Total Pages: 27**

---

## API Endpoints Required

### Authentication APIs (6 endpoints)
1. `POST /api/auth/client/login` - Client authentication
2. `POST /api/auth/client/register` - Client registration
3. `POST /api/auth/admin/login` - Admin authentication
4. `POST /api/auth/logout` - Logout
5. `GET /api/auth/me` - Get current user
6. `PUT /api/auth/profile` - Update profile

### Asset Management APIs (12 endpoints)
1. `GET /api/assets` - List assets (with filters)
2. `POST /api/assets` - Create asset
3. `GET /api/assets/[id]` - Get asset details
4. `PUT /api/assets/[id]` - Update asset
5. `DELETE /api/assets/[id]` - Delete asset
6. `POST /api/assets/[id]/issue` - Issue asset to employee
7. `POST /api/assets/[id]/return` - Return asset
8. `POST /api/assets/[id]/repair` - Send to repair
9. `POST /api/assets/[id]/scrap` - Mark as scrapped
10. `GET /api/assets/[id]/history` - Asset audit log
11. `POST /api/assets/[id]/qr/print` - Generate QR label
12. `GET /api/assets/export` - Export assets data

### Repair Management APIs (8 endpoints)
1. `GET /api/repairs` - List repairs
2. `POST /api/repairs` - Create repair request
3. `GET /api/repairs/[id]` - Get repair details
4. `PUT /api/repairs/[id]` - Update repair
5. `POST /api/repairs/[id]/complete` - Complete repair
6. `GET /api/repairs/vendors` - Get repair vendors
7. `GET /api/repairs/stats` - Repair statistics
8. `GET /api/repairs/export` - Export repairs data

### Master Data APIs (20 endpoints)
1. **Locations** (5 endpoints)
   - `GET /api/masters/locations`
   - `POST /api/masters/locations`
   - `GET /api/masters/locations/[id]`
   - `PUT /api/masters/locations/[id]`
   - `DELETE /api/masters/locations/[id]`

2. **Bins** (5 endpoints)
   - `GET /api/masters/bins`
   - `POST /api/masters/bins`
   - `GET /api/masters/bins/[id]`
   - `PUT /api/masters/bins/[id]`
   - `DELETE /api/masters/bins/[id]`

3. **Categories** (5 endpoints)
   - `GET /api/masters/categories`
   - `POST /api/masters/categories`
   - `GET /api/masters/categories/[id]`
   - `PUT /api/masters/categories/[id]`
   - `DELETE /api/masters/categories/[id]`

4. **Vendors** (5 endpoints)
   - `GET /api/masters/vendors`
   - `POST /api/masters/vendors`
   - `GET /api/masters/vendors/[id]`
   - `PUT /api/masters/vendors/[id]`
   - `DELETE /api/masters/vendors/[id]`

5. **Employees** (5 endpoints)
   - `GET /api/masters/employees`
   - `POST /api/masters/employees`
   - `GET /api/masters/employees/[id]`
   - `PUT /api/masters/employees/[id]`
   - `DELETE /api/masters/employees/[id]`

### QR Code APIs (3 endpoints)
1. `GET /api/qr/resolve` - Resolve QR code to asset
2. `POST /api/qr/generate` - Generate QR code for asset
3. `GET /api/qr/print/[id]` - Get printable QR label

### Reports APIs (6 endpoints)
1. `GET /api/reports/assets/status` - Asset status report
2. `GET /api/reports/assets/category` - Asset category report
3. `GET /api/reports/assets/location` - Asset location report
4. `GET /api/reports/repairs/vendor` - Repair vendor report
5. `GET /api/reports/repairs/cost` - Repair cost report
6. `GET /api/reports/financial/tco` - Total cost of ownership

### Tenant Management APIs (8 endpoints)
1. `GET /api/tenants` - List tenants (admin only)
2. `POST /api/tenants` - Create tenant
3. `GET /api/tenants/[id]` - Get tenant details
4. `PUT /api/tenants/[id]` - Update tenant
5. `DELETE /api/tenants/[id]` - Delete tenant
6. `POST /api/tenants/[id]/activate` - Activate tenant
7. `POST /api/tenants/[id]/suspend` - Suspend tenant
8. `GET /api/tenants/[id]/usage` - Get tenant usage stats

### Subscription & Billing APIs (10 endpoints)
1. `GET /api/subscriptions/plans` - List available plans
2. `GET /api/subscriptions/current` - Get current subscription
3. `POST /api/subscriptions/subscribe` - Create subscription
4. `PUT /api/subscriptions/upgrade` - Upgrade plan
5. `POST /api/subscriptions/cancel` - Cancel subscription
6. `GET /api/subscriptions/[id]` - Get subscription details
7. `PUT /api/subscriptions/[id]` - Update subscription (admin)
8. `GET /api/subscriptions/[id]/usage` - Usage vs limits
9. `GET /api/billing/invoices` - Get invoices
10. `POST /api/billing/payment` - Process payment

### Super Admin APIs (12 endpoints)
1. `GET /api/admin/dashboard/stats` - Platform statistics
2. `GET /api/admin/tenants` - Manage all tenants
3. `POST /api/admin/tenants/[id]/impersonate` - Impersonate tenant
4. `GET /api/admin/plans` - Manage subscription plans
5. `POST /api/admin/plans` - Create plan
6. `PUT /api/admin/plans/[id]` - Update plan
7. `DELETE /api/admin/plans/[id]` - Delete plan
8. `GET /api/admin/subscriptions` - All subscriptions
9. `GET /api/admin/analytics/platform` - Platform analytics
10. `GET /api/admin/analytics/revenue` - Revenue analytics
11. `GET /api/admin/system/settings` - System settings
12. `PUT /api/admin/system/settings` - Update system settings

**Total API Endpoints: 85**

---

## Consistent Patterns for Professional UI

### 1. shadcn/ui Component Usage
```typescript
// Use shadcn/ui components instead of basic HTML
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Professional button variants
<Button variant="default">Primary Action</Button>
<Button variant="outline">Secondary Action</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost">Cancel</Button>
```

### 2. Toast Notifications (Sonner) Instead of Alerts
```typescript
import { toast } from "sonner";

// Success toast
toast.success("Asset created successfully!");

// Error toast
toast.error("Failed to create asset. Please try again.");

// Loading toast
const toastId = toast.loading("Creating asset...");
toast.success("Asset created!", { id: toastId });

// Custom toast with action
toast("Asset created", {
  action: {
    label: "View Asset",
    onClick: () => router.push(`/assets/${assetId}`)
  }
});
```

### 3. Dialog Components Instead of Window Alerts
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function ConfirmDeleteDialog({ onConfirm }: { onConfirm: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Asset</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Are you sure you want to delete this asset? This action cannot be undone.</p>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### 4. Professional Layout Patterns
```typescript
// Consistent page layout with shadcn/ui
export default function AssetPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Assets</h2>
        <div className="flex items-center space-x-2">
          <Button>Add New Asset</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        {/* More metric cards */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asset Registry</CardTitle>
          <CardDescription>Manage your organization's assets</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Asset table with shadcn/ui Table component */}
        </CardContent>
      </Card>
    </div>
  );
}
```

### 5. Responsive Design Patterns
```typescript
// Mobile-first responsive design
export function ResponsiveAssetCard({ asset }: { asset: Asset }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{asset.name}</h3>
              <Badge variant={getStatusVariant(asset.status)}>
                {asset.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>Category: {asset.category}</div>
              <div>Location: {asset.location}</div>
              <div>Warranty: {formatDate(asset.warrantyEnd)}</div>
              <div>Value: ${asset.currentValue}</div>
            </div>

            <div className="flex justify-between pt-2">
              <Button size="sm" variant="outline">
                View Details
              </Button>
              <div className="flex space-x-1">
                <Button size="sm" variant="ghost">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 6. Professional Form Patterns with Validation
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const assetFormSchema = z.object({
  name: z.string().min(1, "Asset name is required"),
  serialNumber: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  locationId: z.string().min(1, "Location is required"),
  purchaseCost: z.number().min(0, "Purchase cost is required"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
});

type AssetFormValues = z.infer<typeof assetFormSchema>;

export function AssetForm() {
  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      name: "",
      serialNumber: "",
      categoryId: "",
      locationId: "",
      purchaseCost: 0,
      purchaseDate: "",
    },
  });

  const onSubmit = async (data: AssetFormValues) => {
    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create asset');

      toast.success("Asset created successfully!");
      form.reset();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Add New Asset</CardTitle>
        <CardDescription>Enter the asset details below</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Asset Name *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter asset name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input
                id="serialNumber"
                {...form.register("serialNumber")}
                placeholder="Enter serial number"
              />
            </div>

            {/* More form fields */}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Reset
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating..." : "Create Asset"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

### 7. Loading States and Skeleton Screens
```typescript
import { Skeleton } from "@/components/ui/skeleton";

export function AssetTableSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Usage in components
export function AssetList() {
  const { data: assets, isLoading } = useAssets();

  if (isLoading) {
    return <AssetTableSkeleton />;
  }

  return <DataTable data={assets} />;
}
```

### 8. Error Handling with Toast
```typescript
export function AssetDeleteButton({ assetId }: { assetId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete asset');
      }

      toast.success('Asset deleted successfully');
      // Refresh data or redirect
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </Button>
  );
}
```

---

## Vercel Deployment Considerations

### 1. Environment Variables
```bash
# Database
DB_USER="your_db_user"
DB_PASSWORD="your_db_password"
DB_SERVER="your_server.database.windows.net"
DB_NAME="your_database_name"
DB_ENCRYPT="true"

# Custom Authentication
JWT_SECRET="your-jwt-secret-key"
COOKIE_SECRET="your-cookie-secret-key"
DOMAIN_URL="https://your-domain.vercel.app"

# OAuth Providers (if using in future)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 2. Database Configuration for MSSQL
```javascript
// lib/database.ts
import { sql } from 'mssql';

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: true,
    enableArithAbort: true,
    connectionTimeout: 30000,
    requestTimeout: 30000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  }
};

export async function getConnection() {
  try {
    return await sql.connect(config);
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

// SQL Migration Example
export const createAssetsTable = `
CREATE TABLE Assets (
  id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
  tenantId NVARCHAR(36) NOT NULL,
  code NVARCHAR(50) UNIQUE NOT NULL,
  name NVARCHAR(255) NOT NULL,
  categoryId NVARCHAR(36) NOT NULL,
  locationId NVARCHAR(36) NOT NULL,
  status NVARCHAR(50) DEFAULT 'IN_STOCK',
  serialNumber NVARCHAR(255),
  purchaseCost DECIMAL(18,2),
  purchaseDate DATETIME2,
  warrantyEndDate DATETIME2,
  currentValue DECIMAL(18,2),
  assignedToEmployeeId NVARCHAR(36),
  createdAt DATETIME2 DEFAULT GETDATE(),
  updatedAt DATETIME2 DEFAULT GETDATE()
);

-- Indexes for performance
CREATE INDEX IX_Assets_tenantId ON Assets(tenantId);
CREATE INDEX IX_Assets_tenantId_status ON Assets(tenantId, status);
CREATE INDEX IX_Assets_tenantId_categoryId ON Assets(tenantId, categoryId);
CREATE INDEX IX_Assets_tenantId_locationId ON Assets(tenantId, locationId);
`;
```

### 3. TypeScript Configuration for Production
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 4. Build Optimization
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-domain.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Enable experimental features for better performance
  swcMinify: true,
  poweredByHeader: false,
};

module.exports = nextConfig;
```

---

## Implementation Steps

### Phase 1: Foundation Setup (Week 1)
1. **Install Dependencies** (install from the list provided above)
2. **Set up shadcn/ui** with proper configuration
3. **Configure Tailwind CSS** for professional theming
4. **Set up MSSQL database connection** with custom database layer
5. **Configure custom cookie-based authentication**

### Phase 2: Database & Models (Week 2)
1. **Create Database Schema** with SQL scripts and proper indexing
2. **Run Manual SQL Migrations**
3. **Set up Database Seeding** with SQL scripts
4. **Create API Response Types** with TypeScript
5. **Test Database Connection** on Vercel

### Phase 3: Authentication & Layouts (Week 3)
1. **Implement Authentication Pages** with shadcn/ui components
2. **Create Protected Routes** with middleware
3. **Build Layout Components** (Header, Sidebar, Navigation)
4. **Set up Toast Notifications** globally
5. **Implement Error Handling** with professional UI

### Phase 4: Core Components (Week 4)
1. **Build Reusable shadcn/ui Components**
2. **Create Form Components** with validation
3. **Implement Table Components** with sorting/filtering
4. **Add Loading States** and skeleton screens
5. **Build Responsive Design** patterns

### Phase 5: Asset Management (Week 5-6)
1. **Implement Asset CRUD** with professional UI
2. **Build Asset List** with advanced filtering
3. **Create Asset Details Page** with tabs
4. **Implement QR Code Generation** and display
5. **Add Asset Lifecycle** workflows

### Phase 6: Advanced Features (Week 7-8)
1. **Build QR Scanner** with HTML5 QR Code
2. **Implement Repair Management** workflows
3. **Create Master Data** management pages
4. **Build Reporting Dashboard** with charts
5. **Add Subscription Management**

### Phase 7: Admin Portal (Week 9)
1. **Create Super Admin Dashboard**
2. **Build Tenant Management** interface
3. **Implement Subscription** management
4. **Add Platform Analytics**
5. **Create System Settings** page

### Phase 8: Polish & Deployment (Week 10)
1. **Add Comprehensive Testing**
2. **Optimize for Performance** and SEO
3. **Fix TypeScript and Linting** errors
4. **Set up Vercel Deployment** pipeline
5. **Add Monitoring** and error tracking

This blueprint ensures a professional, responsive, and production-ready application using shadcn/ui components, proper error handling with toast notifications, and Vercel-compatible architecture.