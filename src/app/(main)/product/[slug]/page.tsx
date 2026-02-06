
import { getProductBySlug, getCategories, getProductReviews } from "@/lib/data";
import { ProductRatingInfo } from "@/components/product/product-rating-info";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product/product-gallery";
import { Separator } from "@/components/ui/separator";
import { ProductDetailsTabs } from "@/components/product/product-details-tabs";
import { RelatedProducts } from "@/components/product/related-products";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ProductPurchaseCard } from "@/components/product/product-purchase-card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";
import { CopyButton } from "@/components/ui/copy-button";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product not found",
    };
  }

  const description = product.description
    ? product.description.substring(0, 160)
    : `${product.name} at only Tk ${product.price.toLocaleString()}. ${product.stock > 0 ? `Only ${product.stock} units left in stock.` : 'Out of Stock.'} Buy now for the best price in Bangladesh at Abrar Shop.`;

  return {
    title: `${product.name} Price in Bangladesh`,
    description: description,
    openGraph: {
      title: `${product.name} Price in Bangladesh`,
      description: description,
      images: [
        {
          url: product.images[0],
          width: 500,
          height: 500,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const reviews = await getProductReviews(product.id);
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  // Fetch categories to build hierarchical breadcrumb
  const allCategories = await getCategories();
  const breadcrumbItems = [{ name: 'Home', href: '/' }];

  if (product.categoryId) {
    const parentTrail: any[] = [];
    let currentId: string | null = product.categoryId;

    // Trace up the tree
    while (currentId) {
      const cat = allCategories.find(c => c.id === currentId);
      if (cat) {
        parentTrail.unshift(cat);
        currentId = cat.parentId;
      } else {
        break;
      }
    }

    // Add to breadcrumb items with cumulative slugs
    let cumulativeSlug = "";
    parentTrail.forEach(cat => {
      // Note: We're assuming the full slug path matches the category page structure
      // For simplicity here, we'll try to reconstruct the slug path or use a flat structure if complex
      // Based on the category page, it uses a full slug reconstructed from the chain
      cumulativeSlug = cumulativeSlug ? `${cumulativeSlug}/${cat.slug}` : cat.slug;
      breadcrumbItems.push({
        name: cat.name,
        href: `/category/${cumulativeSlug}`
      });
    });
  }

  // Add the product itself
  breadcrumbItems.push({ name: product.name, href: `/product/${product.slug}` });

  return (
    <>
      <div className="container py-6">
        <div className="mb-6 md:mb-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Product Gallery */}
          <ProductGallery images={product.images} productName={product.name} />

          {/* Product Info */}
          <div className="space-y-6 md:-mt-1.5">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-headline leading-tight mt-0">{product.name}</h1>

              <div className="flex flex-wrap items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 px-2 py-0.5 border text-[12px] font-medium text-zinc-500 tracking-wider">
                  Product Id:
                  <span className="font-bold">{product.sku}</span>
                  <CopyButton value={String(product.sku)} className="ml-1" />
                </div>
                {averageRating && (
                  <ProductRatingInfo averageRating={averageRating} reviewCount={reviews.length} />
                )}
              </div>
              <div className="mt-5 space-y-4">
                <div className="bg-[#f5f6f7] px-3 py-2 inline-block min-w-[180px]">
                  <span className="text-[#666] text-xs block mb-0.5">Special Price</span>
                  <p className="text-2xl font-bold text-black">Tk {product.price.toLocaleString()}</p>
                </div>

                <div className="space-y-2.5">
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="flex items-center">
                      <span className="w-32 text-sm text-[#666] shrink-0">Regular Price</span>
                      <span className="text-sm">Tk {product.originalPrice.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex items-center">
                    <span className="w-32 text-sm text-[#666] shrink-0">Brand</span>
                    {product.brandSlug ? (
                      <Link
                        href={`/brand/${product.brandSlug}`}
                        className="text-sm font-medium hover:text-orange-600 transition-colors"
                      >
                        {product.brand}
                      </Link>
                    ) : (
                      <span className="text-sm">{product.brand || 'N/A'}</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 text-sm text-[#666] shrink-0">Category</span>
                    <span className="text-sm">
                      {product.category ? (
                        <Link href={`/category/${product.categorySlug}`} className="text-sm font-medium hover:text-orange-600 transition-colors">
                          {product.category}
                        </Link>
                      ) : (
                        <span className="text-[#666] italic">Uncategorized</span>
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-0">
                    <span className="w-32 hidden sm:block text-sm text-[#666] shrink-0">Stock</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {product.stock > 0 ? (
                        <>
                          <Badge className="bg-green-500 font-bold text-white border-none shadow-none hover:bg-green-600 font-medium text-[12px] px-1.5 py-0 rounded-[2px] w-fit">
                            In Stock
                          </Badge>
                          {product.stock <= 10 ? (
                            <p className="text-[12px] font-black text-orange-600 tracking-tight animate-pulse">
                              Hurry! Only <span className="text-red-600">{product.stock}</span> items left
                            </p>
                          ) : (
                            <p className="text-[12px] text-zinc-500">({product.stock} Available)</p>
                          )}
                        </>
                      ) : (
                        <Badge variant="destructive" className="font-medium text-[12px] px-1.5 py-0 rounded-[2px]">
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Separator />
            {/* Purchase Card */}
            <ProductPurchaseCard product={product} />
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-16 md:mt-24" id="reviews">
          <ProductDetailsTabs product={product} reviews={reviews} />
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts categoryId={product.categoryId} currentProductId={product.id} />
    </>
  );
}
