"use client";

import { useTransition, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { processCheckout } from "@/lib/actions";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TruckIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/context/auth-context";

import Image from "next/image";

const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  mobile: z.string().min(11, "A valid 11-digit mobile number is required.").max(11, "A valid 11-digit mobile number is required."),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
  address: z.string().min(1, "Address is required."),
  district: z.string().min(1, "District is required."),
  deliveryMethod: z.enum(['gaibandha', 'full_country']),
  paymentMethod: z.enum(['bkash', 'cod']),
  userId: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  onDeliveryChange: (fee: number) => void;
  children?: (props: {
    form: any;
    isPending: boolean;
    DeliveryMethodField: React.ReactNode;
    PaymentMethodField: React.ReactNode;
    SubmitButton: React.ReactNode;
  }) => React.ReactNode;
}

export function CheckoutForm({ onDeliveryChange, children }: CheckoutFormProps) {
  const { clearCart, items, totalPrice } = useCart();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const { user, profile } = useAuth();

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

  useEffect(() => {
    if (profile) {
      form.reset({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        mobile: profile.phoneNumber || "",
        address: profile.address || "",
        district: profile.district || "",
        deliveryMethod: "full_country",
        paymentMethod: "cod",
      });
    }
  }, [profile, form]);

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
        const orderData = {
          ...data,
          userId: user?.uid,
        };
        const result = await processCheckout(orderData, finalTotal, items);

        if (result.success && result.url) {
          if (result.url.startsWith('/')) {
            // Internal redirect (COD or Mock)
            clearCart();
            router.push(result.url);
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

  const DeliveryMethodField = (
    <FormField control={form.control} name="deliveryMethod" render={({ field }) => (
      <FormItem className="space-y-0">
        <FormControl>
          <RadioGroup onValueChange={field.onChange} value={field.value} className="gap-3">
            <FormItem className="flex items-center space-x-3 space-y-0 p-2.5 border border-zinc-100 hover:bg-zinc-50 transition-colors flex-1 min-w-[180px] cursor-pointer">
              <FormControl><RadioGroupItem value="gaibandha" className="text-orange-500 border-zinc-300 h-4 w-4" /></FormControl>
              <FormLabel className="text-sm font-medium cursor-pointer flex-1">
                <div className="flex w-full justify-between">
                  <p className="">Inside Gaibandha</p>
                  <span className="ml-2 font-bold ">Tk 50</span>
                </div>
              </FormLabel>
            </FormItem>

            {/*  */}
            <FormItem className="flex items-center space-x-3 space-y-0 p-2.5 border border-zinc-100 hover:bg-zinc-50 transition-colors flex-1 min-w-[180px] cursor-pointer">
              <FormControl><RadioGroupItem value="full_country" className="text-orange-500 border-zinc-300 h-4 w-4" /></FormControl>
              <FormLabel className="text-sm font-medium cursor-pointer flex-1">
                <div className="flex w-full justify-between">
                  <p className="">All Over Bangladesh</p>
                  <span className="ml-2 font-bold ">Tk 100</span>
                </div>
              </FormLabel>
            </FormItem>
          </RadioGroup>
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );

  const PaymentMethodField = (
    <FormField control={form.control} name="paymentMethod" render={({ field }) => (
      <FormItem className="space-y-0">
        <FormControl>
          <RadioGroup onValueChange={field.onChange} value={field.value} className="gap-3">
            <FormItem className="flex items-center space-x-3 space-y-0 p-2.5 border border-zinc-100 hover:bg-zinc-50 transition-colors flex-1 min-w-[180px] cursor-pointer">
              <FormControl><RadioGroupItem value="cod" className="text-orange-500 border-zinc-300 h-4 w-4" /></FormControl>
              <FormLabel className="text-sm font-medium cursor-pointer flex-1">
                <div className="flex w-full h-6 items-center gap-2 justify-between">
                  <p>Cash on Delivery</p>
                  <p className="text-xs text-gray-500">(Pay with cash upon delivery)</p>
                </div>
              </FormLabel>
            </FormItem>
            <FormItem className="flex items-center space-x-3 space-y-0 p-2.5 border border-zinc-100 hover:bg-zinc-50 transition-colors flex-1 min-w-[180px] cursor-pointer">
              <FormControl><RadioGroupItem value="bkash" className="text-orange-500 border-zinc-300 h-4 w-4" /></FormControl>
              <FormLabel className="text-sm font-medium cursor-pointer flex-1 font-bold">
                <div className="flex w-full h-6 items-center gap-2 justify-between">
                  <p>BKash Payment</p>
                  <Image src="/bkash.png" alt="bKash" width={50} height={50} />
                </div>
              </FormLabel>
            </FormItem>
          </RadioGroup>
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );

  const SubmitButton = (
    <Button type="submit" disabled={isPending} size="lg" className="w-full px-12 py-6 bg-black hover:bg-zinc-900 rounded-none font-bold uppercase tracking-widest text-white">
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Place Order
    </Button>
  );

  if (children) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} id="checkout-form">
          {children({ form, isPending, DeliveryMethodField, PaymentMethodField, SubmitButton })}
        </form>
      </Form>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" id="checkout-form">
        {/* Shipping Contact */}
        <div className="border border-zinc-200 bg-white rounded-none shadow-sm">
          <div className="border-b border-zinc-100 py-3 px-6">
            <h2 className="text-base font-bold font-headline uppercase tracking-tight">Shipping Contact</h2>
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

        {/* Delivery Method - Hidden fields that will be rendered separately */}
        <FormField control={form.control} name="deliveryMethod" render={({ field }) => (
          <input type="hidden" {...field} />
        )} />

        {/* Payment Method - Hidden fields that will be rendered separately */}
        <FormField control={form.control} name="paymentMethod" render={({ field }) => (
          <input type="hidden" {...field} />
        )} />
      </form>
    </Form>
  );
}

