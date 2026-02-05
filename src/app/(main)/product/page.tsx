import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ProductFilters } from "@/components/product/product-filters";
import { getProducts, getCategories, getBrands, getBrandsByCategoryIds } from "@/lib/data";
import { ProductCard } from "@/components/product/product-card";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination";
import { ProductSort } from "@/components/product/product-sort";
import { MobileFilterSheet } from "@/components/product/mobile-filter-sheet";
import type { Category, Brand } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function ProductListSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 min-[1200px]:grid-cols-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-full aspect-[4/5]" />
            ))}
        </div>
    )
}

function PaginationComponent({ totalPages, currentPage, query, sortBy, categories, brands }: { totalPages: number, currentPage: number, query?: string, sortBy?: string, categories?: string, brands?: string }) {
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
                        <PaginationPrevious href={`/product?${createQueryString('page', String(currentPage - 1))}`} />
                    </PaginationItem>
                )}
                {rangeWithDots.map((page, index) => {
                    if (typeof page === 'string') {
                        return <PaginationItem key={`ellipsis-${index}`}><PaginationEllipsis /></PaginationItem>;
                    }
                    return (
                        <PaginationItem key={page}>
                            <PaginationLink href={`/product?${createQueryString('page', String(page))}`} isActive={currentPage === page}>
                                {page}
                            </PaginationLink>
                        </PaginationItem>
                    );
                })}
                {currentPage < totalPages && (
                    <PaginationItem>
                        <PaginationNext href={`/product?${createQueryString('page', String(currentPage + 1))}`} />
                    </PaginationItem>
                )}
            </PaginationContent>
        </Pagination>
    );
}


async function ProductGrid({
    query,
    currentPage,
    sortBy,
    categories,
    brands,
    categoriesData,
    brandsData
}: {
    query?: string,
    currentPage: number,
    sortBy?: string,
    categories?: string,
    brands?: string,
    categoriesData: Category[],
    brandsData: Brand[]
}) {
    const limit = 24;

    // Split comma-separated IDs into arrays
    const categoryIds = categories?.split(',').filter(Boolean) || [];
    const brandIds = brands?.split(',').filter(Boolean) || [];

    const { products, totalCount } = await getProducts({
        query,
        limit,
        page: currentPage,
        sortBy,
        categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
        brandIds: brandIds.length > 0 ? brandIds : undefined
    });
    const totalPages = Math.ceil(totalCount / limit);

    if (products.length === 0) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between border border-zinc-200 p-2 min-[1400px]:hidden">
                    <MobileFilterSheet categories={categoriesData} brands={brandsData} />
                    <ProductSort />
                </div>
                <div className="col-span-full text-center py-12">
                    <h2 className="text-2xl font-semibold">No Products Found</h2>
                    <p className="text-muted-foreground mt-2">Try adjusting your search terms or filters.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 border border-zinc-200 p-2">
                {/* Mobile/Tablet Header: Filter + Sort */}
                <div className="flex items-center justify-between min-[1400px]:hidden w-full">
                    <MobileFilterSheet categories={categoriesData} brands={brandsData} />
                    <ProductSort />
                </div>

                {/* Desktop Header: Count + Sort */}
                <div className="hidden min-[1400px]:flex items-center justify-between w-full">
                    <p className="text-sm text-muted-foreground">
                        Showing {products.length} of {totalCount} products
                    </p>
                    <ProductSort />
                </div>
            </div>

            {/* Mobile/Tablet Text outside the box */}
            <p className="min-[1400px]:hidden text-sm text-muted-foreground">
                Showing {products.length} of {totalCount} products
            </p>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 min-[1400px]:grid-cols-4 md:gap-6">
                {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} priority={index < 8} />
                ))}
            </div>
            <PaginationComponent totalPages={totalPages} currentPage={currentPage} query={query} sortBy={sortBy} categories={categories} brands={brands} />
        </div>
    )
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string, page?: string, sort?: string, categories?: string, brands?: string }> }) {
    const sParams = await searchParams;
    const query = sParams?.q || '';
    const currentPage = Number(sParams?.page) || 1;
    const sortBy = sParams?.sort || 'newest';
    const categoriesFilter = sParams?.categories || '';
    const brandsFilter = sParams?.brands || '';

    const categoryIds = categoriesFilter.split(',').filter(Boolean);
    const [categoriesData, brandsData] = await Promise.all([
        getCategories(),
        categoryIds.length > 0 ? getBrandsByCategoryIds(categoryIds) : getBrands()
    ]);

    return (
        <div className="container py-6">
            <div className="mb-8">
                <Breadcrumb items={[{ name: 'Home', href: '/' }, { name: 'Product', href: '/product' }]} />
                <h1 className="text-3xl font-bold tracking-tight font-headline mt-4">
                    {query ? `Search results for "${query}"` : "All Products"}
                </h1>
            </div>

            <div className="grid grid-cols-1 min-[1400px]:grid-cols-4 gap-8">
                <aside className="hidden min-[1400px]:block min-[1400px]:col-span-1">
                    <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>


                        {/* add filter tile and clean up */}
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xl font-bold tracking-tight font-headline">Filters</h2>
                            {categoriesFilter || brandsFilter ? (
                                <Button variant="link" asChild className="p-0 h-auto">
                                    <Link href="/product">
                                        Clear
                                    </Link>
                                </Button>
                            ) : (
                                <Button variant="link" disabled className="p-0 h-auto opacity-50 cursor-not-allowed">
                                    Clear
                                </Button>
                            )}
                        </div>




                        {/*  */}
                        <ProductFilters categories={categoriesData} brands={brandsData} />
                    </Suspense>
                </aside>

                <main className="col-span-1 min-[1400px]:col-span-3">
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
            </div>
        </div>
    )
}
