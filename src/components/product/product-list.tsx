import { getProducts } from "@/lib/data";
import { ProductCard } from "./product-card";

export async function ProductList({ query, limit, isFeatured }: { query?: string, limit?: number, isFeatured?: boolean }) {
  const { products } = await getProducts({ query, limit, isFeatured });

  if (!products || products.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <h2 className="text-2xl font-semibold">No Products Found</h2>
        <p className="text-muted-foreground mt-2">
          {query
            ? "Try adjusting your search terms."
            : "It looks like the store is empty. Please check back later."
          }
        </p>
      </div>
    )
  }

  return (
    <>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </>
  );
}
