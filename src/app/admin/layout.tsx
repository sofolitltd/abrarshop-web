import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

import Link from 'next/link';
import Image from 'next/image';
import { SidebarToggle } from "@/components/admin/sidebar-footer-toggle";
import { SidebarNav } from "@/components/admin/sidebar-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-zinc-200">
        <SidebarHeader className="border-b border-zinc-200 h-14 justify-center">
          <div className="flex items-center px-2 group-data-[collapsible=icon]:justify-center">
            <Link href="/" className="flex items-center gap-2">
              {/* Logo - Only visible when sidebar is collapsed */}
              <div className="hidden group-data-[collapsible=icon]:block h-8 w-8 relative flex items-center justify-center shrink-0">
                <Image
                  src="/abrarshop-logo.png"
                  alt="Abrar Shop"
                  fill
                  className="object-contain"
                />
              </div>

              {/* Text Name - Only visible when NOT collapsed */}
              <span className="font-black text-sm uppercase tracking-tighter group-data-[collapsible=icon]:hidden">
                Abrar <span className="text-orange-600">Shop</span>
              </span>
            </Link>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="border-t border-zinc-200 p-0">
          <SidebarToggle />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        {/* Mobile Header - Visible only on small screens */}
        <header className="flex h-14 items-center gap-4 border-b bg-white border-zinc-200 px-4 sticky top-0 z-40 md:hidden">
          <SidebarTrigger />
          <Link href="/" className="flex items-center gap-2">
            <span className="font-black text-xs uppercase tracking-tighter">
              Abrar <span className="text-orange-600">Shop</span>
            </span>
          </Link>
        </header>
        <main className="flex-1 overflow-auto p-6 bg-zinc-50/50">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
