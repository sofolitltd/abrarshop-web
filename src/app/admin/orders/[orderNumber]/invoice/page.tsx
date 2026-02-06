"use client";

import { use, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { getOrderByNumber } from "@/lib/actions";
import useSWR from "swr";
import { Printer, MapPin, Phone, Mail, ShoppingBag } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function InvoicePage({ params: paramsPromise }: { params: Promise<{ orderNumber: string }> }) {
    const params = use(paramsPromise);
    const { user, loading: authLoading } = useAuth();

    const {
        data: order,
        isLoading: isLoadingOrder
    } = useSWR(
        [`order-invoice`, params.orderNumber],
        () => getOrderByNumber(params.orderNumber)
    );

    useEffect(() => {
        if (order) {
            document.title = `Invoice_${order.orderNumber}`;

            // Cleanup: reset title when leaving page
            return () => {
                document.title = "Abrar Shop";
            };
        }
    }, [order]);

    const handlePrint = () => {
        window.print();
    };

    if (isLoadingOrder || authLoading) {
        return (
            <div className="container mx-auto p-8 max-w-4xl">
                <Skeleton className="h-20 w-full mb-8" />
                <div className="grid grid-cols-2 gap-8 mb-12">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (!order) {
        return <div className="p-20 text-center font-bold uppercase tracking-widest text-zinc-400">Order not found</div>;
    }

    return (
        <div className="bg-zinc-50 py-6 print:bg-white print:py-0 min-h-screen print:min-h-0 print:overflow-hidden">
            <style stroke-width="0">
                {`
                    @media print {
                        @page {
                            margin: 0;
                            size: auto;
                        }
                        html, body {
                            height: 100%;
                            height: 100vh;
                            margin: 0 !important;
                            padding: 0 !important;
                            overflow: hidden;
                        }
                        body {
                            display: flex;
                            align-items: flex-start;
                            justify-content: center;
                        }
                        header, footer, nav {
                            display: none !important;
                        }
                        .print-container {
                            width: 100%;
                            height: auto;
                            margin: 0 !important;
                            padding: 2cm !important;
                        }
                    }
                `}
            </style>

            {/* Control Panel (Hidden on Print) */}
            <div className="max-w-4xl mx-auto mb-4 flex justify-between items-center px-4 print:hidden">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => window.history.back()}
                        className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors flex items-center gap-1"
                    >
                        ← Back
                    </button>
                    <h1 className="text-xs font-black uppercase tracking-widest text-zinc-500 italic border-l border-zinc-200 pl-4">Invoice <span className="text-orange-600">Preview</span></h1>
                </div>
                <button
                    onClick={handlePrint}
                    className="bg-black text-white px-4 py-2 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-zinc-800 transition-colors shadow-lg"
                >
                    <Printer className="h-3 w-3" /> Print
                </button>
            </div>

            {/* Actual Invoice Sheet */}
            <div className="max-w-3xl mx-auto bg-white border border-zinc-200 shadow-xl p-6 sm:p-8 print:shadow-none print:border-0 print:p-0 print-container">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-4 mb-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-black flex items-center justify-center">
                                <span className="text-white font-black text-lg italic">A</span>
                            </div>
                            <span className="text-xl font-black uppercase tracking-tighter">
                                Abrar <span className="text-orange-600">Shop</span>
                            </span>
                        </div>
                        <div className="text-[9px] uppercase font-bold text-zinc-500 leading-tight tracking-widest">
                            <p>Dhaka, Bangladesh • www.abrarshop.com</p>
                        </div>
                    </div>

                    <div className="text-right">
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-zinc-200 leading-none mb-1">INVOICE</h2>
                        <p className="text-[11px] font-bold uppercase tracking-widest leading-none"><span className="text-zinc-400">#</span>{order.orderNumber}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mt-1">
                            {format(new Date(order.createdAt), "MMM d, yyyy")}
                        </p>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-8 mb-6">
                    <div className="space-y-2">
                        <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100 pb-1">Bill To:</h3>
                        <div className="space-y-0.5 text-xs">
                            <p className="font-black uppercase text-sm">{order.firstName} {order.lastName}</p>
                            <p className="text-zinc-600 leading-snug">{order.address}</p>
                            <p className="font-bold uppercase text-zinc-800">{order.district}</p>
                            <p className="text-zinc-500 font-bold text-[10px] pt-1 uppercase tracking-widest">
                                {order.mobile}
                            </p>
                        </div>
                    </div>
                    <div className="text-right space-y-2">
                        <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100 pb-1 text-right">Shipment:</h3>
                        <div className="space-y-0.5 text-xs">
                            <p className="font-bold uppercase"><span className="text-zinc-400">Paid Via:</span> {order.paymentMethod === 'cod' ? 'COD' : 'Online'}</p>
                            <p className="font-black uppercase text-orange-600 text-[10px] tracking-widest">
                                <span className="text-zinc-400">Status:</span> {order.paymentStatus}
                            </p>
                            <p className="text-zinc-400 text-[9px] uppercase tracking-widest pt-1">Standard Delivery</p>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-6">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-zinc-900/10">
                                <th className="py-2 text-[9px] font-black uppercase tracking-widest">Description</th>
                                <th className="py-2 text-[9px] font-black uppercase tracking-widest text-center w-16">Qty</th>
                                <th className="py-2 text-[9px] font-black uppercase tracking-widest text-right w-24">Price</th>
                                <th className="py-2 text-[9px] font-black uppercase tracking-widest text-right w-24">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {order.items.map((item: any) => (
                                <tr key={item.id}>
                                    <td className="py-3">
                                        <p className="font-bold uppercase text-[10px] tracking-tight">{item.product?.name || 'Product Item'}</p>
                                    </td>
                                    <td className="py-3 text-center font-bold text-[10px]">{item.quantity}</td>
                                    <td className="py-3 text-right font-bold text-[10px]">{Number(item.price).toFixed(0)}</td>
                                    <td className="py-3 text-right font-black text-[10px]">{(Number(item.price) * item.quantity).toFixed(0)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary */}
                <div className="flex justify-end border-t border-zinc-900/10 pt-4">
                    <div className="w-48 space-y-1">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-400">
                            <span>Subtotal</span>
                            <span>Tk {(Number(order.totalAmount) - Number(order.deliveryFee)).toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-400">
                            <span>Delivery</span>
                            <span>Tk {Number(order.deliveryFee).toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between pt-2 mt-1 border-t border-zinc-900">
                            <span className="text-[10px] font-black uppercase tracking-widest italic">Total</span>
                            <span className="text-lg font-black text-orange-600 leading-none">Tk {Number(order.totalAmount).toFixed(0)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-10 pt-4 border-t border-zinc-100 text-center">
                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 italic">Thank you for choosing Abrar Shop</p>
                    <p className="text-[7px] font-bold uppercase tracking-widest text-zinc-300 mt-1">System Generated • Dhaka, Bangladesh</p>
                </div>
            </div>
        </div>
    );
}
