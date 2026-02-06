"use client";

import { useSidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function SidebarFooterToggle() {
    const { state, isMobile } = useSidebar();
    const isCollapsed = state === "collapsed";

    return (
        <div className="flex flex-col gap-2">
            <button
                onClick={() => {
                    // The SidebarTrigger handles the click, but we want a custom button
                    // Actually, we can just use useSidebar's toggleSidebar
                }}
                className={cn(
                    "flex items-center gap-3 px-2 py-2 w-full hover:bg-zinc-100 transition-colors group",
                    isCollapsed ? "justify-center" : "justify-start"
                )}
            >
                <SidebarTrigger
                    className={cn(
                        "size-7 transition-all shrink-0",
                        isCollapsed ? "mx-0" : "-ml-1"
                    )}
                />
                {!isCollapsed && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        Collapse <span className="text-zinc-300 ml-1">Menu</span>
                    </span>
                )}
            </button>
        </div>
    );
}

// Or simpler, just wrap a custom button with toggleSidebar
export function SidebarToggle() {
    const { toggleSidebar, state } = useSidebar();
    const isCollapsed = state === "collapsed";

    return (
        <button
            onClick={toggleSidebar}
            className={cn(
                "flex items-center w-full hover:bg-zinc-100 transition-colors h-10 px-2",
                isCollapsed ? "justify-center px-0" : "justify-start gap-4"
            )}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
            <div className="h-4 w-4 shrink-0 flex items-center justify-center">
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </div>
            {!isCollapsed && (
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 whitespace-nowrap">
                    Collapse <span className="text-zinc-300 ml-1">Menu</span>
                </span>
            )}
        </button>
    );
}
