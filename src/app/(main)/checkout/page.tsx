"use client";

import { OrderSummary } from "@/components/checkout/order-summary";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { useState } from "react";

export default function CheckoutPage() {
  const [deliveryFee, setDeliveryFee] = useState(100); // Default to full country

  return (
    <div className="container mx-auto pt-4 pb-20">
      <div className="mb-6">
        <Breadcrumb
          items={[
            { name: "Home", href: "/" },
            { name: "Cart", href: "/cart" },
            { name: "Checkout", href: "/checkout" }
          ]}
        />
        <h1 className="text-2xl font-bold tracking-tight font-headline mt-4 uppercase">
          Checkout
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="lg:col-span-1">
          <CheckoutForm onDeliveryChange={setDeliveryFee} />
        </div>
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-zinc-200 rounded-none shadow-sm">
            <CardHeader className="border-b border-zinc-100 py-2.5">
              <CardTitle className="text-sm font-bold font-headline uppercase tracking-tight">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <OrderSummary deliveryFee={deliveryFee} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
