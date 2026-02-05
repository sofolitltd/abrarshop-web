import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { getBrandBySlug, getProducts, getCategoriesByBrandId, getBrands } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ProductCard } from "@/components/product/product-card";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination";
import { ProductSort } from "@/components/product/product-sort";
import { MobileFilterSheet } from "@/components/product/mobile-filter-sheet";
import { ProductFilters } from "@/components/product/product-filters";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";

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
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 min-[1400px]:grid-cols-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
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
                        <PaginationPrevious href={`/brand/${slug}?${createQueryString('page', String(currentPage - 1))}`} className="rounded-none" />
                    </PaginationItem>
                )}
                {rangeWithDots.map((page, index) => {
                    if (typeof page === 'string') {
                        return <PaginationItem key={`ellipsis-${index}`}><PaginationEllipsis /></PaginationItem>;
                    }
                    return (
                        <PaginationItem key={page}>
                            <PaginationLink href={`/brand/${slug}?${createQueryString('page', String(page))}`} isActive={currentPage === page} className="rounded-none">
                                {page}
                            </PaginationLink>
                        </PaginationItem>
                    );
                })}
                {currentPage < totalPages && (
                    <PaginationItem>
                        <PaginationNext href={`/brand/${slug}?${createQueryString('page', String(currentPage + 1))}`} className="rounded-none" />
                    </PaginationItem>
                )}
            </PaginationContent>
        </Pagination>
    );
}

async function ProductGrid({ brandId, currentPage, sortBy, slug, categoriesData, brandsData, selectedCategories }: { brandId: string, currentPage: number, sortBy?: string, slug: string, categoriesData: any[], brandsData: any[], selectedCategories?: string }) {
    const limit = 24;
    const categoryIds = selectedCategories?.split(',').filter(Boolean);
    const { products, totalCount } = await getProducts({
        brandId,
        limit,
        page: currentPage,
        sortBy,
        categoryIds: categoryIds && categoryIds.length > 0 ? categoryIds : undefined
    });
    const totalPages = Math.ceil(totalCount / limit);

    if (products.length === 0) {
        return (
            <div className="space-y-12">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/30 p-4 min-[1400px]:hidden">
                    <MobileFilterSheet categories={categoriesData} brands={brandsData} hideBrands={true} />
                    <ProductSort />
                </div>
                <div className="py-24 text-center border-2 border-dashed rounded-none">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold tracking-tight uppercase">No Products Found</h2>
                    <p className="text-muted-foreground mt-2 max-w-sm mx-auto">We couldn't find any products for this brand. Try adjusting your filters or check back later.</p>
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
                        <MobileFilterSheet categories={categoriesData} brands={brandsData} hideBrands={true} />
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
                <PaginationComponent totalPages={totalPages} currentPage={currentPage} slug={slug} sortBy={sortBy} />
            </div>
        </div>
    )
}

export default async function BrandPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams?: Promise<{ page?: string, sort?: string, categories?: string }> }) {
    const { slug } = await params;
    const sParams = await searchParams;
    const currentPage = Number(sParams?.page) || 1;
    const sortBy = sParams?.sort || 'newest';
    const categoriesFilter = sParams?.categories || '';

    const brand = await getBrandBySlug(slug);

    if (!brand) {
        notFound();
    }

    const [relatedCategories, allBrands] = await Promise.all([
        getCategoriesByBrandId(brand.id),
        getBrands()
    ]);

    // Build breadcrumb items
    const breadcrumbItems = [
        { name: 'Home', href: '/' }, 
        { name: 'Brand', href: '/brand' }, 
        { name: brand.name, href: `/brand/${brand.slug}` }
    ];

    return (
        <div className="bg-[#fcfcfc] min-h-screen">
            {/* --- PREMIUM BRAND HEADER --- */}
            <div className="bg-black text-white pt-6 pb-8 relative overflow-hidden">
                <div className="container relative z-10">
                    <Breadcrumb items={breadcrumbItems} className="text-zinc-400 hover:text-white" />
                    <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <h1 className="text-3xl md:text-4xl font-black font-headline tracking-tighter uppercase leading-none">
                                {brand.name}
                            </h1>
                            <div className="h-1.5 w-24 bg-orange-500"></div>
                            <p className="text-zinc-400 text-sm md:text-base font-medium">
                                Shop the best {brand.name} products in Bangladesh. Premium quality with authentic warranty.
                            </p>
                        </div>
                        {brand.imageUrl && (
                            <div className="flex-shrink-0">
                                <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white rounded-lg overflow-hidden">
                                    <Image
                                        src={brand.imageUrl}
                                        alt={brand.name}
                                        fill
                                        className="object-contain p-4"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* Abstract background elements */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-zinc-900 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            </div>

            <div className="container py-12">
                <div className="grid grid-cols-1 min-[1400px]:grid-cols-4 gap-12">
                    {/* --- PRODUCT MAIN GRID --- */}
                    <main className="col-span-1 min-[1400px]:col-span-3">
                        <Suspense key={brand.id + currentPage + sortBy + categoriesFilter} fallback={<ProductListSkeleton />}>
                            <ProductGrid
                                brandId={brand.id}
                                currentPage={currentPage}
                                sortBy={sortBy}
                                slug={slug}
                                categoriesData={relatedCategories}
                                brandsData={allBrands}
                                selectedCategories={categoriesFilter}
                            />
                        </Suspense>
                    </main>

                    {/* --- SIDEBAR FILTERS --- */}
                    <aside className="hidden min-[1400px]:block min-[1400px]:col-span-1 bg-card border border-zinc-200">
                        <div className="sticky top-24 space-y-8 p-4">
                            <div>
                                <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-black">
                                    <h2 className="text-lg font-black uppercase tracking-tight font-headline">Filters</h2>
                                    {categoriesFilter ? (
                                        <Button variant="link" asChild className="p-0 h-auto font-bold text-[10px] uppercase tracking-widest hover:text-orange-600">
                                            <Link href={`/brand/${brand.slug}`}>
                                                Reset All
                                            </Link>
                                        </Button>
                                    ) : null}
                                </div>
                                <Suspense fallback={<Skeleton className=" w-full" />}>
                                    <ProductFilters categories={relatedCategories} brands={[]} hideBrands={true} />
                                </Suspense>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}