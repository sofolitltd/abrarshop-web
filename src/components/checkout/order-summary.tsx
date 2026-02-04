"use client";

import { useCart } from "@/context/cart-context";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface OrderSummaryProps {
  deliveryFee: number;
}

export function OrderSummary({ deliveryFee }: OrderSummaryProps) {
  const { items, totalPrice: subtotal } = useCart();

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">Your cart is empty.</p>
    )
  }

  const total = subtotal + deliveryFee;

  return (
    <div className="space-y-6">
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-4">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-none border border-zinc-100 bg-zinc-50">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes="64px"
              />
              <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white shadow-sm">
                {item.quantity}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm leading-tight text-zinc-800">{item.name}</h3>
              <p className="text-xs font-medium text-zinc-500 mt-1">
                Quantity: {item.quantity}
              </p>
            </div>
            <p className="font-bold text-sm text-zinc-900">
              {(item.price * item.quantity).toFixed(0)}৳
            </p>
          </div>
        ))}
      </div>

      <Separator className="bg-zinc-100" />

      <div className="flex gap-2">
        <Input placeholder="Coupon code" className="rounded-none border-zinc-200 focus-visible:ring-orange-500" />
        <Button variant="outline" className="flex-shrink-0 rounded-none border-black hover:bg-black hover:text-white transition-colors">Apply</Button>
      </div>

      <Separator className="bg-zinc-100" />

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <p className="text-zinc-500">Subtotal</p>
          <p className="font-bold text-zinc-900">{subtotal.toFixed(0)}৳</p>
        </div>
        <div className="flex justify-between">
          <p className="text-zinc-500">Delivery Fee</p>
          <p className="font-bold text-orange-600">{deliveryFee.toFixed(0)}৳</p>
        </div>
      </div>

      <Separator className="bg-zinc-200" />

      <div className="flex justify-between items-center text-lg font-bold">
        <p className="uppercase tracking-tight">Total</p>
        <div className="text-right">
          <p className="text-2xl text-black">
            {total.toFixed(0)}<span className="text-sm ml-1">৳</span>
          </p>
          <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest mt-0.5">All taxes included</p>
        </div>
      </div>
    </div>
  );
}
