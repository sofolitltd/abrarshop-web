
import { getProductBySlug } from "@/lib/data";
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

  return {
    title: `${product.name} Price in Bangladesh`,
    description: (product.description || "").substring(0, 160),
    openGraph: {
      title: `${product.name} Price in Bangladesh`,
      description: (product.description || "").substring(0, 160),
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

  return (
    <>
      <div className="container py-6">
        <div className="mb-6">
          <Breadcrumb
            items={[
              { name: 'Home', href: '/' },
              { name: 'Products', href: '/products' },
              ...(product.category ? [{ name: product.category, href: `/category/${product.categorySlug}` }] : []),
              { name: product.name, href: `/products/${product.slug}` }
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">

          <ProductGallery images={product.images} productName={product.name} />

          <div className="space-y-6 md:-mt-1.5">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-headline leading-tight mt-0">{product.name}</h1>
              <div className="mt-5 space-y-4">
                <div className="bg-[#f5f6f7] px-4 py-2 inline-block rounded-sm">
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
                    <span className="w-32 text-sm text-[#666] shrink-0">Status</span>
                    <div>
                      {product.stock > 0 ? (
                        <Badge className="bg-[#e7f9ee] text-[#2ac37d] border-none shadow-none hover:bg-[#e7f9ee] font-medium text-[12px] px-1.5 py-0 rounded-[2px]">In Stock</Badge>
                      ) : (
                        <Badge variant="destructive" className="font-medium text-[12px] px-1.5 py-0 rounded-[2px]">Out of Stock</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 text-sm text-[#666] shrink-0">Brand</span>
                    <span className="text-sm">{product.brand}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 text-sm text-[#666] shrink-0">Category</span>
                    <span className="text-sm">
                      {product.category ? (
                        <Link href={`/category/${product.categorySlug}`} className="hover:text-primary transition-colors">
                          {product.category}
                        </Link>
                      ) : (
                        <span className="text-[#666] italic">Uncategorized</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 text-sm text-[#666] shrink-0">Product Code</span>
                    <span className="text-sm">{product.sku || product.id}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <ProductPurchaseCard product={product} />
          </div>
        </div>

        <div className="mt-16 md:mt-24" id="reviews">
          <ProductDetailsTabs product={product} />
        </div>
      </div>
      <RelatedProducts categoryId={product.categoryId} currentProductId={product.id} />
    </>
  );
}
