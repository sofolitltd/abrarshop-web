"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cart-context";

type ProductCardProps = {
  product: Product;
  isFeatured?: boolean;
  priority?: boolean;
};


export function ProductCard({ product, isFeatured = false, priority = false }: ProductCardProps) {
  const hasDiscount = !!(product.discount && product.discount > 0);
  const showStrikethrough = !!(product.originalPrice && product.originalPrice > product.price);

  const { addItem, setDrawerOpen } = useCart();

  const handleAddToCart = () => {
    addItem(product, 1);
    setDrawerOpen(true);
  };

  return (
    <Card className="flex h-full flex-col justify-between overflow-hidden transition-all duration-500 hover:shadow-2xl group shadow-sm bg-white hover:-translate-y-1 border border-zinc-200 rounded-md p-0 gap-0">
      <Link href={`/product/${product.slug}`} className="flex flex-col relative">
        <div className="relative overflow-hidden aspect-square bg-[#f9f9f9]">
          {hasDiscount && (
            <Badge
              className="absolute top-3 left-3 z-10 rounded-none bg-orange-600 text-white font-bold text-[10px] uppercase tracking-widest px-2 py-1 border-none"
            >
              -{product.discount}% OFF
            </Badge>
          )}

          {product.images && product.images.length > 0 && product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              priority={priority}
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-300">
              <ShoppingCart className="w-12 h-12 opacity-10" />
            </div>
          )}

          {/* Overlay Quick Add (Desktop) */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-end p-4">
            <Button
              className="w-full bg-black text-white hover:bg-orange-600 rounded-none h-10 font-bold text-[10px] uppercase tracking-[0.2em] transform translate-y-4 group-hover:translate-y-0 transition-all duration-500"
              onClick={(e) => {
                e.preventDefault();
                handleAddToCart();
              }}
              disabled={product.stock <= 0}
            >
              Add To Cart
            </Button>
          </div>
        </div>

        <div className="p-3 space-y-3">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest leading-none">
              {product.category || '-'}
            </p>

            <h3 className="font-semibold leading-tight text-sm sm:text-base line-clamp-2 group-hover:text-orange-600 transition-colors  h-14 uppercase tracking-normal">
              {product.name}
            </h3>


          </div>

          <div className="flex items-center gap-3 ">
            <p className="text-base sm:text-lg font-black text-black">৳{product.price.toLocaleString()}</p>
            {showStrikethrough && (
              <p className="text-xs sm:text-sm text-zinc-400 line-through decoration-zinc-300 font-medium">৳{product.originalPrice?.toLocaleString()}</p>
            )}
          </div>
        </div>
      </Link>

      {/* Mobile Add to Cart Button */}
      <div className="px-4 pb-4 md:hidden">
        <Button
          variant="outline"
          size="sm"
          className="w-full border-zinc-200 rounded-none font-bold text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all h-9"
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
        >
          {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
        </Button>
      </div>
    </Card>
  );
}
