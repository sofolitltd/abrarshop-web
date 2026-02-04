"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CartIconProps = {
  onClick?: () => void;
  className?: string;
};

export function CartIcon({ onClick, className }: CartIconProps) {
  const { totalItems } = useCart();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("relative", className)}
      onClick={onClick}
      aria-label={`Shopping cart with ${totalItems} items`}
    >
      <ShoppingBag className="h-5 w-5" />
      {totalItems > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-2 h-4 w-4 justify-center rounded-full p-0 text-xs flex items-center"
        >
          {totalItems}
        </Badge>
      )}
    </Button>
  );
}
