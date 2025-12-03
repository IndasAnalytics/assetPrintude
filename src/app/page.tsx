import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, QrCode, MapPin, Users, Wrench, TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">AssetTrack</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/features" className="text-sm font-medium hover:underline">
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
      <section className="container flex flex-col items-center gap-4 py-24 text-center md:py-32">
        <div className="flex max-w-[980px] flex-col items-center gap-4">
          <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl">
            Multi-tenant SaaS Asset Management
            <span className="block text-primary">with QR-based Tracking</span>
          </h1>
          <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
            Track, manage, and optimize your physical assets with real-time visibility.
            From procurement to disposal, keep complete control of your organization's assets.
          </p>
          <div className="flex gap-4">
            <Link href="/auth/client/register">
              <Button size="lg" className="gap-2">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/client/login">
              <Button size="lg" variant="outline">
                Client Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16 md:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
            Everything you need to manage assets
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Comprehensive asset management platform designed for modern businesses
          </p>
        </div>

        <div className="mx-auto grid gap-6 pt-12 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Package className="h-10 w-10 text-primary" />
              <CardTitle>Asset Lifecycle Management</CardTitle>
              <CardDescription>
                Track assets from procurement through repair to disposal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Complete asset history
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Status tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Audit trail
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <QrCode className="h-10 w-10 text-primary" />
              <CardTitle>QR Code Integration</CardTitle>
              <CardDescription>
                Scan and access asset information instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Auto-generate QR labels
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Mobile scanning
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Quick actions
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MapPin className="h-10 w-10 text-primary" />
              <CardTitle>Location Tracking</CardTitle>
              <CardDescription>
                Multi-level location and bin-level storage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Hierarchical locations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Bin-level tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Easy transfers
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary" />
              <CardTitle>Employee Assignment</CardTitle>
              <CardDescription>
                Track who has what asset at all times
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Issue/return workflow
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Assignment history
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Accountability
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Wrench className="h-10 w-10 text-primary" />
              <CardTitle>Repair Management</CardTitle>
              <CardDescription>
                Track breakdowns and maintenance costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Vendor integration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Cost tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Repair history
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-primary" />
              <CardTitle>Financial Tracking</CardTitle>
              <CardDescription>
                Depreciation and Total Cost of Ownership
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Auto depreciation (15% p.a.)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  TCO calculation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Warranty tracking
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits & ROI Section */}
      <section className="border-t bg-muted/50 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
              Reduce losses. Save costs.
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Organizations using AssetTrack see immediate improvements
            </p>
          </div>

          <div className="mx-auto grid gap-8 pt-12 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="text-4xl font-bold text-primary">50%</div>
              <p className="text-sm text-muted-foreground">Reduction in asset loss</p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="text-4xl font-bold text-primary">30%</div>
              <p className="text-sm text-muted-foreground">Faster repair resolution</p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="text-4xl font-bold text-primary">99%</div>
              <p className="text-sm text-muted-foreground">Asset tracking accuracy</p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="text-4xl font-bold text-primary">100%</div>
              <p className="text-sm text-muted-foreground">Audit trail coverage</p>
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-[600px] rounded-lg border bg-card p-8 text-center">
            <p className="text-lg font-medium">
              Managing 1,000+ assets? Even a 5% reduction in losses can save you{" "}
              <span className="text-primary">₹5,00,000+</span> annually.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-16 md:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
            How It Works
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Get started in minutes with our simple workflow
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              1
            </div>
            <h3 className="font-semibold">Add Assets</h3>
            <p className="text-sm text-muted-foreground">
              Import or manually add your assets to the system
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              2
            </div>
            <h3 className="font-semibold">Generate QR Labels</h3>
            <p className="text-sm text-muted-foreground">
              Print and stick QR code labels on physical assets
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              3
            </div>
            <h3 className="font-semibold">Scan & Track</h3>
            <p className="text-sm text-muted-foreground">
              Scan QR codes for instant access and quick actions
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              4
            </div>
            <h3 className="font-semibold">Monitor & Optimize</h3>
            <p className="text-sm text-muted-foreground">
              View reports, track costs, and optimize operations
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/50 py-16 md:py-24">
        <div className="container flex flex-col items-center gap-6 text-center">
          <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
            Ready to get started?
          </h2>
          <p className="max-w-[600px] text-lg text-muted-foreground">
            Start your free trial today. No credit card required.
          </p>
          <div className="flex gap-4">
            <Link href="/auth/client/register">
              <Button size="lg" className="gap-2">
                Create Your Account <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/client/login">
              <Button size="lg" variant="outline">
                Client Login
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
