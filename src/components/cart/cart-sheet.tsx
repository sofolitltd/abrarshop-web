"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Trash2, ShoppingBag, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { Separator } from "../ui/separator";

type CartSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const {
    items,
    totalPrice,
    totalItems,
    updateItemQuantity,
    removeItem,
  } = useCart();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6 pb-0">
          <SheetTitle>Shopping Cart ({totalItems})</SheetTitle>
        </SheetHeader>
        <Separator />
        {items.length > 0 ? (
          <>
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-6 px-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 border p-2">
                    <div className="relative border size-22.5 flex-shrink-0 overflow-hidden rounded-none">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base truncate">{item.name}</h3>
                      <div className="flex items-center justify-between">

                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                          Tk {""}{item.price.toLocaleString()}
                        </p>
                        <p className="font-bold text-sm sm:text-base whitespace-nowrap">Tk{" "}
                          {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between">
                        <div className="flex items-center border rounded-none">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8 rounded-none hover:bg-zinc-100"
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            aria-label={`Decrease quantity for ${item.name}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 sm:w-10 text-center text-xs sm:text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8 rounded-none hover:bg-zinc-100"
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            aria-label={`Increase quantity for ${item.name}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="h-4 w-4" />

                        </Button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="p-6 border-t">
              <div className="flex w-full flex-col gap-3">
                <div className="flex justify-between text-base sm:text-lg font-bold">
                  <span>Subtotal</span>
                  <span>Tk {""}{totalPrice.toLocaleString()}</span>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
                  Shipping and delivery charge are calculated during checkout.
                </p>
                <div className="flex flex-col gap-2 mt-2">
                  <Button asChild size="lg" className="w-full rounded-none h-12 text-sm sm:text-base" onClick={() => onOpenChange(false)}>
                    <Link href="/checkout">Proceed to Checkout</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full rounded-none h-12 text-sm sm:text-base" onClick={() => onOpenChange(false)}>
                    <Link href="/cart">View Shopping Cart</Link>
                  </Button>
                </div>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingBag className="h-24 w-24 text-muted-foreground/50" strokeWidth={1} />
            <h2 className="text-xl font-semibold">Your cart is empty</h2>
            <p className="text-muted-foreground">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Continue Shopping
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
