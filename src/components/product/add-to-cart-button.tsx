"use client";

import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

export function AddToCartButton({ product, quantity, variant }: { product: Product, quantity: number, variant: 'cart' | 'buyNow' }) {
  const { addItem, setDrawerOpen } = useCart();
  const router = useRouter();

  const handleAddToCart = () => {
    addItem(product, quantity);
    setDrawerOpen(true);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    router.push('/checkout');
  }

  if (variant === 'buyNow') {
    return (
      <Button onClick={handleBuyNow} disabled={product.stock <= 0}>
        {product.stock > 0 ? 'Buy Now' : 'Out of Stock'}
      </Button>
    )
  }

  return (
    <Button variant="outline" onClick={handleAddToCart} disabled={product.stock <= 0}>
      <ShoppingCart className="mr-2 h-5 w-5" />
      {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
    </Button>
  );
}
