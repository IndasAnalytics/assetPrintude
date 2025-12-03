import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  QrCode,
  MapPin,
  Users,
  Wrench,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  FileText,
  Download,
  BarChart3,
  Shield,
  Clock,
  Smartphone,
  Database,
  Zap,
} from "lucide-react";

export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">AssetTrack</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/features" className="text-sm font-medium text-primary underline">
              Features
            </Link>
            <Link href="/about" className="text-sm font-medium hover:underline">
              About
            </Link>
            <Link href="/auth/client/login">
              <Button variant="ghost">Client Login</Button>
            </Link>
            <Link href="/auth/admin/login">
              <Button variant="ghost" size="sm">
                Admin
              </Button>
            </Link>
            <Link href="/auth/client/register">
              <Button>Start Free Trial</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container flex flex-col items-center gap-4 py-16 text-center md:py-24">
        <div className="flex max-w-[980px] flex-col items-center gap-4">
          <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
            Comprehensive Asset Management
            <span className="block text-primary">Features Built for Scale</span>
          </h1>
          <p className="max-w-[750px] text-lg text-muted-foreground">
            Every feature you need to track, manage, and optimize your organization's physical assets.
            From QR code scanning to financial analytics, AssetTrack has you covered.
          </p>
        </div>
      </section>

      {/* Core Features */}
      <section className="container py-12">
        <h2 className="mb-12 text-center text-3xl font-bold">Core Features</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-2">
            <CardHeader>
              <Package className="h-12 w-12 text-primary" />
              <CardTitle className="text-xl">Complete Asset Lifecycle</CardTitle>
              <CardDescription>
                Track every asset from procurement through disposal with complete audit trails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Purchase & Procurement</p>
                  <p className="text-sm text-muted-foreground">
                    Record purchase details, invoices, and vendor information
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Status Management</p>
                  <p className="text-sm text-muted-foreground">
                    Track IN_STOCK, ASSIGNED, IN_REPAIR, or DISPOSED status
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Complete History</p>
                  <p className="text-sm text-muted-foreground">
                    View timeline of all actions, assignments, and repairs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <QrCode className="h-12 w-12 text-primary" />
              <CardTitle className="text-xl">QR Code System</CardTitle>
              <CardDescription>
                Instant asset identification and mobile-friendly scanning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Auto-generation</p>
                  <p className="text-sm text-muted-foreground">
                    Unique QR codes automatically created for each asset
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Printable Labels</p>
                  <p className="text-sm text-muted-foreground">
                    4in x 2in professional labels with asset info
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Mobile Scanning</p>
                  <p className="text-sm text-muted-foreground">
                    Scan QR codes with any smartphone camera
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <MapPin className="h-12 w-12 text-primary" />
              <CardTitle className="text-xl">Location Management</CardTitle>
              <CardDescription>
                Multi-level location tracking with bin-level precision
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Hierarchical Locations</p>
                  <p className="text-sm text-muted-foreground">
                    Warehouses, floors, rooms, and more
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Bin-Level Tracking</p>
                  <p className="text-sm text-muted-foreground">
                    Racks, shelves, cabinets for precise storage
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Transfer History</p>
                  <p className="text-sm text-muted-foreground">
                    Track asset movements between locations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <Users className="h-12 w-12 text-primary" />
              <CardTitle className="text-xl">Employee Management</CardTitle>
              <CardDescription>
                Track asset assignments and employee accountability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Issue/Return Workflow</p>
                  <p className="text-sm text-muted-foreground">
                    Formal process for asset assignments
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Assignment History</p>
                  <p className="text-sm text-muted-foreground">
                    Who had what asset and when
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Accountability</p>
                  <p className="text-sm text-muted-foreground">
                    Clear ownership and responsibility tracking
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <Wrench className="h-12 w-12 text-primary" />
              <CardTitle className="text-xl">Repair Management</CardTitle>
              <CardDescription>
                Complete repair lifecycle from report to completion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Vendor Integration</p>
                  <p className="text-sm text-muted-foreground">
                    Assign repairs to internal or external vendors
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Cost Tracking</p>
                  <p className="text-sm text-muted-foreground">
                    Estimated vs actual repair costs
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Status Updates</p>
                  <p className="text-sm text-muted-foreground">
                    Track OPEN, IN_PROGRESS, and COMPLETED status
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-primary" />
              <CardTitle className="text-xl">Financial Analytics</CardTitle>
              <CardDescription>
                Depreciation tracking and total cost of ownership
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Auto Depreciation</p>
                  <p className="text-sm text-muted-foreground">
                    15% per annum straight-line depreciation
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">TCO Calculation</p>
                  <p className="text-sm text-muted-foreground">
                    Total cost including repairs and maintenance
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Warranty Tracking</p>
                  <p className="text-sm text-muted-foreground">
                    Expiry alerts and warranty status monitoring
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="border-t bg-muted/50 py-16">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold">Advanced Capabilities</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-primary" />
                <CardTitle>Reports & Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Asset status distribution</li>
                  <li>• Category-wise analysis</li>
                  <li>• Location-wise reports</li>
                  <li>• Vendor performance</li>
                  <li>• 12-month cost trends</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Download className="h-8 w-8 text-primary" />
                <CardTitle>Export Functionality</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• CSV/JSON export</li>
                  <li>• Filtered exports</li>
                  <li>• Asset data backup</li>
                  <li>• Repair records export</li>
                  <li>• Bulk data operations</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary" />
                <CardTitle>Multi-Tenant Security</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Complete data isolation</li>
                  <li>• Role-based access</li>
                  <li>• JWT authentication</li>
                  <li>• Activity audit logs</li>
                  <li>• Secure impersonation</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="h-8 w-8 text-primary" />
                <CardTitle>Real-Time Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Instant status changes</li>
                  <li>• Live dashboard metrics</li>
                  <li>• Activity notifications</li>
                  <li>• Warranty expiry alerts</li>
                  <li>• Repair completion updates</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technical Features */}
      <section className="container py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">Technical Excellence</h2>
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold">Mobile Optimized</h3>
            <p className="text-sm text-muted-foreground">
              Responsive design works perfectly on phones, tablets, and desktops
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Database className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold">Scalable Database</h3>
            <p className="text-sm text-muted-foreground">
              MSSQL backend handles thousands of assets with optimal performance
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">
              Built with Next.js 16 and React 19 for exceptional speed
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/50 py-16">
        <div className="container flex flex-col items-center gap-6 text-center">
          <h2 className="text-3xl font-bold">Ready to try all these features?</h2>
          <p className="max-w-[600px] text-lg text-muted-foreground">
            Start your free trial today and experience the complete asset management solution.
          </p>
          <div className="flex gap-4">
            <Link href="/auth/client/register">
              <Button size="lg" className="gap-2">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/client/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <span className="font-semibold">AssetTrack</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/features" className="hover:underline">
              Features
            </Link>
            <Link href="/about" className="hover:underline">
              About
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 AssetTrack. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
