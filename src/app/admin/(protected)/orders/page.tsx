import { getAllOrders } from "@/lib/actions";
import { AdminOrdersTable } from "@/components/admin/orders-table";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Package, Clock, CheckCircle, Truck, XCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const initialOrders = await getAllOrders();

  const stats = [
    { label: 'Total Orders', value: initialOrders.length, icon: ShoppingCart, color: 'text-zinc-600' },
    { label: 'Pending', value: initialOrders.filter(o => o.orderStatus === 'pending').length, icon: Clock, color: 'text-yellow-600' },
    { label: 'Processing', value: initialOrders.filter(o => o.orderStatus === 'processing').length, icon: Package, color: 'text-blue-600' },
    { label: 'Shipped', value: initialOrders.filter(o => o.orderStatus === 'shipped').length, icon: Truck, color: 'text-indigo-600' },
    { label: 'Delivered', value: initialOrders.filter(o => o.orderStatus === 'delivered').length, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Cancelled', value: initialOrders.filter(o => o.orderStatus === 'cancelled').length, icon: XCircle, color: 'text-red-600' },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black font-headline uppercase tracking-tight">Order Management</h1>
        <p className="text-zinc-500 text-sm">Monitor, track, and manage customer orders across your shop.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="rounded-none border-zinc-200">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-black">{stat.value}</p>
              </div>
              <stat.icon className={`h-6 w-6 ${stat.color} opacity-40`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <AdminOrdersTable initialOrders={initialOrders} />
    </div>
  );
}
