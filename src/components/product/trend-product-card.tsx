import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type TrendProductCardProps = {
  product: Product;
};

export function TrendProductCard({ product }: TrendProductCardProps) {
  const discount = product.originalPrice && product.originalPrice > product.price
    ? product.originalPrice - product.price
    : 0;

  return (
    <Card className="h-full overflow-hidden rounded-lg border-border/50 hover:shadow-lg transition-shadow duration-300">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="aspect-square relative overflow-hidden bg-card p-4">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-contain transition-transform duration-300 hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px"
              data-ai-hint={product.keywords[0]}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold uppercase tracking-tighter">
              No Image
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4 space-y-2">
        <h3 className="font-semibold leading-tight truncate text-base">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className="flex items-baseline gap-2">
          <p className="text-lg font-bold text-primary">{product.price.toFixed(0)}৳</p>
        </div>
        {(product.originalPrice && discount > 0) && (
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground line-through">{product.originalPrice.toFixed(0)}৳</p>
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 font-semibold">
              ৳{discount.toFixed(0)} OFF
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
