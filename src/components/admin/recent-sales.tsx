"use client";

import { format } from "date-fns";

export function RecentSales({ orders }: { orders: any[] }) {
    return (
        <div className="space-y-8">
            {orders.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-4">No recent sales</p>
            ) : (
                orders.map((order) => (
                    <div key={order.id} className="flex items-center">
                        <div className="h-9 w-9 bg-zinc-100 flex items-center justify-center border border-zinc-200 uppercase font-black text-[10px] text-zinc-400">
                            {order.firstName?.[0] || 'U'}{order.lastName?.[0] || ''}
                        </div>
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-bold uppercase tracking-tight leading-none">
                                {order.firstName} {order.lastName}
                            </p>
                            <p className="text-[10px] text-zinc-400 font-mono">
                                {format(new Date(order.createdAt), "MMM d, h:mm a")}
                            </p>
                        </div>
                        <div className="ml-auto font-black text-sm text-orange-600">
                            +Tk {order.totalAmount}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
