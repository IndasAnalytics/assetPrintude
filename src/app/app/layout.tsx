import { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientHeader } from "@/components/ClientHeader";

interface ClientLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { name: "Assets", href: "/app/assets", icon: Package },
  { name: "Scan QR", href: "/app/scan-qr", icon: QrCode },
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

export default async function ClientLayout({ children }: ClientLayoutProps) {
  const user = await getCurrentUser();

  console.log("ClientLayout - User:", user);

  // Redirect if not authenticated or wrong role
  if (!user || user.role === "SUPER_ADMIN") {
    console.log("ClientLayout - Redirecting to login, user:", user);
    redirect("/auth/client/login");
  }

  const handleLogout = async () => {
    "use server";
    const { removeAuthCookie } = await import("@/lib/auth");
    const { redirect } = await import("next/navigation");
    await removeAuthCookie();
    redirect("/auth/client/login");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-muted/50 lg:flex">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Package className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">AssetTrack</span>
        </div>

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
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.name}
              </Link>
            )
          )}
        </nav>

        <div className="border-t p-4">
          <form action={handleLogout}>
            <Button variant="ghost" className="w-full justify-start gap-2" type="submit">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b bg-background px-6">
          <ClientHeader email={user.email} />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-muted/50 p-6">{children}</main>
      </div>
    </div>
  );
}
