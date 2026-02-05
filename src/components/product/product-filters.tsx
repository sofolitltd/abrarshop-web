"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Category, Brand } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type ProductFiltersProps = {
    categories: Category[];
    brands: Brand[];
    hideCategories?: boolean;
    hideBrands?: boolean;
};

export function ProductFilters({ categories = [], brands = [], hideCategories = false, hideBrands = false }: ProductFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [isCatSectionOpen, setIsCatSectionOpen] = useState(true);
    const [isBrandSectionOpen, setIsBrandSectionOpen] = useState(true);


    // Get all parent category IDs for default expansion
    const parentCategoryIds = categories
        .filter(c => categories.some(child => child.parentId === c.id))
        .map(c => c.id);

    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(parentCategoryIds));

    // Get selected filters from URL
    const selectedCategories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
    const selectedBrands = searchParams.get('brands')?.split(',').filter(Boolean) || [];



    // Sort categories hierarchically
    const categoryMap = new Map<string, any>();
    categories.forEach(c => categoryMap.set(c.id, { ...c, children: [], level: 0 }));

    const roots: any[] = [];

    // Build Tree
    categories.forEach(c => {
        const node = categoryMap.get(c.id);
        if (c.parentId && categoryMap.has(c.parentId)) {
            categoryMap.get(c.parentId)!.children.push(node);
        } else {
            roots.push(node);
        }
    });

    // Flatten Tree with visibility control
    const visibleCategories: any[] = [];

    function traverse(nodes: any[], level: number) {
        nodes.sort((a, b) => a.name.localeCompare(b.name));
        nodes.forEach(node => {
            node.level = level;
            visibleCategories.push(node);

            // Only show children if parent is expanded
            if (node.children.length > 0 && expandedCategories.has(node.id)) {
                traverse(node.children, level + 1);
            }
        });
    }

    traverse(roots, 0);

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    const updateFilters = (type: 'category' | 'brand', id: string, checked: boolean) => {
        const params = new URLSearchParams(searchParams);

        if (type === 'category') {
            let cats = selectedCategories;
            if (checked) {
                cats = [...cats, id];
            } else {
                cats = cats.filter(c => c !== id);
            }

            if (cats.length > 0) {
                params.set('categories', cats.join(','));
            } else {
                params.delete('categories');
            }
        } else {
            let brds = selectedBrands;
            if (checked) {
                brds = [...brds, id];
            } else {
                brds = brds.filter(b => b !== id);
            }

            if (brds.length > 0) {
                params.set('brands', brds.join(','));
            } else {
                params.delete('brands');
            }
        }

        // Reset to page 1 when filters change
        params.delete('page');

        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex flex-col gap-4 w-full">

            {/* --- CATEGORIES SECTION --- */}
            {!hideCategories && (
                <div className="border rounded-md">
                    <button
                        onClick={() => setIsCatSectionOpen(!isCatSectionOpen)}
                        className="flex items-center justify-between w-full p-2 hover:text-primary transition-colors"
                    >
                        <h3 className="text-sm uppercase font-semibold tracking-wider">Categories</h3>
                        {isCatSectionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    {isCatSectionOpen && <Separator />}

                    {isCatSectionOpen && (
                        <div className="max-h-[400px] overflow-y-auto p-2 space-y-0.5">
                            {visibleCategories.map(category => {
                                const hasChildren = category.children.length > 0;
                                const isExpanded = expandedCategories.has(category.id);
                                const isChecked = selectedCategories.includes(category.id);

                                // Check if it's a Top Level Category (Level 0)
                                const isMainCat = category.level === 0;

                                return (
                                    <div key={category.id} className="flex flex-col">
                                        <div
                                            onClick={() => hasChildren && toggleCategory(category.id)}
                                            className={`
                                            group flex items-center justify-between p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer
                                            ${!isMainCat ? "ml-4" : ""} 
                                        `} /* ml-2 adds the 8px space for sub-menus */
                                        >
                                            <div className="flex items-center space-x-3 flex-1">
                                                <Checkbox
                                                    id={`cat-${category.id}`}
                                                    checked={isChecked}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onCheckedChange={(checked) => updateFilters('category', category.id, checked as boolean)}
                                                />
                                                <Label
                                                    htmlFor={`cat-${category.id}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className={`
                                                    cursor-pointer text-sm transition-colors
                                                    ${isMainCat
                                                            ? "font-bold text-primary" // Bold and Colored for Main
                                                            : "font-normal text-muted-foreground group-hover:text-foreground" // Regular for Sub
                                                        }
                                                `}
                                                >
                                                    {category.name}
                                                </Label>
                                            </div>
                                            {hasChildren && (
                                                <div className={isMainCat ? "text-primary" : "text-muted-foreground"}>
                                                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* --- BRANDS SECTION --- */}
            {!hideBrands && (
                <div className="border rounded-md">
                    <button
                        onClick={() => setIsBrandSectionOpen(!isBrandSectionOpen)}
                        className="flex items-center justify-between w-full p-2 hover:text-primary transition-colors"
                    >
                        <h3 className="text-sm uppercase font-semibold tracking-wider">Brands</h3>
                        {isBrandSectionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    {isBrandSectionOpen && <Separator />}

                    {isBrandSectionOpen && (
                        <div className="max-h-[300px] overflow-y-auto p-2">
                            {brands.map(brand => {
                                const isChecked = selectedBrands.includes(brand.id);

                                return (
                                    <div
                                        key={brand.id}
                                        className="group flex items-center space-x-3 p-1.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                                    >
                                        <Checkbox
                                            id={`brand-${brand.id}`}
                                            checked={isChecked}
                                            onCheckedChange={(checked) => updateFilters('brand', brand.id, checked as boolean)}
                                        />
                                        <Label
                                            htmlFor={`brand-${brand.id}`}
                                            className="cursor-pointer text-sm flex-1 group-hover:text-primary font-normal text-muted-foreground hover:text-foreground"
                                        >
                                            {brand.name}
                                        </Label>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );

}
