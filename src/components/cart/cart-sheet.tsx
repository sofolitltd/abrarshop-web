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
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

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

  const router = useRouter();
  const closedByBackButton = useRef(false);

  useEffect(() => {
    if (!open) return;

    // Push a dummy state to the history stack to catch the back button
    const originalUrl = window.location.href;
    window.history.pushState({ drawerOpen: true }, "");

    const handlePopState = () => {
      closedByBackButton.current = true;
      onOpenChange(false);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      
      // Remove dummy state if we're closing manually on the same page
      if (window.location.href === originalUrl && !closedByBackButton.current) {
        window.history.back();
      }
      closedByBackButton.current = false;
    };
  }, [open, onOpenChange]);

  const handleNavigate = (path: string) => {
    onOpenChange(false);
    // Add a small delay to allow the sheet to start closing
    setTimeout(() => {
      router.push(path);
    }, 100);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-[90%] flex-col sm:max-w-lg p-0">
        <SheetHeader className="p-0 pl-4 pt-4">
          <SheetTitle >Shopping Cart ({totalItems})</SheetTitle>
        </SheetHeader>
        <Separator />
        {items.length > 0 ? (
          <>
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-4 p-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 border border-zinc-100 bg-white p-3 shadow-sm">
                    <div className="relative border border-zinc-100 size-20 flex-shrink-0 overflow-hidden bg-zinc-50">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-[13px] uppercase tracking-tight line-clamp-1 leading-tight mb-1">
                          {item.name}
                        </h3>
                        <p className="text-[11px] font-medium text-zinc-500">
                          Tk {item.price.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-zinc-200">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-none hover:bg-zinc-50"
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-xs font-bold">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-none hover:bg-zinc-50"
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="font-black text-sm text-orange-600">
                            Tk {(item.price * item.quantity).toLocaleString()}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
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
                  <Button 
                    size="lg" 
                    className="w-full rounded-none h-12 text-sm sm:text-base" 
                    onClick={() => handleNavigate("/checkout")}
                  >
                    Proceed to Checkout
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full rounded-none h-12 text-sm sm:text-base" 
                    onClick={() => handleNavigate("/cart")}
                  >
                    View Shopping Cart
                  </Button>
                </div>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingBag className="h-24 w-24 text-muted-foreground/50" strokeWidth={1} />
            <h2 className="text-xl font-semibold">Your cart is empty</h2>
            <p className="text-muted-foreground text-sm">
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
