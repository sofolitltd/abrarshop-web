"use client";

import { OrderSummary } from "@/components/checkout/order-summary";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { useState } from "react";

import { useAuth } from "@/context/auth-context";
import Link from "next/link";

export default function CheckoutPage() {
  const [deliveryFee, setDeliveryFee] = useState(100); // Default to full country
  const { user } = useAuth();

  return (
    <div className="container mx-auto pt-4 pb-20 px-4">
      <div className="mb-6">
        <Breadcrumb
          items={[
            { name: "Home", href: "/" },
            { name: "Cart", href: "/cart" },
            { name: "Checkout", href: "/checkout" }
          ]}
        />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
          <h1 className="text-2xl font-bold tracking-tight font-headline uppercase">
            Checkout
          </h1>
          {!user && (
            <div className="text-sm">
              Already have an account?{" "}
              <Link href="/login?redirect=/checkout" className="text-orange-600 font-bold hover:underline">
                Login for faster checkout
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="lg:col-span-1">
          <CheckoutForm onDeliveryChange={setDeliveryFee} />
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-24 border border-zinc-200 bg-white rounded-none shadow-sm">
            <div className="border-b border-zinc-100 py-2.5 px-6">
              <h2 className="text-sm font-bold font-headline uppercase tracking-tight">Order Summary</h2>
            </div>
            <div className="p-6 pt-4">
              <OrderSummary deliveryFee={deliveryFee} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
