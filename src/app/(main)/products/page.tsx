import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ProductFilters } from "@/components/product/product-filters";
import { getProducts, getCategories, getBrands } from "@/lib/data";
import { ProductCard } from "@/components/product/product-card";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination";
import { ProductSort } from "@/components/product/product-sort";

function ProductListSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-full aspect-[4/5]" />
            ))}
        </div>
    )
}

function PaginationComponent({ totalPages, currentPage, query, sortBy }: { totalPages: number, currentPage: number, query?: string, sortBy?: string }) {
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
        params.set(name, value);
        return params.toString();
    }

    return (
        <Pagination>
            <PaginationContent>
                {currentPage > 1 && (
                    <PaginationItem>
                        <PaginationPrevious href={`/products?${createQueryString('page', String(currentPage - 1))}`} />
                    </PaginationItem>
                )}
                {rangeWithDots.map((page, index) => {
                    if (typeof page === 'string') {
                        return <PaginationItem key={`ellipsis-${index}`}><PaginationEllipsis /></PaginationItem>;
                    }
                    return (
                        <PaginationItem key={page}>
                            <PaginationLink href={`/products?${createQueryString('page', String(page))}`} isActive={currentPage === page}>
                                {page}
                            </PaginationLink>
                        </PaginationItem>
                    );
                })}
                {currentPage < totalPages && (
                    <PaginationItem>
                        <PaginationNext href={`/products?${createQueryString('page', String(currentPage + 1))}`} />
                    </PaginationItem>
                )}
            </PaginationContent>
        </Pagination>
    );
}


async function ProductGrid({ query, currentPage, sortBy, categories, brands }: { query?: string, currentPage: number, sortBy?: string, categories?: string, brands?: string }) {
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
            <div className="col-span-full text-center py-12">
                <h2 className="text-2xl font-semibold">No Products Found</h2>
                <p className="text-muted-foreground mt-2">Try adjusting your search terms or filters.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between border border-zinc-200 p-2">
                <p className="text-sm text-muted-foreground">
                    Showing {products.length} of {totalCount} products
                </p>
                <ProductSort />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
            <PaginationComponent totalPages={totalPages} currentPage={currentPage} query={query} sortBy={sortBy} />
        </div>
    )
}

async function FiltersSidebar() {
    const [categories, brands] = await Promise.all([
        getCategories(),
        getBrands()
    ]);

    return <ProductFilters categories={categories} brands={brands} />;
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string, page?: string, sort?: string, categories?: string, brands?: string }> }) {
    const sParams = await searchParams;
    const query = sParams?.q || '';
    const currentPage = Number(sParams?.page) || 1;
    const sortBy = sParams?.sort || 'newest';
    const categories = sParams?.categories || '';
    const brands = sParams?.brands || '';

    return (
        <div className="container py-6">
            <div className="mb-8">
                <Breadcrumb items={[{ name: 'Home', href: '/' }, { name: 'Products', href: '/products' }]} />
                <h1 className="text-3xl font-bold tracking-tight font-headline mt-4">
                    {query ? `Search results for "${query}"` : "All Products"}
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <aside className="lg:col-span-1">
                    <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
                        <FiltersSidebar />
                    </Suspense>
                </aside>

                <main className="lg:col-span-3">
                    <Suspense key={query + currentPage + sortBy + categories + brands} fallback={<ProductListSkeleton />}>
                        <ProductGrid query={query} currentPage={currentPage} sortBy={sortBy} categories={categories} brands={brands} />
                    </Suspense>
                </main>
            </div>
        </div>
    )
}
