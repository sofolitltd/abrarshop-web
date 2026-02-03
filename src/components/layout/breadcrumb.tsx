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
        <nav aria-label="Breadcrumb" className={cn("text-sm text-muted-foreground", className)}>
            <ol className="flex items-center space-x-1">
                {items.map((item, index) => (
                    <li key={item.name} className="flex items-center">
                        <Link href={item.href} className="hover:text-foreground transition-colors">
                            {item.name}
                        </Link>
                        {index < items.length - 1 && <ChevronRight className="h-4 w-4 mx-1" />}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
