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
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
      { href: "/admin/brand", label: "Brands", icon: Tag },
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
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;

  const renderNavItems = (items: any[]) => {
    return items.map((item) => {
      if (item.items) {
        const isActive = item.items.some((subItem: any) =>
          pathname.startsWith(subItem.href)
        );

        if (isCollapsed) {
          return (
            <SidebarMenuItem key={item.label}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    isActive={isActive}
                    tooltip={item.label}
                    className="group-data-[collapsible=icon]:justify-center"
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="w-56 rounded-none border-zinc-200 ml-1">
                  <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{item.label}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {item.items.map((subItem: any) => (
                    <DropdownMenuItem key={subItem.href} asChild>
                      <Link
                        href={subItem.href}
                        className={cn(
                          "cursor-pointer text-xs font-bold uppercase tracking-tight",
                          pathname === subItem.href ? "bg-zinc-100 text-black" : "text-zinc-600"
                        )}
                      >
                        {subItem.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          );
        }

        return (
          <Collapsible
            key={item.label}
            asChild
            defaultOpen={isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.label} className="group-data-[collapsible=icon]:justify-center">
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
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
            isActive={pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href))}
            tooltip={item.label}
            className="group-data-[collapsible=icon]:justify-center"
          >
            <Link href={item.href}>
              <item.icon className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });
  };

  return (
    <>
      <SidebarMenu className="flex-1 px-2 py-3">
        {renderNavItems(mainNavItems)}
      </SidebarMenu>
      <div className="px-2 pb-2">
        <SidebarSeparator className="my-2" />
        <SidebarMenu>{renderNavItems(bottomNavItems)}</SidebarMenu>
      </div>
    </>
  );
}
