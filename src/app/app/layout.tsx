"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { logout } from "@/lib/auth-client";
import { AuthGuard } from "@/components/auth/auth-guard";
import {
  Package,
  LayoutDashboard,
  MapPin,
  FolderTree,
  Users,
  Wrench,
  QrCode,
  BarChart3,
  CreditCard,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ClientLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { name: "Assets", href: "/app/assets", icon: Package },
  // { name: "Scan QR", href: "/app/scan-qr", icon: QrCode },
  { name: "Repairs", href: "/app/repairs", icon: Wrench },
  {
    name: "Masters",
    icon: FolderTree,
    children: [
      { name: "Locations", href: "/app/masters/locations", icon: MapPin },
      { name: "Categories", href: "/app/masters/categories" },
      { name: "Vendors", href: "/app/masters/vendors" },
      { name: "Employees", href: "/app/masters/employees", icon: Users },
    ],
  },
  { name: "Reports", href: "/app/reports", icon: BarChart3 },
  { name: "Subscription", href: "/app/subscription", icon: CreditCard },
];

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const SidebarContent = () => (
    <>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigation.map((item) =>
          item.children ? (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground">
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.name}
              </div>
              <div className="ml-6 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.name}
                    href={child.href}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {child.icon && <child.icon className="h-4 w-4" />}
                    {child.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.name}
            </Link>
          )
        )}
      </nav>

      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <AuthGuard allowedRoles={["CLIENT_ADMIN", "CLIENT_USER"]}>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 flex-col border-r bg-muted/50 lg:flex">
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">AssetTrack</span>
          </div>
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile Header with Menu */}
          <header className="flex h-16 items-center gap-4 border-b bg-background px-4 lg:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="border-b p-6">
                  <SheetTitle className="flex items-center gap-2 text-left">
                    <Package className="h-6 w-6 text-primary" />
                    <span className="text-lg font-bold">AssetTrack</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex h-[calc(100vh-5rem)] flex-col">
                  <SidebarContent />
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">AssetTrack</span>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-muted/50 p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
