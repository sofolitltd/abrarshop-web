import { getCategories } from "@/lib/data";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import Link from "next/link";
import Image from "next/image";
import { LayoutGrid } from "lucide-react";
import type { Metadata } from "next";
import type { Category } from "@/lib/types";

export const metadata: Metadata = {
    title: "Categories - Abrar Shop",
    description: "Browse products by category at Abrar Shop Bangladesh.",
};

export default async function CategoriesPage() {
    // Fetch all categories
    const categories = await getCategories();

    // Sort into roots and children
    const roots = categories.filter(c => !c.parentId);
    const childrenMap = new Map<string, Category[]>();
    categories.forEach(c => {
        if (c.parentId) {
            if (!childrenMap.has(c.parentId)) {
                childrenMap.set(c.parentId, []);
            }
            childrenMap.get(c.parentId)!.push(c);
        }
    });

    return (
        <div className="container pt-6 pb-20">
            <div className="mb-8">
                <Breadcrumb
                    items={[
                        { name: 'Home', href: '/' },
                        { name: 'Categories', href: '/categories' }
                    ]}
                />
                <h1 className="text-3xl font-bold tracking-tight font-headline mt-4">
                    Product <span className="text-orange-500">Categories</span>
                </h1>
                <p className="text-muted-foreground mt-2">Explore our wide range of products across various categories.</p>
            </div>

            {roots.length === 0 ? (
                <div className="text-center py-20 bg-[#f5f6f7] rounded-lg">
                    <LayoutGrid className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <h2 className="text-xl font-medium text-muted-foreground">No categories found.</h2>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {roots.map(category => {
                        const children = childrenMap.get(category.id) || [];

                        return (
                            <div key={category.id} className="flex flex-col space-y-4">
                                <Link
                                    href={`/category/${category.slug}`}
                                    className="group block relative aspect-[4/3] overflow-hidden bg-[#f5f6f7] border border-zinc-100 transition-all hover:border-orange-500"
                                >
                                    {category.imageUrl ? (
                                        <Image
                                            src={category.imageUrl}
                                            alt={category.name}
                                            fill
                                            className="object-contain transition-transform duration-500 scale-80 group-hover:scale-90"
                                            sizes="(min-width: 1280px) 300px, 250px"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center opacity-10">
                                            <LayoutGrid className="w-16 h-16" />
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                        <h2 className="text-white font-bold text-lg">{category.name}</h2>
                                    </div>
                                </Link>

                                {children.length > 0 && (
                                    <ul className="space-y-2">
                                        {children.slice(0, 5).map((child: Category) => (
                                            <li key={child.id}>
                                                <Link
                                                    href={`/category/${child.slug}`}
                                                    className="text-sm text-zinc-600 hover:text-orange-500 transition-colors flex items-center gap-2"
                                                >
                                                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                                                    {child.name}
                                                </Link>
                                            </li>
                                        ))}
                                        {children.length > 5 && (
                                            <li>
                                                <Link
                                                    href={`/category/${category.slug}`}
                                                    className="text-xs font-bold text-orange-500 uppercase tracking-tighter hover:underline"
                                                >
                                                    + View All Subcategories
                                                </Link>
                                            </li>
                                        )}
                                    </ul>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
