"use client";

import { useTransition, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { processCheckout } from "@/lib/actions";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  mobile: z.string().min(11, "A valid 11-digit mobile number is required.").max(11, "A valid 11-digit mobile number is required."),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
  address: z.string().min(1, "Address is required."),
  district: z.string().min(1, "District is required."),
  deliveryMethod: z.enum(['gaibandha', 'full_country']),
  paymentMethod: z.enum(['bkash', 'cod']),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  onDeliveryChange: (fee: number) => void;
}

export function CheckoutForm({ onDeliveryChange }: CheckoutFormProps) {
  const { clearCart, items, totalPrice } = useCart();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      mobile: "",
      email: "",
      address: "",
      district: "",
      deliveryMethod: "full_country",
      paymentMethod: "cod",
    },
  });

  // Watch for delivery method changes
  const deliveryMethod = form.watch("deliveryMethod");

  useEffect(() => {
    const fee = deliveryMethod === 'gaibandha' ? 50 : 100;
    onDeliveryChange(fee);
  }, [deliveryMethod, onDeliveryChange]);

  const onSubmit = (data: CheckoutFormValues) => {
    if (items.length === 0) {
      toast({
        title: "Your cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive",
      });
      return;
    }

    const currentDeliveryFee = deliveryMethod === 'gaibandha' ? 50 : 100;
    const finalTotal = totalPrice + currentDeliveryFee;

    startTransition(async () => {
      try {
        const result = await processCheckout(data, finalTotal);

        if (result.success && result.url) {
          if (result.url.startsWith('/')) {
            // Internal redirect (COD or Mock)
            clearCart();
            window.location.href = result.url;
          } else {
            // External redirect (bKash)
            toast({
              title: "Order Initialized",
              description: "Redirecting to bKash Secure Gateway...",
            });
            // Small delay to let toast show
            setTimeout(() => {
              clearCart();
              window.location.href = result.url!;
            }, 1500);
          }
        } else {
          toast({
            title: "Checkout failed",
            description: result.message || "An unexpected error occurred. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Checkout failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card className="border-zinc-200 rounded-none shadow-sm">
          <CardHeader className="border-b border-zinc-100 py-3">
            <CardTitle className="text-base font-bold font-headline uppercase tracking-tight">Shipping Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
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
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-zinc-200 rounded-none shadow-sm">
            <CardHeader className="border-b border-zinc-100 py-2.5">
              <CardTitle className="text-sm font-bold font-headline uppercase tracking-tight">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-row flex-wrap gap-3">
                      <FormItem className="flex items-center space-x-3 space-y-0 p-2.5 border border-zinc-100 hover:bg-zinc-50 transition-colors flex-1 min-w-[180px] cursor-pointer">
                        <FormControl><RadioGroupItem value="cod" className="text-orange-500 border-zinc-300 h-4 w-4" /></FormControl>
                        <FormLabel className="text-sm font-medium cursor-pointer flex-1">Cash on Delivery</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0 p-2.5 border border-zinc-100 hover:bg-zinc-50 transition-colors flex-1 min-w-[180px] cursor-pointer">
                        <FormControl><RadioGroupItem value="bkash" className="text-orange-500 border-zinc-300 h-4 w-4" /></FormControl>
                        <FormLabel className="text-sm font-medium cursor-pointer flex-1 text-pink-600 font-bold">bKash Gateway</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card className="border-zinc-200 rounded-none shadow-sm">
            <CardHeader className="border-b border-zinc-100 py-2.5">
              <CardTitle className="text-sm font-bold font-headline uppercase tracking-tight">Delivery Method</CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <FormField control={form.control} name="deliveryMethod" render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-row flex-wrap gap-3">
                      <FormItem className="flex items-center space-x-3 space-y-0 p-2.5 border border-zinc-100 hover:bg-zinc-50 transition-colors flex-1 min-w-[180px] cursor-pointer">
                        <FormControl><RadioGroupItem value="gaibandha" className="text-orange-500 border-zinc-300 h-4 w-4" /></FormControl>
                        <FormLabel className="text-sm font-medium cursor-pointer flex-1">
                          Gaibandha
                          <span className="ml-2 font-bold text-orange-500">50৳</span>
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0 p-2.5 border border-zinc-100 hover:bg-zinc-50 transition-colors flex-1 min-w-[180px] cursor-pointer">
                        <FormControl><RadioGroupItem value="full_country" className="text-orange-500 border-zinc-300 h-4 w-4" /></FormControl>
                        <FormLabel className="text-sm font-medium cursor-pointer flex-1">
                          Countrywide
                          <span className="ml-2 font-bold text-orange-500">100৳</span>
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isPending} size="lg" className="px-12 py-6 bg-black hover:bg-zinc-900 rounded-none font-bold uppercase tracking-widest text-white">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Order
          </Button>
        </div>
      </form>
    </Form>
  );
}
