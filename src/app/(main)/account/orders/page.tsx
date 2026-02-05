"use client";

import { useAuth } from "@/context/auth-context";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Package, User, ShoppingBag, ArrowRight } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { LogoutButton } from "@/components/account/logout-button";
import { getUserOrders } from "@/lib/actions";

export default function OrdersPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [orders, setOrders] = useState<any[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        } else if (user) {
            async function fetchOrders() {
                try {
                    const fetchedOrders = await getUserOrders(user!.uid);
                    setOrders(fetchedOrders);
                } catch (error) {
                    console.error("Failed to fetch orders", error);
                } finally {
                    setIsLoadingOrders(false);
                }
            }
            fetchOrders();
        }
    }, [user, loading, router]);

    if (loading) return null;
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-1">
                    <Link href="/account" className="flex items-center gap-3 px-4 py-3 border border-zinc-100 hover:bg-zinc-50 font-bold uppercase text-xs tracking-widest transition-colors">
                        <ShoppingBag className="h-4 w-4" />
                        Dashboard
                    </Link>
                    <Link href="/account/orders" className="flex items-center gap-3 px-4 py-3 bg-black text-white font-bold uppercase text-xs tracking-widest">
                        <Package className="h-4 w-4" />
                        My Orders
                    </Link>
                    <Link href="/account/profile" className="flex items-center gap-3 px-4 py-3 border border-zinc-100 hover:bg-zinc-50 font-bold uppercase text-xs tracking-widest transition-colors">
                        <User className="h-4 w-4" />
                        Profile Settings
                    </Link>
                    <LogoutButton />
                </div>

                <div className="md:col-span-2 space-y-4">
                    {isLoadingOrders ? (
                        <div className="py-20 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="border border-zinc-200 p-12 text-center bg-zinc-50">
                            <Package className="h-12 w-12 mx-auto text-zinc-300 mb-4" />
                            <h3 className="text-sm font-bold uppercase tracking-tight mb-2">No Orders Found</h3>
                            <p className="text-xs text-zinc-500 mb-6">You haven't placed any orders yet.</p>
                            <Link href="/" className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 font-bold uppercase text-xs tracking-widest hover:bg-zinc-900 transition-colors">
                                Continue Shopping
                                <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div key={order.id} className="border border-zinc-200 bg-white p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-4 border-b border-zinc-100 gap-4">
                                        <div>
                                            <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Order Number</p>
                                            <p className="font-mono text-lg font-bold">#{order.orderNumber}</p>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Date Placed</p>
                                            <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Total Amount</p>
                                            <p className="text-lg font-bold text-orange-600">৳{order.totalAmount}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                        <div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide
                                                ${order.orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    order.orderStatus === 'processing' ? 'bg-blue-100 text-blue-800' :
                                                        order.orderStatus === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                                                            order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                                                                'bg-gray-100 text-gray-800'}`}>
                                                {order.orderStatus}
                                            </span>
                                            <span className="ml-2 text-xs text-zinc-500 font-medium uppercase">{order.items.length} Items</span>
                                        </div>
                                        {/* 
                                         // TODO: Add view details functionality
                                         <Button variant="outline" size="sm" className="rounded-none uppercase text-xs font-bold">View Details</Button> 
                                         */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
