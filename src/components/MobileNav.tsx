"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  X,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { name: "Assets", href: "/app/assets", icon: Package },
  { name: "Scan QR", href: "/app/assets/scan", icon: QrCode },
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

interface MobileNavProps {
  onLogout: () => void;
}

export function MobileNav({ onLogout }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const pathname = usePathname();

  const toggleSubMenu = (menuName: string) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName);
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b px-6">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">AssetTrack</span>
            </div>
            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navigation.map((item) =>
              item.children ? (
                <div key={item.name} className="space-y-1">
                  <button
                    onClick={() => toggleSubMenu(item.name)}
                    className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <div className="flex items-center gap-2">
                      {item.icon && <item.icon className="h-4 w-4" />}
                      {item.name}
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        expandedMenu === item.name && "rotate-180"
                      )}
                    />
                  </button>
                  {expandedMenu === item.name && (
                    <div className="ml-6 space-y-1">
                      {item.children.map((child) => (
                        <SheetClose asChild key={child.name}>
                          <Link
                            href={child.href}
                            className={cn(
                              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                              isActive(child.href)
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground"
                            )}
                          >
                            {child.icon && <child.icon className="h-4 w-4" />}
                            {child.name}
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <SheetClose asChild key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                      isActive(item.href)
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    {item.name}
                  </Link>
                </SheetClose>
              )
            )}
          </nav>

          {/* Logout */}
          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
