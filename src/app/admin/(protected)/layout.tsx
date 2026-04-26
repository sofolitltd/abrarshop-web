import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Link from 'next/link';
import { SidebarToggle } from "@/components/admin/sidebar-footer-toggle";
import { SidebarNav } from "@/components/admin/sidebar-nav";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SITE_CONFIG } from "@/lib/config";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = (await cookies()).get("admin_session");

  if (!session) {
    redirect("/admin/login");
  }
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-zinc-200">
        <SidebarHeader className="border-b border-zinc-200 h-14 justify-center">
          <div className="flex items-center px-2 group-data-[collapsible=icon]:justify-center">
            <Link href="/" className="flex items-center gap-2">
              {/* Collapsed: show "A" initial */}
              <span className="hidden group-data-[collapsible=icon]:block font-black text-xl tracking-tighter leading-none">
                {SITE_CONFIG.name.split(' ')[0][0]}<span className="text-orange-600">{SITE_CONFIG.name.split(' ')[1][0]}</span>
              </span>

              {/* Expanded: full logo matching main site */}
              <span className="font-black text-xl uppercase tracking-tighter group-data-[collapsible=icon]:hidden">
                {SITE_CONFIG.name.split(' ')[0]} <span className="text-orange-600">{SITE_CONFIG.name.split(' ')[1]}</span>
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
