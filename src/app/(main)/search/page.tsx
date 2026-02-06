import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getProducts, getFilteredCategories, getFilteredBrands } from "@/lib/data";
import { ProductCard } from "@/components/product/product-card";
import { ProductSort } from "@/components/product/product-sort";
import { MobileFilterSheet } from "@/components/product/mobile-filter-sheet";
import { ProductFilters } from "@/components/product/product-filters";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function ProductListSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 min-[1200px]:grid-cols-3 xl:grid-cols-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-full aspect-[4/5]" />
            ))}
        </div>
    )
}

function PaginationComponent({ totalPages, currentPage, query, sortBy, categories, brands }: { totalPages: number, currentPage: number, query?: string, sortBy?: string, categories?: string, brands?: string }) {
    if (totalPages <= 1) return null;

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
        if (query) params.set('q', query);
        if (sortBy && sortBy !== 'newest') params.set('sort', sortBy);
        if (categories) params.set('categories', categories);
        if (brands) params.set('brands', brands);
        params.set(name, value);
        return params.toString();
    }

    return (
        <Pagination>
            <PaginationContent>
                {currentPage > 1 && (
                    <PaginationItem>
                        <PaginationPrevious href={`/search?${createQueryString('page', String(currentPage - 1))}`} />
                    </PaginationItem>
                )}
                {rangeWithDots.map((page, index) => {
                    if (typeof page === 'string') {
                        return <PaginationItem key={`ellipsis-${index}`}><PaginationEllipsis /></PaginationItem>;
                    }
                    return (
                        <PaginationItem key={page}>
                            <PaginationLink href={`/search?${createQueryString('page', String(page))}`} isActive={currentPage === page}>
                                {page}
                            </PaginationLink>
                        </PaginationItem>
                    );
                })}
                {currentPage < totalPages && (
                    <PaginationItem>
                        <PaginationNext href={`/search?${createQueryString('page', String(currentPage + 1))}`} />
                    </PaginationItem>
                )}
            </PaginationContent>
        </Pagination>
    );
}

async function ProductGrid({ query, currentPage, sortBy, categories, brands, categoriesData, brandsData }: { query: string, currentPage: number, sortBy?: string, categories?: string, brands?: string, categoriesData: any[], brandsData: any[] }) {
    const limit = 24;
    const categoryIds = categories?.split(',').filter(Boolean);
    const brandIds = brands?.split(',').filter(Boolean);

    const { products, totalCount } = await getProducts({
        query,
        limit,
        page: currentPage,
        sortBy,
        categoryIds: categoryIds && categoryIds.length > 0 ? categoryIds : undefined,
        brandIds: brandIds && brandIds.length > 0 ? brandIds : undefined
    });
    const totalPages = Math.ceil(totalCount / limit);

    if (products.length === 0) {
        return (
            <div className="space-y-12">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/30 p-4 min-[1200px]:hidden">
                    <MobileFilterSheet categories={categoriesData} brands={brandsData} />
                    <ProductSort />
                </div>
                <div className="py-24 text-center border-2 border-dashed rounded-none">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold tracking-tight uppercase">No Matches Found</h2>
                    <p className="text-muted-foreground mt-2 max-w-sm mx-auto">We couldn't find any products matching "{query}". Try adjusting your filters or search terms.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 border p-4 bg-white shadow-sm">
                <div className="flex items-center gap-3 w-full sm:w-auto min-[1200px]:hidden">
                    <MobileFilterSheet categories={categoriesData} brands={brandsData} />
                </div>
                <p className="hidden min-[1200px]:block text-sm font-medium">
                    Showing <span className="text-primary">{products.length}</span> of <span className="font-bold">{totalCount}</span> results
                </p>
                <ProductSort />
            </div>

            <p className="min-[1200px]:hidden text-sm font-medium">
                Showing <span className="text-primary">{products.length}</span> of <span className="font-bold">{totalCount}</span> results
            </p>

            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 min-[1200px]:grid-cols-3 xl:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
                {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} priority={index < 8} />
                ))}
            </div>

            <div className="pt-10 border-t">
                <PaginationComponent totalPages={totalPages} currentPage={currentPage} query={query} sortBy={sortBy} categories={categories} brands={brands} />
            </div>
        </div>
    )
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string, page?: string, sort?: string, categories?: string, brands?: string }> }) {
    const sParams = await searchParams;
    const query = sParams?.q || '';
    const currentPage = Number(sParams?.page) || 1;
    const sortBy = sParams?.sort || 'newest';
    const categoriesFilter = sParams?.categories || '';
    const brandsFilter = sParams?.brands || '';

    const [categoriesData, brandsData] = await Promise.all([
        getFilteredCategories({ query }),
        getFilteredBrands({ query })
    ]);

    const breadcrumbItems = [
        { name: 'Home', href: '/' },
        { name: 'Search', href: '/search' },
        { name: query || 'All Products', href: `/search?q=${query}` }
    ];

    return (
        <div className="bg-[#fcfcfc] min-h-screen">
            <div className="bg-black text-white pt-4 pb-6 md:pt-6 md:pb-8 relative overflow-hidden">
                <div className="container relative z-10">
                    <Breadcrumb items={breadcrumbItems} className="text-white" />
                    <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <h1 className="text-2xl md:text-4xl font-black font-headline tracking-tighter uppercase leading-none">
                                {query ? `Search: ${query}` : "All Products"}
                            </h1>
                            <div className="h-1 w-16 md:h-1.5 md:w-24 bg-orange-500"></div>
                            <p className="text-zinc-400 text-sm md:text-base font-medium">
                                Showing results for your search. High quality products at best prices.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-zinc-900 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            </div>

            <div className="container py-12">
                <div className="grid grid-cols-1 min-[1200px]:grid-cols-4 gap-12">
                    <main className="col-span-1 min-[1200px]:col-span-3">
                        <Suspense key={query + currentPage + sortBy + categoriesFilter + brandsFilter} fallback={<ProductListSkeleton />}>
                            <ProductGrid
                                query={query}
                                currentPage={currentPage}
                                sortBy={sortBy}
                                categories={categoriesFilter}
                                brands={brandsFilter}
                                categoriesData={categoriesData}
                                brandsData={brandsData}
                            />
                        </Suspense>
                    </main>

                    <aside className="hidden min-[1200px]:block min-[1200px]:col-span-1 bg-card border border-zinc-200">
                        <div className="sticky top-24 space-y-8 p-4">
                            <div>
                                <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-black">
                                    <h2 className="text-lg font-black uppercase tracking-tight font-headline">Filters</h2>
                                    {categoriesFilter || brandsFilter ? (
                                        <Button variant="link" asChild className="p-0 h-auto font-bold text-[10px] uppercase tracking-widest hover:text-orange-600">
                                            <Link href={`/search?q=${query}`}>
                                                Reset All
                                            </Link>
                                        </Button>
                                    ) : null}
                                </div>
                                <Suspense fallback={<Skeleton className=" w-full" />}>
                                    <ProductFilters categories={categoriesData} brands={brandsData} />
                                </Suspense>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}
