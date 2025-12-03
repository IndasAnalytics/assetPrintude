# AssetTrack - Project Summary

## 🎯 Project Overview

**AssetTrack** is a multi-tenant SaaS web application for comprehensive asset management with QR-based tracking and real-time visibility. Built for organizations that need to efficiently manage, track, and maintain their physical assets from procurement to disposal.

---

## 🏗️ Core Concept

A B2B SaaS platform where:
- **Multiple companies (tenants)** can register and manage their assets independently
- **Super Admin** oversees all tenants, subscriptions, and platform health
- **QR code technology** enables quick asset identification and tracking on the shop floor
- **Complete asset lifecycle management** from purchase through repair to scrap

---

## 👥 User Roles

### 1. Super Admin (Platform Owner)
- Manages all tenants and their subscriptions
- Controls subscription plans and pricing
- Views platform-wide analytics and health metrics
- Configures system settings and white-labeling
- Can impersonate tenants for support

### 2. Client Admin (Tenant Administrator)
- Full access to their company's asset management
- Manages users within their organization
- Views subscription status and billing
- Configures tenant-specific settings

### 3. Client User (Tenant Employee)
- Creates and manages assets
- Performs day-to-day operations (issue, return, repairs)
- Scans QR codes for quick access
- Views reports and dashboards

---

## 🎨 Application Modules

### A. Public Website
**Purpose:** Marketing and authentication entry point

**Key Pages:**
- Landing page with features, benefits, and ROI calculator
- Client login/registration
- Super admin login

### B. Client Workspace (Tenant Portal)
**Purpose:** Day-to-day asset management

**Main Features:**
1. **Dashboard** - Overview metrics, charts, recent activity
2. **Master Data Management**
   - Locations & Bins (hierarchical)
   - Categories (asset classification)
   - Vendors (purchase & repair)
   - Employees (asset assignments)

3. **Asset Registry**
   - Complete asset listing with advanced filters
   - Asset profile with full lifecycle history
   - Add/Edit assets with validation
   - QR code generation & printing
   - Mobile QR scanner

4. **Breakdown & Repair Management**
   - Report asset breakdowns
   - Track repair status and costs
   - Vendor management for repairs
   - Repair history and analytics

5. **Asset Operations**
   - Issue assets to employees
   - Return assets to stock
   - Track asset movements
   - Audit trail for all actions

6. **Reports & Analytics**
   - Asset status reports
   - Repair cost analysis
   - Warranty expiry alerts
   - Financial reports (TCO, depreciation)

7. **Subscription Management**
   - View current plan and usage
   - Upgrade/downgrade options
   - Billing history

### C. Super Admin Portal
**Purpose:** Platform management and oversight

**Main Features:**
1. **Platform Dashboard** - Global metrics and KPIs
2. **Tenant Management** - View, activate, suspend, or manage all clients
3. **Subscription & Plan Management** - Define plans, pricing, and features
4. **Billing Oversight** - Monitor payments and invoices
5. **Global Analytics** - Platform health, revenue, tenant usage
6. **System Settings** - White-labeling, theme, system configuration

---

## 🔑 Key Features

### Asset Management
- **Unique Asset Codes** - Auto-generated per tenant
- **QR Code Integration** - Print labels, scan for instant access
- **Status Tracking** - IN_STOCK, ISSUED, UNDER_REPAIR, SCRAPPED
- **Location Tracking** - Multi-level location + bin storage
- **Employee Assignment** - Track who has what asset
- **Complete Audit Trail** - Every change logged with timestamps

### Financial Tracking
- **Purchase Cost & Date** tracking
- **Depreciation Calculation** - Straight-line 15% annual
- **Total Cost of Ownership (TCO)** - Purchase + all repair costs
- **Warranty Management** - Expiry alerts and tracking

### Repair Management
- **Breakdown Reporting** - Quick repair request creation
- **Vendor Integration** - Link repairs to vendors
- **Cost Tracking** - Estimated vs actual repair costs
- **Status Workflow** - OPEN → IN_PROGRESS → COMPLETED
- **Auto-update TCO** - Repair costs added to asset TCO

### Multi-Tenant Architecture
- **Complete Data Isolation** - Tenant data never mixed
- **Subscription-based Access** - Read-only mode when expired
- **Usage Limits** - Optional asset/user limits per plan
- **Tenant-specific Settings** - Customizable per company

### QR Code Workflow
1. Asset created → QR code auto-generated
2. Print QR label (optimized for thermal printers)
3. Stick on physical asset
4. Scan with mobile → instant asset profile
5. Quick actions: Issue, Return, Send to Repair

---

## 🛠️ Technical Stack

### Frontend
- **Next.js 16** (App Router, React Server Components)
- **React 19** with TypeScript
- **shadcn/ui** component library
- **Tailwind CSS 4** for styling
- **Sonner** for toast notifications
- **html5-qrcode** for scanning
- **Recharts** for data visualization

### Backend
- **Next.js API Routes** (serverless functions)
- **Microsoft SQL Server** database
- **Custom database layer** with mssql package
- **Cookie-based authentication** with JWT
- **Custom middleware** for tenant isolation

### Key Libraries
- **Zod** - Schema validation
- **React Hook Form** - Form handling
- **js-cookie** - Cookie management
- **qrcode** - QR generation
- **date-fns** - Date utilities

### Deployment
- **Vercel** (optimized for Next.js)
- **Azure SQL** or AWS RDS for MSSQL
- **Environment-based configuration**

---

## 📊 Data Flow

### 1. Tenant Registration Flow
```
Visitor → Register Form → Create Tenant + Admin User + Trial Subscription → Login → Dashboard
```

### 2. Asset Lifecycle Flow
```
Create Asset → Generate QR → Issue to Employee → [Repairs if needed] → Return → Scrap (if needed)
```

### 3. Repair Flow
```
Asset Breakdown → Create Repair → Update Status (UNDER_REPAIR) → Complete Repair → Update TCO → Update Status (IN_STOCK)
```

### 4. Subscription Check Flow
```
Every Write Operation → Check Tenant Subscription → If Active: Allow → If Expired: Block with message
```

---

## 🗄️ Database Structure

### Core Tables (17 tables)
1. **Tenants** - Company information
2. **Users** - All system users (admins + client users)
3. **Sessions** - Authentication sessions
4. **Plans** - Subscription plans definition
5. **Subscriptions** - Tenant subscriptions
6. **Invoices** - Billing records
7. **Locations** - Asset storage locations
8. **Bins** - Sub-locations within locations
9. **Categories** - Asset classification
10. **Vendors** - Purchase/repair vendors
11. **Employees** - Organization employees
12. **Assets** - Main asset registry
13. **AssetHistory** - Complete audit trail
14. **Repairs** - Breakdown and maintenance records
15. **ActivityLogs** - System-wide activity tracking
16. **SystemSettings** - Global configuration
17. **TenantSettings** - Tenant-specific configuration

**Key Design Principles:**
- Every client table has `tenantId` for isolation
- Comprehensive indexing for performance
- Foreign keys for data integrity
- Audit trails for compliance

---

## 📱 Pages Structure

### Public (3 pages)
- `/` - Landing page
- `/features` - Feature showcase
- `/about` - Company information

### Authentication (3 pages)
- `/auth/client/login` - Client login
- `/auth/client/register` - Tenant registration
- `/auth/admin/login` - Super admin login

### Client Workspace (15 pages)
- `/app/dashboard` - Main dashboard
- `/app/assets` - Asset list
- `/app/assets/[id]` - Asset details
- `/app/assets/add` - Create asset
- `/app/assets/scan` - QR scanner
- `/app/repairs` - Repair management
- `/app/masters/locations` - Location management
- `/app/masters/categories` - Categories
- `/app/masters/vendors` - Vendors
- `/app/masters/employees` - Employees
- `/app/reports/assets` - Asset reports
- `/app/reports/repairs` - Repair reports
- `/app/reports/financial` - Financial reports
- `/app/subscription` - Subscription details
- `/app/profile` - User profile

### Super Admin Portal (6 pages)
- `/admin/dashboard` - Platform overview
- `/admin/tenants` - Tenant management
- `/admin/plans` - Plan management
- `/admin/subscriptions` - Subscription oversight
- `/admin/analytics` - Platform analytics
- `/admin/settings` - System configuration

**Total:** 27 pages

---

## 🔌 API Endpoints

### Summary by Category
- **Authentication:** 6 endpoints
- **Assets:** 12 endpoints
- **Repairs:** 8 endpoints
- **Master Data:** 25 endpoints (5 each for Locations, Bins, Categories, Vendors, Employees)
- **QR Codes:** 3 endpoints
- **Reports:** 6 endpoints
- **Tenants:** 8 endpoints
- **Subscriptions:** 10 endpoints
- **Super Admin:** 12 endpoints

**Total:** 85 API endpoints

---

## 🎨 UI/UX Approach

### Design System
- **Consistent Components** - All pages use shadcn/ui
- **Professional Theme** - Clean, modern, business-focused
- **Responsive Design** - Mobile-first approach
- **Toast Notifications** - User-friendly feedback (no alerts)
- **Dialog Modals** - Professional confirmations
- **Loading States** - Skeleton screens during data fetch
- **Form Validation** - Real-time feedback with Zod

### Color Coding
- **Status Badges:**
  - IN_STOCK: Blue
  - ISSUED: Orange
  - UNDER_REPAIR: Yellow
  - SCRAPPED: Gray

- **Subscription Status:**
  - ACTIVE: Green
  - TRIAL: Blue
  - EXPIRED: Red
  - SUSPENDED: Orange

---

## 🚀 Implementation Timeline

### Phase 1: Foundation (Week 1)
Setup, dependencies, database, auth

### Phase 2: Database (Week 2)
Schema creation, migrations, seed data

### Phase 3: Authentication (Week 3)
Login pages, middleware, protected routes

### Phase 4: Core Components (Week 4)
Reusable UI components, forms, tables

### Phase 5: Asset Management (Week 5-6)
CRUD operations, QR codes, lifecycle

### Phase 6: Advanced Features (Week 7-8)
Repairs, scanner, reporting

### Phase 7: Admin Portal (Week 9)
Super admin features, platform management

### Phase 8: Production (Week 10)
Testing, optimization, deployment

**Total Duration:** 10 weeks

---

## 💼 Business Value

### For Clients (Tenants)
- **Reduce Asset Loss** - Real-time tracking prevents misplacement
- **Optimize Maintenance** - Proactive repair management
- **Financial Control** - Clear TCO and depreciation tracking
- **Compliance** - Complete audit trail for regulatory needs
- **Efficiency** - QR scanning speeds up operations

### For Platform Owner
- **Recurring Revenue** - Subscription-based model
- **Scalability** - Multi-tenant architecture
- **Low Maintenance** - Automated workflows
- **Upsell Opportunities** - Usage-based plan upgrades
- **Data Insights** - Platform-wide analytics

---

## 🔐 Security & Compliance

- **Data Isolation** - Strict tenant separation at database level
- **Cookie-based Auth** - Secure HTTP-only cookies
- **Role-based Access** - Granular permission control
- **Audit Logging** - All actions tracked with timestamps
- **Session Management** - Auto-expiry and token validation
- **Input Validation** - Zod schemas for all forms
- **SQL Injection Prevention** - Parameterized queries

---

## 📈 Scalability Considerations

- **Database Indexing** - Optimized for multi-tenant queries
- **Connection Pooling** - Efficient database connections
- **Serverless APIs** - Auto-scaling with Vercel
- **Lazy Loading** - Components load on demand
- **Pagination** - All lists paginated for performance
- **Caching Strategy** - Server-side caching where appropriate

---

## 🎯 Success Metrics

### For Tenants
- Asset tracking accuracy > 99%
- Repair resolution time reduced by 30%
- Asset loss reduction by 50%
- 90% user adoption within 3 months

### For Platform
- 100+ paying tenants in Year 1
- 95% subscription renewal rate
- < 2% churn rate
- 4.5+ star rating from users

---

This summary provides a complete overview of the AssetTrack SaaS platform. For detailed implementation specifications, refer to [ASSET_TRACK_BLUEPRINT.md](./ASSET_TRACK_BLUEPRINT.md) and [schemas.md](./schemas.md).