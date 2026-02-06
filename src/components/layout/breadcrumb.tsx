import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

type BreadcrumbItem = {
    name: string;
    href: string;
};

type BreadcrumbProps = {
    items: BreadcrumbItem[];
    className?: string;
};

export function Breadcrumb({ items, className }: BreadcrumbProps) {
    return (
        <nav aria-label="Breadcrumb" className={cn("text-sm font-medium", className)}>
            <ol className="flex flex-wrap items-center gap-x-1 gap-y-1">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <li key={item.name} className="flex items-center">
                            <Link
                                href={item.href}
                                className={cn(
                                    "transition-colors hover:text-current hover:opacity-100",
                                    isLast
                                        ? "font-bold opacity-100 pointer-events-none"
                                        : "opacity-70"
                                )}
                            >
                                {item.name}
                            </Link>
                            {!isLast && (
                                <ChevronRight className="h-3.5 w-3.5 mx-0.5 opacity-40 shrink-0" />
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
