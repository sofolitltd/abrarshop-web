"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronRight, ChevronDown } from "lucide-react";
import type { Category, Brand } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type ProductFiltersProps = {
    categories: Category[];
    brands: Brand[];
};

export function ProductFilters({ categories = [], brands = [] }: ProductFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

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
        <div className="">
            <Card>
                <CardHeader>
                    <CardTitle>Categories</CardTitle>
                    <Separator className="mt-2" />
                </CardHeader>
                <CardContent className="max-h-[400px] overflow-y-auto space-y-2">
                    {visibleCategories.map(category => {
                        const hasChildren = category.children.length > 0;
                        const isExpanded = expandedCategories.has(category.id);
                        const isChecked = selectedCategories.includes(category.id);

                        return (
                            <div key={category.id} className="flex items-center space-x-2" >
                                {hasChildren ? (
                                    <button
                                        type="button"
                                        onClick={() => toggleCategory(category.id)}
                                        className="p-0.5 hover:bg-muted rounded transition-colors"
                                    >
                                        {isExpanded ? (
                                            <ChevronDown className="h-4 w-4" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4" />
                                        )}
                                    </button>
                                ) : (
                                    <span className="w-5" />
                                )}
                                <Checkbox
                                    id={`cat-${category.id}`}
                                    checked={isChecked}
                                    onCheckedChange={(checked) => updateFilters('category', category.id, checked as boolean)}
                                />
                                <Label
                                    htmlFor={`cat-${category.id}`}
                                    className={category.level === 0 ? "font-bold cursor-pointer" : "font-normal cursor-pointer"}
                                >
                                    {category.name}
                                </Label>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Brands</CardTitle>
                    <Separator className="mt-2" />
                </CardHeader>
                <CardContent className="max-h-[300px] overflow-y-auto space-y-2">
                    {brands.map(brand => {
                        const isChecked = selectedBrands.includes(brand.id);

                        return (
                            <div key={brand.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`brand-${brand.id}`}
                                    checked={isChecked}
                                    onCheckedChange={(checked) => updateFilters('brand', brand.id, checked as boolean)}
                                />
                                <Label htmlFor={`brand-${brand.id}`} className="font-normal cursor-pointer">{brand.name}</Label>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        </div>
    )
}
