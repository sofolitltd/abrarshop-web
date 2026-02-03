import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';
import { SidebarNav } from "@/components/admin/sidebar-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/icon.svg" alt="Abrar Shop Logo" width={24} height={24} />
              <span className="font-semibold text-lg">Abrar Shop</span>
            </Link>
            <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                <Link href="/" aria-label="Back to shop">
                    <Home className="size-4" />
                </Link>
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-background/95 px-6 sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">Admin Panel</h1>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
