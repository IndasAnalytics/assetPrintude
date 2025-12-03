# AssetTrack - Installation Guide

## Step 1: Install Dependencies

Run these commands in your terminal:

```bash
# Core UI Components & Styling
npm install class-variance-authority clsx tailwind-merge lucide-react

# shadcn/ui Components (Radix UI)
npm install @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-checkbox @radix-ui/react-label @radix-ui/react-toast

# Form Handling & Validation
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
npm install js-cookie @types/js-cookie jsonwebtoken @types/jsonwebtoken
```

## Step 2: Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_SERVER=your_server.database.windows.net
DB_NAME=your_database_name
DB_ENCRYPT=true

# Custom Authentication
JWT_SECRET=your-jwt-secret-key-change-this-in-production
COOKIE_SECRET=your-cookie-secret-key-change-this-in-production
DOMAIN_URL=http://localhost:3000
```

## Step 3: Initialize shadcn/ui

Run the shadcn/ui initialization:

```bash
npx shadcn@latest init
```

When prompted, use these settings:
- Style: Default
- Base color: Slate
- CSS variables: Yes

## Step 4: Install shadcn/ui Components

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add select
npx shadcn@latest add tabs
npx shadcn@latest add checkbox
npx shadcn@latest add label
npx shadcn@latest add table
npx shadcn@latest add badge
npx shadcn@latest add textarea
npx shadcn@latest add form
npx shadcn@latest add skeleton
npx shadcn@latest add toast
npx shadcn@latest add avatar
npx shadcn@latest add separator
```

## Step 5: Database Setup

1. Create a new MSSQL database
2. Run the schema scripts from `database/schema.sql`
3. Run the seed data from `database/seed.sql`

## Step 6: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Next Steps

After installation, the application structure will be:
- `/` - Landing page
- `/auth/client/login` - Client login
- `/auth/client/register` - Client registration
- `/app/dashboard` - Client dashboard (after login)
- `/admin/dashboard` - Admin dashboard (super admin)

## Troubleshooting

### Database Connection Issues
- Verify your MSSQL server is running
- Check firewall settings allow connections
- Verify connection string in `.env.local`

### shadcn/ui Issues
- Make sure Tailwind CSS 4 is properly configured
- Check `components.json` has correct paths

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
