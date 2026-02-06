"use client";

import Link from "next/link";
import { Category } from "@/lib/types";
import { ChevronDown } from "lucide-react";

interface MainNavProps {
    categories: Category[];
}

export function MainNav({ categories }: MainNavProps) {
    // Separate parent categories (top-level) and subcategories
    const parentCategories = categories.filter(cat => !cat.parentId);
    const getSubcategories = (parentId: string) =>
        categories.filter(cat => cat.parentId === parentId);

    return (
        <div className="w-full bg-white border-b border-zinc-200 hidden min-[1200px]:block shadow-sm">
            <div className="container">
                <nav className="flex items-center gap-1">
                    {/* Home */}
                    <Link href="/" className="h-10 pr-4 flex items-center text-xs font-bold uppercase tracking-widest text-black hover:text-orange-600 transition-colors">
                        Home
                    </Link>

                    {/* Mega Menu Trigger */}
                    <div className="group relative">
                        <button className="h-10 px-4 flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-black hover:text-orange-600 transition-colors">
                            Products
                            <ChevronDown className="h-3 w-3" />
                        </button>

                        {/* Mega Menu Dropdown */}
                        <div className="absolute top-full left-0 w-[250px] bg-white border border-zinc-200 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform group-hover:translate-y-0 translate-y-1">
                            <div className="p-6 grid grid-cols-1 gap-x-8 gap-y-4">
                                <div>
                                    <h3 className="text-xs font-bold uppercase mb-4 text-zinc-400 tracking-wider">Collections</h3>
                                    <div className="space-y-2">
                                        <Link href="/product?isTrending=true" className="block text-sm font-medium text-zinc-800 hover:text-orange-600 hover:pl-2 transition-all">
                                            Trending Now
                                        </Link>
                                        <Link href="/product?isBestSelling=true" className="block text-sm font-medium text-zinc-800 hover:text-orange-600 hover:pl-2 transition-all">
                                            Best Sellers
                                        </Link>
                                        <Link href="/product?isFeatured=true" className="block text-sm font-medium text-zinc-800 hover:text-orange-600 hover:pl-2 transition-all">
                                            Featured Items
                                        </Link>
                                        {/* add all category and brand */}
                                        <Link href="/category" className="block text-sm font-medium text-zinc-800 hover:text-orange-600 hover:pl-2 transition-all">
                                            All Categories
                                        </Link>
                                        <Link href="/brand" className="block text-sm font-medium text-zinc-800 hover:text-orange-600 hover:pl-2 transition-all">
                                            All Brands
                                        </Link>



                                        <div className="pt-4 mt-4 border-t border-zinc-100">
                                            <Link href="/product" className="block text-sm font-bold text-black uppercase tracking-wide hover:text-orange-600 transition-colors">
                                                View All Products →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Level Category Links with Mega Menu Dropdowns */}
                    {parentCategories.map((category) => {
                        const subcategories = getSubcategories(category.id);
                        const hasSubcategories = subcategories.length > 0;

                        // Calculate grid columns based on number of subcategories
                        const gridCols = subcategories.length > 8 ? 3 : subcategories.length > 4 ? 2 : 1;
                        const menuWidth = gridCols === 3 ? 'w-[600px]' : gridCols === 2 ? 'w-[500px]' : 'w-[280px]';

                        return (
                            <div key={category.id} className="group relative">
                                <Link
                                    href={`/category/${category.slug}`}
                                    className="h-10 px-4 flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-black hover:text-orange-600 transition-colors"
                                >
                                    {category.name}
                                    {hasSubcategories && <ChevronDown className="h-3 w-3" />}
                                </Link>

                                {/* Subcategory Mega Menu */}
                                {hasSubcategories && (
                                    <div className={`absolute top-full left-0 ${menuWidth} bg-white border border-zinc-200 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform group-hover:translate-y-0 translate-y-1`}>
                                        <div className="p-6">
                                            <h3 className="text-xs font-bold uppercase mb-4 text-zinc-400 tracking-wider">
                                                {category.name} Categories
                                            </h3>
                                            <div className={`grid gap-x-8 gap-y-3 ${gridCols === 3 ? 'grid-cols-3' :
                                                gridCols === 2 ? 'grid-cols-2' :
                                                    'grid-cols-1'
                                                }`}>
                                                {subcategories.map((subcat) => (
                                                    <Link
                                                        key={subcat.id}
                                                        href={`/category/${subcat.slug}`}
                                                        className="block text-sm font-medium text-zinc-800 hover:text-orange-600 hover:pl-2 transition-all"
                                                    >
                                                        {subcat.name}
                                                    </Link>
                                                ))}
                                            </div>
                                            <div className="pt-4 mt-4 border-t border-zinc-100">
                                                <Link
                                                    href={`/category/${category.slug}`}
                                                    className="block text-sm font-bold text-black uppercase tracking-wide hover:text-orange-600 transition-colors"
                                                >
                                                    View All {category.name} →
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}


                </nav>
            </div>
        </div>
    );
}
