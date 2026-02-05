"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ProductFilters } from "@/components/product/product-filters";
import { BrandFilters } from "@/components/product/brand-filters";
import { Filter, X } from "lucide-react";
import type { Category, Brand } from "@/lib/types";
import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";

type MobileFilterSheetProps = {
    categories: Category[];
    brands: Brand[];
    hideCategories?: boolean;
    hideBrands?: boolean;
};

export function MobileFilterSheet({ categories, brands, hideCategories = false, hideBrands = false }: MobileFilterSheetProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [open, setOpen] = useState(false);
    const showCategories = categories.length > 0;

    // Check if any filters are active (categories or brands)
    const hasActiveFilters = searchParams.has('categories') || searchParams.has('brands');

    const clearFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('categories');
        params.delete('brands');
        params.delete('page');
        router.push(`${pathname}?${params.toString()}`);
        // No longer closing the sheet automatically
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0 flex flex-col gap-0 h-full">
                {/* Fixed Top Section */}
                <div className="flex flex-col shrink-0">
                    <SheetHeader className="px-6 py-2 text-left">
                        <SheetTitle className="text-xl font-bold tracking-tight font-headline">Filters</SheetTitle>
                    </SheetHeader>
                    <Separator />

                    <div className="px-6 py-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-2 text-muted-foreground hover:text-foreground h-8"
                            onClick={clearFilters}
                            disabled={!hasActiveFilters}
                        >
                            <X className="h-3.5 w-3.5" />
                            Clear All Filters
                        </Button>
                    </div>
                    <Separator />
                </div>

                {/* Scrollable Filters Section */}
                <div className="flex-1 overflow-y-auto px-6 py-4 pb-10">
                    <ProductFilters
                        categories={categories}
                        brands={brands}
                        hideCategories={hideCategories}
                        hideBrands={hideBrands}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}
