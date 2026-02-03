"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  HelpCircle,
  Settings,
  Folder,
  Tag,
  GalleryHorizontal,
} from "lucide-react";

const mainNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Folder },
  { href: "/admin/brands", label: "Brands", icon: Tag },
  { href: "/admin/hero-sliders", label: "Hero Sliders", icon: GalleryHorizontal },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
];

const bottomNavItems = [
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/help", label: "Help", icon: HelpCircle },
];

export function SidebarNav() {
  const pathname = usePathname();

  const renderNavItems = (
    items: { href: string; label: string; icon: React.ElementType }[]
  ) => {
    return items.map((item) => (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton
          asChild
          isActive={pathname.startsWith(item.href)}
          tooltip={item.label}
        >
          <Link href={item.href}>
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));
  };

  return (
    <>
      <SidebarMenu className="flex-1 p-2">{renderNavItems(mainNavItems)}</SidebarMenu>
      <div className="p-2">
        <SidebarSeparator className="my-2" />
        <SidebarMenu>{renderNavItems(bottomNavItems)}</SidebarMenu>
      </div>
    </>
  );
}
