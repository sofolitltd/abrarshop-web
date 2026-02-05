"use client";

import { useState } from "react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Package, MapPin, Calendar, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { getOrderByNumber } from "@/lib/actions";

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [orderStatus, setOrderStatus] = useState<any>(null);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId) return;

        setIsSearching(true);
        setOrderStatus(null);

        try {
            const order = await getOrderByNumber(orderId);

            if (order) {
                // Determine completion status based on order status
                // status enum: pending, processing, shipped, delivered, cancelled
                const s = order.orderStatus;

                const steps = [
                    { step: "Order Placed", time: new Date(order.createdAt).toLocaleString(), completed: true },
                    { step: "Payment/Order Confirmed", time: "Confirmed", completed: true }, // Simplified
                    { step: "Processing", time: s === 'processing' ? "In Progress" : (['shipped', 'delivered'].includes(s) ? "Completed" : "-"), completed: ['processing', 'shipped', 'delivered'].includes(s) },
                    { step: "Shipped", time: s === 'shipped' ? "In Transit" : (s === 'delivered' ? "Completed" : "-"), completed: ['shipped', 'delivered'].includes(s) },
                    { step: "Delivered", time: s === 'delivered' ? "Delivered" : "-", completed: s === 'delivered' },
                ];

                setOrderStatus({
                    id: order.orderNumber,
                    status: order.orderStatus,
                    date: new Date(order.createdAt).toLocaleDateString(),
                    items: order.items.length,
                    currentLocation: "Central Warehouse", // Static for now
                    history: steps
                });
            } else {
                toast.error("Order not found. Please check your Order ID.");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while tracking the order.");
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="container mx-auto pt-4 pb-20 px-4">
            <div className="mb-6">
                <Breadcrumb
                    items={[
                        { name: "Home", href: "/" },
                        { name: "Track Order", href: "/track-order" }
                    ]}
                />
                <h1 className="text-2xl font-bold tracking-tight font-headline mt-4 uppercase text-center">
                    Track Your Order
                </h1>
                <p className="text-zinc-500 text-center max-w-md mx-auto mt-2 text-sm">
                    Enter your Order ID to see the current status of your shipment and delivery updates.
                </p>
            </div>

            <div className="max-w-xl mx-auto">
                <div className="border border-zinc-200 bg-white p-6 md:p-8 shadow-sm">
                    <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Label htmlFor="orderId" className="sr-only">Order ID</Label>
                            <Input
                                id="orderId"
                                placeholder="e.g. 99359325"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                className="rounded-none border-zinc-200 focus-visible:ring-orange-500 h-12"
                                required
                            />
                        </div>
                        <Button type="submit" disabled={isSearching} className="bg-black hover:bg-zinc-900 text-white rounded-none px-8 font-bold uppercase tracking-widest h-12">
                            {isSearching ? "Searching..." : "Track Now"}
                        </Button>
                    </form>

                    {orderStatus && (
                        <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-wrap justify-between gap-4 pb-6 border-b border-zinc-100">
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Order ID</p>
                                    <p className="font-bold text-lg">#{orderStatus.id}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</p>
                                    <p className="font-bold text-lg text-orange-600">{orderStatus.status}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Date</p>
                                    <p className="font-bold text-lg">{orderStatus.date}</p>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-zinc-100"></div>
                                <div className="space-y-8 relative">
                                    {orderStatus.history.map((item: any, idx: number) => (
                                        <div key={idx} className="flex gap-6 items-start">
                                            <div className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${item.completed ? 'bg-black border-black text-white' : 'bg-white border-zinc-200 text-zinc-300'}`}>
                                                {item.completed ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                            </div>
                                            <div>
                                                <p className={`font-bold text-sm uppercase tracking-tight ${item.completed ? 'text-black' : 'text-zinc-400'}`}>
                                                    {item.step}
                                                </p>
                                                <p className="text-xs text-zinc-500 mt-0.5">{item.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center bg-zinc-50 p-6 border border-zinc-100 italic text-zinc-500 text-sm">
                    "Having trouble finding your Order ID? Check your confirmation email or SMS."
                </div>
            </div>
        </div>
    );
}
