"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";

type ProductCardProps = {
  product: Product;
  isFeatured?: boolean;
};

export function ProductCard({ product, isFeatured = false }: ProductCardProps) {
  const savedAmount = product.originalPrice && product.originalPrice > product.price ? product.originalPrice - product.price : 0;
  const savedPercentage = product.originalPrice && savedAmount > 0 ? Math.round((savedAmount / product.originalPrice) * 100) : 0;

  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addItem(product, 1);
    toast({
      title: "Added to cart!",
      description: `"${product.name}" has been added to your cart.`,
    });
  };

  return (
    <Card className="flex h-full flex-col justify-between overflow-hidden rounded-none transition-shadow duration-300 hover:shadow-lg group border p-3">
      <Link href={`/products/${product.slug}`} className="flex flex-col bg-card">
        <div className="relative overflow-hidden">
          {savedAmount > 0 && (
            <Badge
              className="absolute z-10 rounded-none bg-primary text-primary-foreground"
            >
              Save: {savedAmount.toLocaleString()}৳ (-{savedPercentage}%)
            </Badge>
          )}
          <div className={cn("relative overflow-hidden bg-card", "aspect-square")}>
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              data-ai-hint={product.keywords?.length > 0 ? product.keywords[0] : product.name.split(' ').slice(0, 2).join(' ')}
            />
          </div>
        </div>

        <div>
          <h3 className="font-bold leading-tight text-md mt-2 min-h-[40px] mb-2">{product.name}</h3>
        </div>
      </Link>

      <div>
        <div className="flex items-baseline gap-2">
          <p className="text-md font-bold ">৳ {""}{product.price.toLocaleString()}</p>
          {product.originalPrice && product.originalPrice > product.price && (
            <p className="text-md text-muted-foreground line-through">৳ {" "}{product.originalPrice.toLocaleString()}</p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
        </Button>
      </div>
    </Card>
  );
}
