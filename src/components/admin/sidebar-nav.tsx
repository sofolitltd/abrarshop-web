"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  ChevronRight,
  PlusCircle,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  {
    label: "Products",
    icon: Package,
    items: [
      { href: "/admin/products", label: "All Products", icon: List },
      { href: "/admin/products/new", label: "Add New Product", icon: PlusCircle },
      { href: "/admin/categories", label: "Categories", icon: Folder },
      { href: "/admin/brands", label: "Brands", icon: Tag },
    ],
  },
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

  const renderNavItems = (items: any[]) => {
    return items.map((item) => {
      if (item.items) {
        const isActive = item.items.some((subItem: any) =>
          pathname.startsWith(subItem.href)
        );

        return (
          <Collapsible
            key={item.label}
            asChild
            defaultOpen={isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.label}>
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                  <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items.map((subItem: any) => (
                    <SidebarMenuSubItem key={subItem.href}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={pathname === subItem.href}
                      >
                        <Link href={subItem.href}>
                          <span>{subItem.label}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        );
      }

      return (
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
      );
    });
  };

  return (
    <>
      <SidebarMenu className="flex-1 p-3">
        {renderNavItems(mainNavItems)}
      </SidebarMenu>
      <div className="p-2">
        <SidebarSeparator className="my-2" />
        <SidebarMenu>{renderNavItems(bottomNavItems)}</SidebarMenu>
      </div>
    </>
  );
}
