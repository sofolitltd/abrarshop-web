"use client";

import { OrderSummary } from "@/components/checkout/order-summary";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

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
        </div>
      </div>

      <CheckoutForm onDeliveryChange={setDeliveryFee}>
        {({ form, isPending, DeliveryMethodField, PaymentMethodField, SubmitButton }) => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Shipping Contact */}
            <div className="lg:col-span-1">
              {/* Login Prompt */}
              {!user && (
                <div className="text-sm p-4 border border-zinc-200 bg-white rounded-none shadow-sm mb-6">
                  Already have an account?{" "}
                  <Link href="/login?redirect=/checkout" className="text-orange-600 font-bold hover:underline">
                    Login for faster checkout
                  </Link>
                </div>
              )}

              {/* Shipping Contact Form */}
              <div className="border border-zinc-200 bg-white rounded-none shadow-sm">
                <div className="border-b border-zinc-100 py-3 px-6">
                  <h2 className="text-base uppercase tracking-wider font-bold">Shipping Information</h2>
                </div>
                <div className="space-y-3 p-6 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="firstName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase text-zinc-500">First Name</FormLabel>
                        <FormControl><Input placeholder="John" className="rounded-none border-zinc-200 focus-visible:ring-orange-500" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="lastName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase text-zinc-500">Last Name</FormLabel>
                        <FormControl><Input placeholder="Doe" className="rounded-none border-zinc-200 focus-visible:ring-orange-500" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="mobile" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase text-zinc-500">Mobile Number</FormLabel>
                        <FormControl><Input placeholder="017********" className="rounded-none border-zinc-200 focus-visible:ring-orange-500" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase text-zinc-500">Email (Optional)</FormLabel>
                        <FormControl><Input placeholder="m@example.com" className="rounded-none border-zinc-200 focus-visible:ring-orange-500" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-zinc-500">Full Address</FormLabel>
                      <FormControl><Input placeholder="House #, Road #, Area..." className="rounded-none border-zinc-200 focus-visible:ring-orange-500" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="district" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-zinc-500">District</FormLabel>
                      <FormControl><Input placeholder="e.g. Gaibandha" className="rounded-none border-zinc-200 focus-visible:ring-orange-500" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary & Payment Flow */}
            <div className="lg:col-span-1 space-y-6">
              {/* Order Summary with Delivery Method */}
              <div className="border border-zinc-200 bg-white rounded-none shadow-sm">
                <div className="border-b border-zinc-100 py-2.5 px-6">
                  <h2 className="text-base uppercase tracking-wider font-bold">Order Summary</h2>
                </div>
                <div className="p-6 pt-4">
                  <OrderSummary deliveryFee={deliveryFee} deliveryMethodField={DeliveryMethodField} />
                </div>
              </div>

              {/* Payment Method */}
              <div className="border border-zinc-200 bg-white rounded-none shadow-sm">
                <div className="border-b border-zinc-100 py-2.5 px-6">
                  <h2 className="text-base uppercase tracking-wider font-bold">Payment Method</h2>
                </div>
                <div className="p-6 pt-3">
                  {PaymentMethodField}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                {SubmitButton}
              </div>
            </div>
          </div>
        )}
      </CheckoutForm>
    </div>
  );
}
