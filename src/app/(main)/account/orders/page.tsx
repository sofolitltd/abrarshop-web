"use client";

import { useAuth } from "@/context/auth-context";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Package, ArrowRight } from "lucide-react";
import { getUserOrders } from "@/lib/actions";
import useSWR from "swr";
import { OrdersSkeleton } from "@/components/account/orders-skeleton";
import { AccountNav } from "@/components/account/account-nav";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function OrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    // Use SWR for caching and automatic revalidation
    const {
        data: orders = [],
        isLoading: isLoadingOrders
    } = useSWR(
        user ? [`orders`, user.uid] : null,
        ([, uid]) => getUserOrders(uid),
        {
            revalidateOnFocus: true,
            dedupingInterval: 5000,
        }
    );

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    if (authLoading) return <OrdersSkeleton />;
    if (!user) return null;

    return (
        <div className="container mx-auto pt-4 pb-20 px-4">
            <div className="mb-6">
                <Breadcrumb
                    items={[
                        { name: "Home", href: "/" },
                        { name: "Account", href: "/account" },
                        { name: "Orders", href: "/account/orders" }
                    ]}
                />
                <h1 className="text-2xl font-bold tracking-tight font-headline mt-4 uppercase">
                    My Orders
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <AccountNav />

                <div className="md:col-span-11 lg:col-span-10 space-y-4">
                    {isLoadingOrders && orders.length === 0 ? (
                        <OrdersSkeleton />
                    ) : orders.length === 0 ? (
                        <div className="border border-dashed border-zinc-200 p-20 text-center bg-zinc-50">
                            <Package className="h-12 w-12 mx-auto mb-4 text-zinc-300" />
                            <h2 className="text-lg font-bold font-headline uppercase">No orders yet</h2>
                            <p className="text-zinc-500 text-sm mb-8 mt-2">When you place an order, it will appear here.</p>
                            <Link href="/shop" className="px-8 py-4 bg-black text-white font-bold uppercase text-xs tracking-widest inline-flex items-center gap-2">
                                Start Shopping <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {orders.map((order: any) => (
                                <Link
                                    key={order.id}
                                    href={`/account/orders/${order.orderNumber}`}
                                    className="p-4 md:p-6 border border-zinc-100 bg-white hover:border-black transition-all group block shadow-sm"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <p className="font-mono font-black text-lg group-hover:text-orange-600 transition-colors tracking-tighter">#{order.orderNumber}</p>
                                                <div className={cn(
                                                    "px-3 py-1 text-[10px] font-black uppercase tracking-widest",
                                                    order.orderStatus === 'delivered' ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-600"
                                                )}>
                                                    {order.orderStatus}
                                                </div>
                                            </div>
                                            <p className="text-xs text-zinc-400 font-medium">
                                                Placed on {format(new Date(order.createdAt), "MMMM d, yyyy")}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between md:text-right gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Total Amount</p>
                                                <p className="font-black text-lg tracking-tight">Tk {order.totalAmount}</p>
                                            </div>
                                            <div className="h-10 w-10 flex items-center justify-center border border-zinc-100 group-hover:bg-black group-hover:text-white transition-colors ml-4">
                                                <ArrowRight className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-zinc-50 flex flex-wrap gap-2">
                                        {order.items.slice(0, 3).map((item: any, idx: number) => (
                                            <div key={idx} className="h-10 w-10 border border-zinc-100 bg-zinc-50 p-1 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                                                {item.productId ? '📦' : ''}
                                            </div>
                                        ))}
                                        {order.items.length > 3 && (
                                            <div className="h-10 px-3 border border-zinc-100 bg-zinc-50 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                                                +{order.items.length - 3} More items
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
