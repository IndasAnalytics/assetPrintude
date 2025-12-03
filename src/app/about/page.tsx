import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  Target,
  Eye,
  Heart,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  Users,
  TrendingUp,
  Shield,
} from "lucide-react";

export default function AboutPage() {
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
            <Link href="/features" className="text-sm font-medium hover:underline">
              Features
            </Link>
            <Link href="/about" className="text-sm font-medium text-primary underline">
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
            About AssetTrack
            <span className="block text-primary">Making Asset Management Simple</span>
          </h1>
          <p className="max-w-[750px] text-lg text-muted-foreground">
            We're on a mission to help organizations of all sizes gain complete visibility and
            control over their physical assets, reducing losses and optimizing operations.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="container py-12">
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="border-2">
            <CardHeader>
              <Target className="h-12 w-12 text-primary" />
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                To empower organizations with a comprehensive, easy-to-use asset management platform
                that eliminates asset loss, streamlines operations, and provides real-time visibility
                into their physical resources.
              </p>
              <p className="text-muted-foreground">
                We believe that every organization, regardless of size, deserves access to
                enterprise-grade asset tracking without the complexity and cost traditionally
                associated with such systems.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <Eye className="h-12 w-12 text-primary" />
              <CardTitle className="text-2xl">Our Vision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                To become the leading multi-tenant SaaS platform for asset management, known for our
                innovative QR-based tracking, intuitive user experience, and commitment to helping
                organizations maximize the value of their physical assets.
              </p>
              <p className="text-muted-foreground">
                We envision a future where asset loss is virtually eliminated through smart tracking,
                where maintenance is predictive rather than reactive, and where every organization
                has complete financial visibility into their asset investments.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Core Values */}
      <section className="border-t bg-muted/50 py-16">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold">Our Core Values</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <Lightbulb className="h-10 w-10 text-primary" />
                <CardTitle>Innovation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We continuously innovate to provide cutting-edge solutions like QR-based tracking
                  and real-time analytics that solve real business problems.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary" />
                <CardTitle>Customer Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our customers' success is our success. We design every feature with user
                  experience and business value in mind.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-primary" />
                <CardTitle>Simplicity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Complex problems deserve simple solutions. We make asset management accessible to
                  everyone, not just technical experts.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary" />
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We protect your data with enterprise-grade security, complete tenant isolation,
                  and compliance with industry best practices.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* The Problem We Solve */}
      <section className="container py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-3xl font-bold">The Problem We Solve</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-destructive" />
                  Asset Loss & Misplacement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Organizations lose billions annually due to misplaced, stolen, or forgotten assets.
                  Without proper tracking, assets disappear into the void, never to be found again.
                  AssetTrack eliminates this problem with QR-based tracking and real-time location
                  updates.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-destructive" />
                  Manual Spreadsheet Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Many organizations still rely on Excel spreadsheets for asset tracking, leading to
                  outdated data, human errors, and lack of accountability. AssetTrack provides a
                  centralized, automated system with audit trails and real-time updates.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-destructive" />
                  Hidden Maintenance Costs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Without proper tracking, repair and maintenance costs spiral out of control.
                  Organizations don't know which assets are costing them money or which vendors are
                  reliable. AssetTrack provides complete visibility into Total Cost of Ownership.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-destructive" />
                  Compliance & Audit Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  During audits, organizations struggle to account for their assets, leading to
                  compliance issues and financial discrepancies. AssetTrack maintains complete audit
                  trails and generates comprehensive reports on demand.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="border-t bg-muted/50 py-16">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold">Why Choose AssetTrack?</h2>
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
              <CheckCircle2 className="mt-1 h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">Multi-Tenant Architecture</h3>
                <p className="text-sm text-muted-foreground">
                  Complete data isolation ensures your information is secure and separate from other
                  organizations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
              <CheckCircle2 className="mt-1 h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">QR Code Innovation</h3>
                <p className="text-sm text-muted-foreground">
                  Our QR-based tracking system makes asset identification instant and mobile-friendly,
                  eliminating manual entry errors.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
              <CheckCircle2 className="mt-1 h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">Comprehensive Feature Set</h3>
                <p className="text-sm text-muted-foreground">
                  From procurement to disposal, repairs to reporting, we cover every aspect of asset
                  lifecycle management in one platform.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
              <CheckCircle2 className="mt-1 h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">Affordable & Scalable</h3>
                <p className="text-sm text-muted-foreground">
                  Start with our free trial, then choose a plan that grows with your organization.
                  No hidden costs, no per-user licensing surprises.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
              <CheckCircle2 className="mt-1 h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">Modern Technology Stack</h3>
                <p className="text-sm text-muted-foreground">
                  Built with Next.js 16, React 19, and TypeScript for exceptional performance,
                  reliability, and user experience.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
              <CheckCircle2 className="mt-1 h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">Financial Intelligence</h3>
                <p className="text-sm text-muted-foreground">
                  Automatic depreciation calculation, Total Cost of Ownership analysis, and
                  comprehensive financial reporting give you complete visibility.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">Platform Capabilities</h2>
        <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="text-5xl font-bold text-primary">62+</div>
            <p className="text-sm font-medium">API Endpoints</p>
            <p className="text-xs text-muted-foreground">Complete REST API coverage</p>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="text-5xl font-bold text-primary">100%</div>
            <p className="text-sm font-medium">Data Isolation</p>
            <p className="text-xs text-muted-foreground">Multi-tenant security</p>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="text-5xl font-bold text-primary">15</div>
            <p className="text-sm font-medium">Core Features</p>
            <p className="text-xs text-muted-foreground">From QR to analytics</p>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="text-5xl font-bold text-primary">24/7</div>
            <p className="text-sm font-medium">Availability</p>
            <p className="text-xs text-muted-foreground">Cloud-hosted reliability</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/50 py-16">
        <div className="container flex flex-col items-center gap-6 text-center">
          <h2 className="text-3xl font-bold">Join Organizations Using AssetTrack</h2>
          <p className="max-w-[600px] text-lg text-muted-foreground">
            Start your free trial today and experience the difference proper asset management makes.
          </p>
          <div className="flex gap-4">
            <Link href="/auth/client/register">
              <Button size="lg" className="gap-2">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/features">
              <Button size="lg" variant="outline">
                View Features
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
