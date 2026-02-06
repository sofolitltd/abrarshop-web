"use client";

import { useAuth } from "@/context/auth-context";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Package, User, ShoppingBag, ArrowLeft, Calendar, MapPin, CreditCard, Phone, Mail } from "lucide-react";
import { LogoutButton } from "@/components/account/logout-button";
import { getOrderByNumber } from "@/lib/actions";
import useSWR from "swr";
import { format } from "date-fns";
import { OrderProgress } from "@/components/account/order-progress";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { use } from "react";

export default function OrderDetailsPage({ params: paramsPromise }: { params: Promise<{ orderNumber: string }> }) {
    const params = use(paramsPromise);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const {
        data: order,
        isLoading: isLoadingOrder
    } = useSWR(
        user ? [`order`, params.orderNumber] : null,
        () => getOrderByNumber(params.orderNumber)
    );

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    if (authLoading || !user) {
        return (
            <div className="container mx-auto pt-4 pb-20 px-4">
                <Skeleton className="h-4 w-32 mb-8" />
                <Skeleton className="h-10 w-64 mb-12" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <Skeleton className="h-40 w-full" />
                        <Skeleton className="h-80 w-full" />
                    </div>
                    <Skeleton className="h-60 w-full" />
                </div>
            </div>
        );
    }

    if (!isLoadingOrder && !order) {
        return (
            <div className="container mx-auto py-20 px-4 text-center">
                <Package className="h-16 w-16 mx-auto text-zinc-200 mb-4" />
                <h2 className="text-2xl font-bold uppercase font-headline">Order Not Found</h2>
                <p className="text-zinc-500 mb-8">We couldn't find the order you're looking for.</p>
                <Link href="/account/orders" className="bg-black text-white px-8 py-4 font-bold uppercase tracking-widest text-xs">
                    Back to Orders
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto pt-4 pb-20 px-4">
            <div className="mb-8">
                <Breadcrumb
                    items={[
                        { name: "Home", href: "/" },
                        { name: "Account", href: "/account" },
                        { name: "Orders", href: "/account/orders" },
                        { name: `#${params.orderNumber}`, href: "#" }
                    ]}
                />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
                    <div className="flex items-center gap-4">
                        <Link href="/account/orders" className="h-10 w-10 border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <h1 className="text-2xl md:text-3xl font-black font-headline uppercase tracking-tight">
                            Order <span className="text-orange-600">#{params.orderNumber}</span>
                        </h1>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Order Items */}
                    <div className="border border-zinc-200 bg-white overflow-hidden">
                        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em]">Order Items / <span className="text-orange-600">Summary</span></h2>
                        </div>
                        <div className="divide-y divide-zinc-100">
                            {order?.items?.map((item: any) => (
                                <div key={item.id} className="p-6 flex gap-6 items-center">
                                    <div className="h-16 w-16 bg-zinc-50 border border-zinc-100 relative shrink-0 overflow-hidden">
                                        {item.product?.images?.[0] ? (
                                            <Image
                                                src={item.product.images[0]}
                                                alt={item.product.name}
                                                fill
                                                className="object-contain p-2"
                                            />
                                        ) : (
                                            <ShoppingBag className="h-6 w-6 text-zinc-200 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-0.5">
                                        <h3 className="font-bold uppercase text-[12px] tracking-tight hover:text-orange-600 transition-colors line-clamp-1">
                                            <Link href={`/product/${item.product?.slug}`}>
                                                {item.product?.name || "Product"}
                                            </Link>
                                        </h3>
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">
                                            {item.quantity} × Tk {item.price}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-sm leading-none">Tk {(Number(item.price) * item.quantity).toFixed(0)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-zinc-50/30 space-y-3">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                                <span>Subtotal</span>
                                <span>Tk {order ? (Number(order.totalAmount) - Number(order.deliveryFee)).toFixed(0) : '0'}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                                <span>Delivery Fee</span>
                                <span>Tk {Number(order?.deliveryFee || 0).toFixed(0)}</span>
                            </div>
                            <div className="pt-4 border-t border-zinc-200 flex justify-between items-center">
                                <span className="text-xs font-black uppercase tracking-[0.2em] italic">Total Amount</span>
                                <span className="text-2xl font-black text-orange-600">Tk {Number(order?.totalAmount || 0).toFixed(0)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Information Grid Container */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Customer Info */}
                        <div className="border border-zinc-200 bg-white">
                            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Shipping Details</h2>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="flex gap-4">
                                    <div className="h-8 w-8 bg-zinc-50 flex items-center justify-center border border-zinc-100 shrink-0">
                                        <MapPin className="h-3 w-3 text-zinc-400" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-0.5">Address</p>
                                        <p className="text-[12px] font-bold leading-tight">{order?.firstName} {order?.lastName}</p>
                                        <p className="text-[11px] font-medium leading-relaxed text-zinc-600 mt-1">{order?.address}</p>
                                        <p className="text-[10px] font-black uppercase mt-1 tracking-widest text-zinc-900">{order?.district}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-8 w-8 bg-zinc-50 flex items-center justify-center border border-zinc-100 shrink-0">
                                        <Phone className="h-3 w-3 text-zinc-400" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-0.5">Contact</p>
                                        <p className="text-[11px] font-bold">{order?.mobile}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="border border-zinc-200 bg-white">
                            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Payment Overview</h2>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="flex gap-4">
                                    <div className="h-8 w-8 bg-zinc-50 flex items-center justify-center border border-zinc-100 shrink-0">
                                        <CreditCard className="h-3 w-3 text-zinc-400" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-0.5">Method</p>
                                        <p className="text-[11px] font-bold uppercase">{order?.paymentMethod === 'cod' ? 'Cash on Delivery' : 'bKash/Online'}</p>
                                        <span className={cn(
                                            "inline-block mt-2 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-none",
                                            order?.paymentStatus === 'paid' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                        )}>
                                            {order?.paymentStatus === 'pending' ? 'Unpaid' : order?.paymentStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Order Tracking */}
                <div className="space-y-8">
                    <div className="border border-zinc-200 bg-white">
                        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em]">Order <span className="text-orange-600">Journey</span></h2>
                            <Calendar className="h-3 w-3 text-zinc-300" />
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-6 border-b border-zinc-50 pb-4">
                                <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">
                                    Ordered: {order ? format(new Date(order.createdAt), "MMM d, yyyy") : '...'}
                                </p>
                            </div>
                            <OrderProgress order={order} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
