import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getProducts, getCategories, getBrandsByCategoryId } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ProductCard } from "@/components/product/product-card";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination";
import { ProductSort } from "@/components/product/product-sort";
import { MobileFilterSheet } from "@/components/product/mobile-filter-sheet";
import { BrandFilters } from "@/components/product/brand-filters";
import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import type { Metadata } from "next";
import type { Brand, Category } from "@/lib/types";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
    params: Promise<{ slug: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const categorySlug = slug[slug.length - 1];
    const category = await getCategoryBySlug(categorySlug);

    if (!category) {
        return {
            title: "Category not found",
        };
    }

    const title = `${category.name} Price in Bangladesh`;

    return {
        title,
        description: `Find the best prices for ${category.name} in Bangladesh at Abrar Shop.`,
        openGraph: {
            title: title,
            description: `Find the best prices for ${category.name} in Bangladesh at Abrar Shop.`,
            images: category.imageUrl
                ? [
                    {
                        url: category.imageUrl,
                        width: 200,
                        height: 200,
                        alt: category.name,
                    },
                ]
                : [],
        },
    };
}


function ProductListSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 min-[1400px]:grid-cols-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-full aspect-[4/5]" />
            ))}
        </div>
    )
}

function PaginationComponent({ totalPages, currentPage, slug, sortBy, brands }: { totalPages: number, currentPage: number, slug: string, sortBy?: string, brands?: string }) {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const delta = 2;
    const left = currentPage - delta;
    const right = currentPage + delta + 1;
    const range = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= left && i < right)) {
            range.push(i);
        }
    }

    for (const i of range) {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1);
            } else if (i - l !== 1) {
                rangeWithDots.push('...');
            }
        }
        rangeWithDots.push(i);
        l = i;
    }

    const createQueryString = (name: string, value: string) => {
        const params = new URLSearchParams();
        if (sortBy && sortBy !== 'newest') params.set('sort', sortBy);
        if (brands) params.set('brands', brands);
        params.set(name, value);
        return params.toString();
    }

    return (
        <Pagination>
            <PaginationContent>
                {currentPage > 1 && (
                    <PaginationItem>
                        <PaginationPrevious href={`/category/${slug}?${createQueryString('page', String(currentPage - 1))}`} />
                    </PaginationItem>
                )}
                {rangeWithDots.map((page, index) => {
                    if (typeof page === 'string') {
                        return <PaginationItem key={`ellipsis-${index}`}><PaginationEllipsis /></PaginationItem>;
                    }
                    return (
                        <PaginationItem key={page}>
                            <PaginationLink href={`/category/${slug}?${createQueryString('page', String(page))}`} isActive={currentPage === page}>
                                {page}
                            </PaginationLink>
                        </PaginationItem>
                    );
                })}
                {currentPage < totalPages && (
                    <PaginationItem>
                        <PaginationNext href={`/category/${slug}?${createQueryString('page', String(currentPage + 1))}`} />
                    </PaginationItem>
                )}
            </PaginationContent>
        </Pagination>
    );
}


async function ProductGrid({
    categoryId,
    currentPage,
    sortBy,
    slug,
    brands,
    brandsData
}: {
    categoryId: string,
    currentPage: number,
    sortBy?: string,
    slug: string,
    brands?: string,
    brandsData: Brand[]
}) {
    const limit = 24;

    const brandIds = brands?.split(',').filter(Boolean) || [];

    const { products, totalCount } = await getProducts({
        categoryId,
        limit,
        page: currentPage,
        sortBy,
        brandIds: brandIds.length > 0 ? brandIds : undefined
    });
    const totalPages = Math.ceil(totalCount / limit);

    if (products.length === 0) {
        return (
            <div className="space-y-12">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/30 p-4 min-[1400px]:hidden">
                    <MobileFilterSheet categories={[]} brands={brandsData} />
                    <ProductSort />
                </div>
                <div className="py-24 text-center border-2 border-dashed rounded-none">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold tracking-tight uppercase">No Products Found</h2>
                    <p className="text-muted-foreground mt-2 max-w-sm mx-auto">We couldn't find any products in this selection. Try adjusting your filters or checking back later.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border p-4 bg-white shadow-sm">
                <p className="text-sm font-medium">
                    Showing <span className="text-primary">{products.length}</span> of <span className="font-bold">{totalCount}</span> products
                </p>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="min-[1400px]:hidden flex-1">
                        <MobileFilterSheet categories={[]} brands={brandsData} />
                    </div>
                    <ProductSort />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 min-[1400px]:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
                {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} priority={index < 8} />
                ))}
            </div>

            <div className="pt-10 border-t">
                <PaginationComponent totalPages={totalPages} currentPage={currentPage} slug={slug} sortBy={sortBy} brands={brands} />
            </div>
        </div>
    )
}


export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string[] }>, searchParams?: Promise<{ page?: string, sort?: string, brands?: string }> }) {
    const { slug } = await params;
    const sParams = await searchParams;
    const currentPage = Number(sParams?.page) || 1;
    const sortBy = sParams?.sort || 'newest';
    const brandsFilter = sParams?.brands || '';

    const fullSlug = slug.join('/');
    const categorySlug = slug[slug.length - 1];
    const category = await getCategoryBySlug(categorySlug);

    if (!category) {
        notFound();
    }

    // Fetch all categories and brands related to this category
    const [allCategories, brandsData] = await Promise.all([
        getCategories(),
        getBrandsByCategoryId(category.id)
    ]);

    // Get subcategories for this category
    const subcategories = allCategories.filter(cat => cat.parentId === category.id);
    const hasSubcategories = subcategories.length > 0;

    // Build breadcrumbs by tracing parents
    const breadcrumbItems = [{ name: 'Home', href: '/' }];
    const parentTrail: Category[] = [];
    let currentParentId = category.parentId;

    while (currentParentId) {
        const parent = allCategories.find(c => c.id === currentParentId);
        if (parent) {
            parentTrail.unshift(parent);
            currentParentId = parent.parentId;
        } else {
            break;
        }
    }

    // Add parents to breadcrumbs with cumulative slugs
    let cumulativeSlug = "";
    parentTrail.forEach(parent => {
        cumulativeSlug = cumulativeSlug ? `${cumulativeSlug}/${parent.slug}` : parent.slug;
        breadcrumbItems.push({
            name: parent.name,
            href: `/category/${cumulativeSlug}`
        });
    });

    // Add current category
    breadcrumbItems.push({
        name: category.name,
        href: `/category/${fullSlug}`
    });

    return (
        <div className="bg-[#fcfcfc] min-h-screen">
            {/* --- PREMIUM CATEGORY HEADER --- */}
            <div className="bg-black text-white pt-12 pb-16 relative overflow-hidden">
                <div className="container relative z-10">
                    <Breadcrumb items={breadcrumbItems} className="text-zinc-400 hover:text-white" />
                    <div className="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter uppercase leading-none">
                                {category.name}
                            </h1>
                            <div className="h-1.5 w-24 bg-orange-500"></div>
                            <p className="text-zinc-400 max-w-xl text-sm md:text-base font-medium">
                                Shop the latest {category.name} collection. We offer the best prices in Bangladesh for premium electronics and lifestyle products.
                            </p>
                        </div>
                    </div>
                </div>
                {/* Abstract background elements */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-zinc-900 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            </div>

            <div className="container py-12">
                {/* --- SUB-CATEGORIES SECTION --- */}
                {hasSubcategories && (
                    <div className="mb-16">
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-lg font-black uppercase tracking-widest leading-none">Explore Collections</h2>
                            <div className="flex-1 h-px bg-zinc-200"></div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {subcategories.map(subcat => (
                                <Link
                                    key={subcat.id}
                                    href={`/category/${fullSlug}/${subcat.slug}`}
                                    className="group block"
                                >
                                    <div className="space-y-4 text-center">
                                        <div className="aspect-square relative overflow-hidden bg-white border group-hover:border-orange-500 transition-all duration-500 shadow-sm">
                                            {subcat.imageUrl ? (
                                                <Image
                                                    src={subcat.imageUrl}
                                                    alt={subcat.name}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center p-6 grayscale opacity-20 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                                    <ShoppingBag className="w-12 h-12" />
                                                </div>
                                            )}
                                            <div className="absolute inset-x-0 bottom-0 h-1 bg-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                                        </div>
                                        <p className="font-bold text-xs uppercase tracking-widest group-hover:text-orange-600 transition-colors">
                                            {subcat.name}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 min-[1400px]:grid-cols-4 gap-12">
                    {/* --- SIDEBAR FILTERS --- */}
                    <aside className="hidden min-[1400px]:block min-[1400px]:col-span-1">
                        <div className="sticky top-24 space-y-8">
                            <div>
                                <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-black">
                                    <h2 className="text-lg font-black uppercase tracking-tight font-headline">Filters</h2>
                                    {brandsFilter ? (
                                        <Button variant="link" asChild className="p-0 h-auto font-bold text-[10px] uppercase tracking-widest hover:text-orange-600">
                                            <Link href={`/category/${fullSlug}`}>
                                                Reset All
                                            </Link>
                                        </Button>
                                    ) : null}
                                </div>
                                <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                                    <BrandFilters brands={brandsData} />
                                </Suspense>
                            </div>

                            {/* Promotional Banner in Sidebar */}
                            <div className="bg-orange-500 p-8 text-white space-y-4">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">Flash Deal</p>
                                <h3 className="text-2xl font-black uppercase tracking-tighter leading-tight">Get 10% Off on Accessories</h3>
                                <Button className="bg-white text-black hover:bg-black hover:text-white rounded-none w-full font-bold text-xs uppercase tracking-widest mt-4">
                                    Shop Now
                                </Button>
                            </div>
                        </div>
                    </aside>

                    {/* --- PRODUCT MAIN GRID --- */}
                    <main className="col-span-1 min-[1400px]:col-span-3">
                        <Suspense key={category.id + currentPage + sortBy + brandsFilter} fallback={<ProductListSkeleton />}>
                            <ProductGrid
                                categoryId={category.id}
                                currentPage={currentPage}
                                sortBy={sortBy}
                                slug={fullSlug}
                                brands={brandsFilter}
                                brandsData={brandsData}
                            />
                        </Suspense>
                    </main>
                </div>
            </div>
        </div>
    )
}
