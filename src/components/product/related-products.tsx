import { getProducts } from "@/lib/data";
import { ProductCard } from "./product-card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type RelatedProductsProps = {
    categoryId: string | null;
    currentProductId: string;
};

export async function RelatedProducts({ categoryId, currentProductId }: RelatedProductsProps) {
    if (!categoryId) return null;

    // Fetch 5 related products from the same category, excluding the current one
    const { products: relatedProducts } = await getProducts({ categoryId, limit: 5, excludeProductId: currentProductId });

    if (relatedProducts.length === 0) {
        return null;
    }

    const firstProduct = relatedProducts[0];
    const categoryLink = firstProduct.categorySlug ? `/category/${firstProduct.categorySlug}` : '/products';

    return (
        <section className="py-10 border-t">
            <div className="container">
                <div className="flex md:flex-row flex-col items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold tracking-tight font-headline">
                        Related Products
                    </h2>
                    <Link href={categoryLink} className="flex items-center gap-2 text-primary bg-black text-white px-4 py-1 mt-2 md:mt-0">
                        View All <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {relatedProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}
