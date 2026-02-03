import { ProductList } from "@/components/product/product-list";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function ProductListSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-full aspect-[4/5]" />
            ))}
        </div>
    )
}

export default function SearchPage({ searchParams }: { searchParams?: { q?: string } }) {
    const query = searchParams?.q || '';

    return (
        <div className="container py-12 md:py-20">
            <h1 className="text-3xl font-bold tracking-tight font-headline mb-8">
                {query ? `Search results for "${query}"` : "All Products"}
            </h1>
            <Suspense key={query} fallback={<ProductListSkeleton />}>
                <ProductList query={query} />
            </Suspense>
        </div>
    )
}
