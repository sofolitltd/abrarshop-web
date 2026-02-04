import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getBrandBySlug, getProducts, getCategories, getBrands } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ProductFilters } from "@/components/product/product-filters";
import { ProductCard } from "@/components/product/product-card";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination";
import { ProductSort } from "@/components/product/product-sort";
import type { Metadata } from "next";

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const brand = await getBrandBySlug(slug);

    if (!brand) {
        return {
            title: "Brand not found",
        };
    }

    const title = `${brand.name} Products in Bangladesh`;

    return {
        title,
        description: `Shop the best selection of ${brand.name} products at Abrar Shop Bangladesh.`,
        openGraph: {
            title: title,
            description: `Shop the best selection of ${brand.name} products at Abrar Shop Bangladesh.`,
        },
    };
}

function ProductListSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-full aspect-[4/5] rounded-none" />
            ))}
        </div>
    )
}

function PaginationComponent({ totalPages, currentPage, slug, sortBy }: { totalPages: number, currentPage: number, slug: string, sortBy?: string }) {
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
        if (sortBy && sortBy !== 'newest') params.set('sort', sortBy);
        params.set(name, value);
        return params.toString();
    }

    return (
        <Pagination>
            <PaginationContent>
                {currentPage > 1 && (
                    <PaginationItem>
                        <PaginationPrevious href={`/brands/${slug}?${createQueryString('page', String(currentPage - 1))}`} className="rounded-none" />
                    </PaginationItem>
                )}
                {rangeWithDots.map((page, index) => {
                    if (typeof page === 'string') {
                        return <PaginationItem key={`ellipsis-${index}`}><PaginationEllipsis /></PaginationItem>;
                    }
                    return (
                        <PaginationItem key={page}>
                            <PaginationLink href={`/brands/${slug}?${createQueryString('page', String(page))}`} isActive={currentPage === page} className="rounded-none">
                                {page}
                            </PaginationLink>
                        </PaginationItem>
                    );
                })}
                {currentPage < totalPages && (
                    <PaginationItem>
                        <PaginationNext href={`/brands/${slug}?${createQueryString('page', String(currentPage + 1))}`} className="rounded-none" />
                    </PaginationItem>
                )}
            </PaginationContent>
        </Pagination>
    );
}

async function ProductGrid({ brandId, currentPage, sortBy, slug }: { brandId: string, currentPage: number, sortBy?: string, slug: string }) {
    const limit = 9;
    const { products, totalCount } = await getProducts({ brandId, limit, page: currentPage, sortBy });
    const totalPages = Math.ceil(totalCount / limit);

    if (products.length === 0) {
        return (
            <div className="col-span-full text-center py-12">
                <h2 className="text-2xl font-semibold">No Products Found for this Brand</h2>
                <p className="text-muted-foreground mt-2">Please check back later or browse other brands.</p>
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
            <PaginationComponent totalPages={totalPages} currentPage={currentPage} slug={slug} sortBy={sortBy} />
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

export default async function BrandPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams?: Promise<{ page?: string, sort?: string }> }) {
    const { slug } = await params;
    const sParams = await searchParams;
    const currentPage = Number(sParams?.page) || 1;
    const sortBy = sParams?.sort || 'newest';

    const brand = await getBrandBySlug(slug);

    if (!brand) {
        notFound();
    }

    return (
        <div className="container py-6">
            <div className="mb-8">
                <Breadcrumb items={[{ name: 'Home', href: '/' }, { name: 'Products', href: '/products' }, { name: brand.name, href: `/brands/${brand.slug}` }]} />
                <h1 className="text-3xl font-bold tracking-tight font-headline mt-4">
                    {brand.name}
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <aside className="lg:col-span-1">
                    <Suspense fallback={<Skeleton className="h-[500px] w-full rounded-none" />}>
                        <FiltersSidebar />
                    </Suspense>
                </aside>

                <main className="lg:col-span-3">
                    <Suspense key={brand.id + currentPage + sortBy} fallback={<ProductListSkeleton />}>
                        <ProductGrid brandId={brand.id} currentPage={currentPage} sortBy={sortBy} slug={slug} />
                    </Suspense>
                </main>
            </div>
        </div>
    )
}
