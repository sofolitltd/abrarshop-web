"use client";

import { Check, Truck, Package, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Order } from "@/lib/types";


export function OrderProgress({ order }: { order: any }) {
    if (!order) return null;

    const currentStatus = order.orderStatus || 'pending';

    const steps = [
        { id: 'pending', label: 'Pending', icon: Clock, date: order.createdAt },
        { id: 'processing', label: 'Processing', icon: Package, date: order.processingAt },
        { id: 'shipped', label: 'Shipped', icon: Truck, date: order.shippedAt },
        { id: 'delivered', label: 'Delivered', icon: Check, date: order.deliveredAt },
    ];

    const currentStepIndex = steps.findIndex(step => step.id === currentStatus);

    return (
        <div className="w-full py-4">
            {/* Top Divider Line */}
            <div className="mb-8 border-b border-zinc-100/60" />

            <div className="relative space-y-8 pl-4">
                {/* Vertical Progress Line Background */}
                <div className="absolute left-[2.25rem] top-2 bottom-2 w-0.5 bg-zinc-100" />

                {/* Active Vertical Progress Line */}
                <div
                    className="absolute left-[2.25rem] top-2 bg-black transition-all duration-700 w-0.5"
                    style={{
                        height: currentStepIndex >= 0
                            ? `${(currentStepIndex / (steps.length - 1)) * 100}%`
                            : '0%'
                    }}
                />

                {steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isActive = index === currentStepIndex;
                    const Icon = step.icon;
                    const stepDate = step.date;

                    return (
                        <div key={step.id} className="flex items-start gap-6 group relative">
                            {/* Icon Circle */}
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white shadow-sm z-10 shrink-0",
                                    isCompleted || isActive
                                        ? "border-black bg-black text-white"
                                        : "border-zinc-100 text-zinc-300"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                            </div>

                            {/* Content */}
                            <div className="flex flex-col pt-1">
                                <span
                                    className={cn(
                                        "text-[11px] font-black uppercase tracking-[0.15em] transition-colors leading-none",
                                        isActive ? "text-orange-600" : (isCompleted ? "text-black" : "text-zinc-400")
                                    )}
                                >
                                    {step.label}
                                </span>
                                {stepDate ? (
                                    <div className="mt-1.5 flex items-center gap-2">
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">
                                            {format(new Date(stepDate), "MMMM d, yyyy")}
                                        </p>
                                        <div className="h-1 w-1 rounded-full bg-zinc-300" />
                                        <p className="text-[10px] font-medium text-zinc-400">
                                            {format(new Date(stepDate), "h:mm a")}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-[10px] font-medium text-zinc-300 italic mt-1.5 uppercase tracking-widest">
                                        Waiting...
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Divider Line */}
            <div className="mt-10 border-t border-zinc-100/60" />
        </div>
    );
}
