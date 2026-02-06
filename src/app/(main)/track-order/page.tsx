"use client";

import { useState } from "react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Package, MapPin, Calendar, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { getOrderByNumber } from "@/lib/actions";
import { OrderProgress } from "@/components/account/order-progress";
import { Phone, Mail, MessageSquare } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

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
                setOrderStatus(order);
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

            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Left/Main Column - Tracking Search & Results */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="border border-zinc-200 bg-white p-6 md:p-8 shadow-sm">
                            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <Label htmlFor="orderId" className="sr-only">Order ID</Label>
                                    <Input
                                        id="orderId"
                                        placeholder="Enter your Order ID (e.g. 99359325)"
                                        value={orderId}
                                        onChange={(e) => setOrderId(e.target.value)}
                                        className="rounded-none border-zinc-200 focus-visible:ring-black h-12 text-sm font-bold placeholder:font-normal placeholder:text-zinc-300"
                                        required
                                    />
                                </div>
                                <Button type="submit" disabled={isSearching} className="bg-black hover:bg-zinc-900 text-white rounded-none px-10 font-black uppercase tracking-widest h-12 text-[10px]">
                                    {isSearching ? "Searching..." : "Track Now"}
                                </Button>
                            </form>

                            {orderStatus && (
                                <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex flex-wrap justify-between gap-4 pb-6 border-b border-zinc-100">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-1">Tracking ID</p>
                                            <p className="font-black text-xl tracking-tighter">#{orderStatus.orderNumber}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-1">Status</p>
                                            <p className="font-black text-lg text-orange-600 uppercase italic tracking-tighter">{orderStatus.orderStatus}</p>
                                        </div>
                                    </div>

                                    <div className="bg-zinc-50/50 p-6 md:p-8 border border-zinc-100">
                                        <OrderProgress order={orderStatus} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="text-center p-6 bg-zinc-50 border border-zinc-100 italic text-zinc-400 text-[10px] uppercase font-bold tracking-widest">
                            "Having trouble finding your Order ID? Check your confirmation email or SMS."
                        </div>
                    </div>

                    {/* Right/Sidebar Column - Support Assistance */}
                    <div className="space-y-6 lg:sticky lg:top-8">
                        <div className="border border-zinc-200 bg-white p-6 md:p-8 shadow-sm">
                            <div className="text-center lg:text-left mb-8">
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-2">Need <span className="text-orange-600">Assistance?</span></h2>
                                <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold leading-relaxed">
                                    Our support team is available <br className="hidden lg:block" /> 24/7 to help you.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <a
                                    href="tel:01725877772"
                                    className="flex items-center gap-4 p-4 border border-zinc-100 bg-zinc-50/50 hover:bg-white hover:border-black hover:shadow-lg transition-all group"
                                >
                                    <div className="h-10 w-10 bg-white flex items-center justify-center border border-zinc-100 shrink-0 shadow-sm">
                                        <Phone className="h-4 w-4 text-zinc-400 group-hover:text-black" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-0.5">Quick Call</p>
                                        <p className="text-[11px] font-black tracking-widest">01725-877772</p>
                                    </div>
                                </a>

                                <a
                                    href="https://wa.me/8801725877772"
                                    target="_blank"
                                    className="flex items-center gap-4 p-4 border border-zinc-100 bg-zinc-50/50 hover:bg-white hover:border-black hover:shadow-lg transition-all group"
                                >
                                    <div className="h-10 w-10 bg-white flex items-center justify-center border border-zinc-100 shrink-0 shadow-sm">
                                        <FaWhatsapp className="h-4 w-4 text-zinc-400 group-hover:text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-0.5">WhatsApp</p>
                                        <p className="text-[11px] font-black tracking-widest text-[#25D366]">CHAT NOW</p>
                                    </div>
                                </a>

                                <a
                                    href="mailto:info@abrarshop.online"
                                    className="flex items-center gap-4 p-4 border border-zinc-100 bg-zinc-50/50 hover:bg-white hover:border-black hover:shadow-lg transition-all group"
                                >
                                    <div className="h-10 w-10 bg-white flex items-center justify-center border border-zinc-100 shrink-0 shadow-sm">
                                        <Mail className="h-4 w-4 text-zinc-400 group-hover:text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-0.5">Support Email</p>
                                        <p className="text-[11px] font-black tracking-widest uppercase text-zinc-900	">info@abrarshop</p>
                                    </div>
                                </a>
                            </div>

                            <div className="mt-8 pt-8 border-t border-zinc-100">
                                <p className="text-[9px] font-black uppercase text-zinc-300 tracking-widest text-center">Abrar Shop Logistics</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
