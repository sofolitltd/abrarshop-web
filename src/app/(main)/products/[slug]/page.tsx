
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
    description: product.description.substring(0, 160),
    openGraph: {
      title: `${product.name} Price in Bangladesh`,
      description: product.description.substring(0, 160),
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
          <Breadcrumb items={[{ name: 'Home', href: '/' }, { name: 'Products', href: '/products' }, { name: product.category, href: `/category/${product.categorySlug}` }, { name: product.name, href: `/products/${product.slug}` }]} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

          <ProductGallery images={product.images} productName={product.name} />

          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-headline">{product.name}</h1>
              <div className="mt-4 space-y-2">
                <div className="bg-muted px-2 py-1 inline-block">
                  <span className="text-muted-foreground text-sm block">Special Price</span>
                  <p className="text-2xl font-bold">Tk {product.price.toLocaleString()}</p>
                </div>
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="grid grid-cols-[120px_1fr] items-center mt-1">
                    <span className="text-muted-foreground text-sm block">Regular Price</span>
                    <p>Tk {product.originalPrice.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            <dl className="text-sm space-y-2">
              <div className="flex items-center">
                <dt className="w-28 font-semibold text-muted-foreground shrink-0">Status</dt>
                <dd>
                  {product.stock > 0 ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">In Stock</Badge>
                  ) : (
                    <Badge variant="destructive">Out of Stock</Badge>
                  )}
                </dd>
              </div>
              <div className="flex items-center">
                <dt className="w-28 font-semibold text-muted-foreground shrink-0">Brand</dt>
                <dd>{product.brand}</dd>
              </div>
              <div className="flex items-center">
                <dt className="w-28 font-semibold text-muted-foreground shrink-0">Category</dt>
                <dd>
                  <Link href={`/category/${product.categorySlug}`} className="hover:text-primary transition-colors">
                    {product.category}
                  </Link>
                </dd>
              </div>
              <div className="flex items-center">
                <dt className="w-28 font-semibold text-muted-foreground shrink-0">Product Code</dt>
                <dd>{product.sku || product.id}</dd>
              </div>
            </dl>

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
