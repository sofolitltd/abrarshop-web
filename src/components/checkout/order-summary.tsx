"use client";

import { useCart } from "@/context/cart-context";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface OrderSummaryProps {
  deliveryFee: number;
  deliveryMethodField?: React.ReactNode;
}

export function OrderSummary({ deliveryFee, deliveryMethodField }: OrderSummaryProps) {
  const { items, totalPrice: subtotal } = useCart();

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">Your cart is empty.</p>
    )
  }

  const total = subtotal + deliveryFee;

  return (
    <div className="space-y-4">
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-100">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-none border border-zinc-100 bg-zinc-50">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes="56px"
              />
              <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white shadow-sm">
                {item.quantity}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xs leading-tight text-zinc-800 truncate">{item.name}</h3>
              <p className="text-[10px] font-medium text-zinc-500 mt-0.5">
                Qty: {item.quantity}
              </p>
            </div>
            <p className="font-bold text-xs text-zinc-900">
              <span className="text-xs ml-0.5">Tk</span> {(item.price * item.quantity).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <Separator className="bg-zinc-100" />

      <div className="flex gap-2">
        <Input placeholder="Coupon code" className="rounded-none border-zinc-200 focus-visible:ring-orange-500" />
        <Button variant="outline" className="flex-shrink-0 rounded-none border-black hover:bg-black hover:text-white transition-colors">Apply</Button>
      </div>

      {/* Delivery Method - Integrated into order summary */}
      {deliveryMethodField && (
        <>
          <Separator className="bg-zinc-100" />
          <div className="pt-2">
            <p className=" text-base uppercase tracking-wider font-bold border-b border-zinc-100 pb-2 mb-3">Delivery Method</p>
            {deliveryMethodField}
          </div>
        </>
      )}

      <Separator className="bg-zinc-100 " />

      <div className="space-y-2 text-xs pt-2">
        <div className="flex justify-between">
          <p className="text-zinc-500  tracking-wider font-semibold text-xs">Subtotal</p>
          <p className="font-bold text-zinc-900"> {"Tk "}{subtotal.toLocaleString()}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-zinc-500  tracking-wider font-semibold text-xs">Delivery Fee</p>
          <p className="font-bold text-orange-600"> {"Tk "}{deliveryFee.toLocaleString()}</p>
        </div>
      </div>

      <Separator className="bg-zinc-200" />

      <div className="flex justify-between items-center">
        <p className="text-sm font-black uppercase tracking-tighter">Total Payable</p>
        <div className="text-right">
          <p className="text-xl font-black text-black leading-none">
            <span className="text-xs ml-0.5">Tk</span> {total.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
