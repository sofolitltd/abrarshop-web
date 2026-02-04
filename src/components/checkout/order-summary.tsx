"use client";

import { useCart } from "@/context/cart-context";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function OrderSummary() {
  const { items, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-center">Your cart is empty.</p>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-4">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes="64px"
              />
              <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {item.quantity}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm leading-tight">{item.name}</h3>
              <p className="text-sm text-muted-foreground">
                Qty: {item.quantity}
              </p>
            </div>
            <p className="font-semibold text-sm">
              {(item.price * item.quantity).toFixed(0)}৳
            </p>
          </div>
        ))}
      </div>
      <Separator />
      <div className="flex gap-2">
        <Input placeholder="Coupon code" />
        <Button variant="outline" className="flex-shrink-0">Apply</Button>
      </div>
      <Separator />
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <p className="text-muted-foreground">Subtotal</p>
          <p className="font-medium">{totalPrice.toFixed(0)}৳</p>
        </div>
        <div className="flex justify-between">
          <p className="text-muted-foreground">Shipping</p>
          <p className="font-medium">Free</p>
        </div>
        <div className="flex justify-between">
          <p className="text-muted-foreground">Taxes</p>
          <p className="font-medium">0.00৳</p>
        </div>
      </div>
      <Separator />
      <div className="flex justify-between text-base font-bold">
        <p>Total</p>
        <p>{totalPrice.toFixed(0)}৳</p>
      </div>
    </div>
  );
}
