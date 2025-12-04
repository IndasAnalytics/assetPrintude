"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { logout, getAuthToken } from "@/lib/auth-client";
import { verifyToken } from "@/lib/auth-shared";
import { AuthGuard } from "@/components/auth/auth-guard";
import {
  Package,
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  LogOut,
  Menu,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Tenants", href: "/admin/tenants", icon: Building2 },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Plans", href: "/admin/plans", icon: CreditCard },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [userEmail, setUserEmail] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        setUserEmail(payload.email);
      }
    }
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const SidebarContent = () => (
    <>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={() => setMobileMenuOpen(false)}
          >
            {item.icon && <item.icon className="h-4 w-4" />}
            {item.name}
          </Link>
        ))}
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
    <AuthGuard requiredRole="SUPER_ADMIN">
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 flex-col border-r bg-muted/50 lg:flex">
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Admin Portal</span>
          </div>
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top Header */}
          <header className="flex h-16 items-center justify-between border-b bg-background px-6">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <SheetHeader className="border-b p-6">
                    <SheetTitle className="flex items-center gap-2 text-left">
                      <Shield className="h-6 w-6 text-primary" />
                      <span className="text-lg font-bold">Admin Portal</span>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex h-[calc(100vh-5rem)] flex-col">
                    <SidebarContent />
                  </div>
                </SheetContent>
              </Sheet>
              <div>
                <p className="text-sm text-muted-foreground">Super Administrator</p>
                <p className="text-sm font-medium">{userEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                      {userEmail.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:inline">{userEmail}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-muted/50 p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
