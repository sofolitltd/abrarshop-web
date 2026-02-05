
"use client";

import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function CartPageContent() {
    const {
        items,
        totalPrice,
        updateItemQuantity,
        removeItem,
    } = useCart();

    if (items.length === 0) {
        return (
            <Card className="border-zinc-200 rounded-none shadow-sm py-20">
                <CardContent className="flex flex-col items-center justify-center gap-6 text-center">
                    <div className="h-24 w-24 bg-zinc-50 rounded-full flex items-center justify-center mb-2">
                        <ShoppingBag className="h-12 w-12 text-zinc-300" strokeWidth={1} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight uppercase">Your cart is empty</h2>
                        <p className="text-muted-foreground max-w-[300px]">
                            Looks like you haven't added anything to your cart yet.
                        </p>
                    </div>
                    <Button asChild variant="outline" className="rounded-none border-zinc-200 px-10 py-6 uppercase font-bold tracking-widest text-xs hover:bg-black hover:text-white transition-all">
                        <Link href="/product">Continue Shopping</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-4">
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-zinc-50 border border-zinc-200 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    <div className="col-span-6">Product Information</div>
                    <div className="col-span-2 text-center">Price</div>
                    <div className="col-span-2 text-center">Quantity</div>
                    <div className="col-span-2 text-right">Subtotal</div>
                </div>

                <div className="space-y-4">
                    {items.map((item) => (
                        <div key={item.id} className="group relative bg-white border border-zinc-200   transition-all hover:border-zinc-400">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                                {/* Product Info */}
                                <div className="col-span-1 md:col-span-6 flex items-center gap-4">
                                    <div className="relative h-20    w-20 md:h-24 md:w-24 flex-shrink-0 overflow-hidden bg-zinc-50">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100px, 150px"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-base md:text-lg leading-tight group-hover:text-orange-600 transition-colors uppercase tracking-tight">
                                            {item.name}
                                        </h3>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="flex items-center gap-2 text-zinc-400 hover:text-red-500 text-[10px] uppercase font-bold tracking-widest transition-colors mt-2"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                            Remove Item
                                        </button>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="hidden md:flex flex-col items-center justify-center col-span-2">
                                    <span className="font-medium ">Tk {" "}{item.price.toLocaleString()}</span>
                                </div>

                                {/* Quantity */}
                                <div className="col-span-1 md:col-span-2 flex items-center justify-center">
                                    <div className="flex items-center border border-zinc-200">
                                        <button
                                            onClick={() => updateItemQuantity(item.id, Math.max(1, item.quantity - 1))}
                                            className="h-10 w-10 flex items-center justify-center hover:bg-zinc-50 transition-colors"
                                        >
                                            <Minus className="h-3 w-3" />
                                        </button>
                                        <div className="w-12 text-center font-bold text-lg">
                                            {item.quantity}
                                        </div>
                                        <button
                                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                            className="h-10 w-10 flex items-center justify-center hover:bg-zinc-50 transition-colors"
                                        >
                                            <Plus className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>

                                {/* Subtotal */}
                                <div className="col-span-1 md:col-span-2 flex md:flex-col items-center justify-between md:justify-center md:text-right">
                                    <span className="text-zinc-400 text-[10px] md:hidden font-bold uppercase tracking-widest">Subtotal</span>
                                    <span className="font-black text-xl text-orange-600">Tk {" "}{(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>


                <Button asChild variant="link" className="text-zinc-500 hover:text-black font-bold uppercase tracking-widest text-xs p-0 h-auto">
                    <Link href="/product" className="flex items-center gap-2">
                        {"<"} Continue Shopping
                    </Link>
                </Button>

            </div>

            {/*  */}
            <div className="lg:col-span-4 mb-8">
                <div className="sticky top-24 bg-zinc-800 text-white p-4 md:p-6">
                    <h2 className="text-2xl font-black uppercase tracking-tighter border-b border-zinc-800 ">Order Summary</h2>
                    <Separator className="my-4" />

                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <span className="text-zinc-400 text-sm uppercase font-bold tracking-widest">Total Products</span>
                            <span className="font-bold text-lg">{items.length}</span>
                        </div>

                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <span className="text-zinc-400 text-sm uppercase font-bold tracking-widest">Total Bill</span>
                                <p className="text-[10px] text-zinc-500">Shipping calculated at checkout</p>
                            </div>
                            <span className="text-3xl font-black text-orange-500">Tk {" "}{totalPrice.toLocaleString()}</span>
                        </div>

                        <div className="pt-6">
                            <Button asChild size="lg" className="w-full h-16 bg-white text-black hover:bg-orange-500 hover:text-white rounded-none font-black uppercase tracking-[0.2em] text-sm transition-all group">
                                <Link href="/checkout" className="flex items-center justify-center gap-3">
                                    Check Out Now
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-10 border-t border-zinc-800 opacity-50">
                            <div className="flex flex-col items-center text-center gap-2">
                                <div className="h-10 w-10 flex items-center justify-center border border-zinc-700 rounded-full">
                                    <Image src="/favicon.ico" alt="Sec" width={16} height={16} className="grayscale" />
                                </div>
                                <span className="text-[8px] font-bold uppercase tracking-widest">Secure</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2">
                                <div className="h-10 w-10 flex items-center justify-center border border-zinc-700 rounded-full">
                                    <Plus className="h-4 w-4" />
                                </div>
                                <span className="text-[8px] font-bold uppercase tracking-widest">Quality</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2">
                                <div className="h-10 w-10 flex items-center justify-center border border-zinc-700 rounded-full ">
                                    <ArrowRight className="h-4 w-4 rotate-[135deg]" />
                                </div>
                                <span className="text-[8px] font-bold uppercase tracking-widest">Support</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
