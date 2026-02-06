"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, User, ShoppingBag, Menu } from "lucide-react";
import { LogoutButton } from "./logout-button";
import { cn } from "@/lib/utils";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function AccountNav() {
    const pathname = usePathname();

    const navItems = [
        {
            name: "Dashboard",
            href: "/account",
            icon: ShoppingBag,
        },
        {
            name: "My Orders",
            href: "/account/orders",
            icon: Package,
        },
        {
            name: "Profile Settings",
            href: "/account/profile",
            icon: User,
        },
    ];

    const NavLinks = ({ isMobile = false }: { isMobile?: boolean }) => (
        <div className={cn("space-y-1", isMobile ? "mt-8" : "")}>
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 font-bold uppercase text-xs tracking-widest transition-colors group",
                            isActive
                                ? "bg-black text-white"
                                : "border border-zinc-100 hover:bg-zinc-50"
                        )}
                    >
                        <item.icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                        <span className={cn(
                            isMobile ? "inline" : "md:hidden lg:inline"
                        )}>
                            {item.name}
                        </span>
                    </Link>
                );
            })}
            <LogoutButton showLabelOnMd={false} />
        </div>
    );

    return (
        <>
            {/* Desktop/Tablet Sidebar - col-span handled by parent grid */}
            <div className="hidden md:block md:col-span-1 lg:col-span-2 space-y-1">
                <NavLinks />
            </div>

            {/* Mobile Menu Button - Visible on SM only */}
            <div className="md:hidden mb-6">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full h-14 flex items-center justify-between px-6 rounded-none border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <Menu className="h-5 w-5" />
                                <span className="font-black uppercase text-sm tracking-tighter">Account Menu</span>
                            </div>
                            <div className="h-full w-px bg-zinc-200 mx-1" />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Navigate</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[85vw] max-w-[320px] rounded-none border-r-4 border-black p-6">
                        <SheetHeader className="text-left border-b-2 border-zinc-900 pb-6 mb-2">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-black flex items-center justify-center">
                                    <span className="text-white font-black text-xl italic italic">A</span>
                                </div>
                                <div>
                                    <SheetTitle className="font-black uppercase tracking-tight text-xl leading-none">Abrar Shop</SheetTitle>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Customer Account</p>
                                </div>
                            </div>
                        </SheetHeader>
                        <NavLinks isMobile />
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}
