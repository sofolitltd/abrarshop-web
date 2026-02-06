"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    Package,
    Truck,
    CheckCircle,
    XCircle,
    Clock,
    ExternalLink,
    ChevronDown,
    Printer
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { updateOrderStatus, updatePaymentStatus } from "@/lib/actions";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function AdminOrdersTable({ initialOrders }: { initialOrders: any[] }) {
    const [orders, setOrders] = useState(initialOrders);
    const [searchTerm, setSearchTerm] = useState("");
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const router = useRouter();

    const filteredOrders = orders.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${order.firstName} ${order.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.mobile.includes(searchTerm)
    );

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        setIsUpdating(orderId);
        try {
            const result = await updateOrderStatus(orderId, newStatus);
            if (result.success) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setIsUpdating(null);
        }
    };

    const handlePaymentUpdate = async (orderId: string, newStatus: string) => {
        setIsUpdating(orderId);
        try {
            const result = await updatePaymentStatus(orderId, newStatus);
            if (result.success) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: newStatus } : o));
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Failed to update payment status");
        } finally {
            setIsUpdating(null);
        }
    };

    const handleRowClick = (e: React.MouseEvent, orderNumber: string) => {
        // Don't navigate if clicking a button or link or dropdown trigger
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('a') || target.closest('[data-radix-collection-item]')) {
            return;
        }
        router.push(`/account/orders/${orderNumber}`);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 uppercase text-[10px] rounded-none">Pending</Badge>;
            case 'processing': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 uppercase text-[10px] rounded-none">Processing</Badge>;
            case 'shipped': return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 uppercase text-[10px] rounded-none">Shipped</Badge>;
            case 'delivered': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 uppercase text-[10px] rounded-none">Delivered</Badge>;
            default: return <Badge variant="outline" className="uppercase text-[10px] rounded-none">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 border border-zinc-200">
                <div className="relative w-full sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                        placeholder="Search by order #, name or phone..."
                        className="pl-10 h-11 rounded-none border-zinc-200 focus-visible:ring-black"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button variant="outline" className="rounded-none h-11 border-zinc-200 font-bold uppercase text-[10px] tracking-widest gap-2">
                        <Filter className="h-3 w-3" /> Filter
                    </Button>
                    <Button className="rounded-none h-11 bg-black text-white hover:bg-zinc-900 font-bold uppercase text-[10px] tracking-widest flex-1 sm:flex-none">
                        Export
                    </Button>
                </div>
            </div>

            <div className="border border-zinc-200 bg-white overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                            <TableHead className="text-[10px] font-black uppercase tracking-widest">Order Info</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest">Customer</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest">Payment</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest">Amount</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-40 text-center text-zinc-500">
                                    <Package className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">No orders found</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOrders.map((order) => (
                                <TableRow
                                    key={order.id}
                                    className="hover:bg-zinc-50/80 transition-colors cursor-pointer group"
                                    onClick={(e) => handleRowClick(e, order.orderNumber)}
                                >
                                    <TableCell>
                                        <div className="space-y-1">
                                            <p className="font-mono font-bold text-sm group-hover:text-orange-600 transition-colors">#{order.orderNumber}</p>
                                            <p className="text-[10px] text-zinc-400 font-medium">
                                                {format(new Date(order.createdAt), "MMM d, yyyy • h:mm a")}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-bold">{order.firstName} {order.lastName}</p>
                                            <p className="text-[10px] text-zinc-500 font-mono">{order.mobile}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {isUpdating === order.id ? (
                                                <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                                            ) : (
                                                <div className="space-y-1">
                                                    {getStatusBadge(order.orderStatus)}
                                                    {order.orderStatus === 'processing' && order.processingAt && (
                                                        <p className="text-[9px] text-zinc-400 font-medium">
                                                            {format(new Date(order.processingAt), "MMM d, h:mm a")}
                                                        </p>
                                                    )}
                                                    {order.orderStatus === 'shipped' && order.shippedAt && (
                                                        <p className="text-[9px] text-zinc-400 font-medium">
                                                            {format(new Date(order.shippedAt), "MMM d, h:mm a")}
                                                        </p>
                                                    )}
                                                    {order.orderStatus === 'delivered' && order.deliveredAt && (
                                                        <p className="text-[9px] text-zinc-400 font-medium">
                                                            {format(new Date(order.deliveredAt), "MMM d, h:mm a")}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {isUpdating === order.id ? (
                                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                        ) : (
                                            <div className="space-y-1">
                                                <Badge variant="outline" className={cn(
                                                    "uppercase text-[9px] font-black px-2 py-0.5 rounded-none border-0 shadow-sm",
                                                    order.paymentStatus === 'paid' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700 font-bold"
                                                )}>
                                                    {order.paymentStatus}
                                                </Badge>
                                                {order.paymentStatus === 'paid' && order.paidAt && (
                                                    <p className="text-[9px] text-zinc-400 font-medium">
                                                        {format(new Date(order.paidAt), "MMM d, h:mm a")}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <p className="font-black text-sm">Tk {order.totalAmount}</p>
                                        <p className="text-[9px] text-zinc-400 uppercase tracking-widest">{order.items.length} items</p>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-black" asChild title="Print Invoice">
                                                <Link href={`/admin/orders/${order.orderNumber}/invoice`}>
                                                    <Printer className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-none border-zinc-200">
                                                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Manage Order</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/account/orders/${order.orderNumber}`} className="cursor-pointer">
                                                            <Eye className="mr-2 h-4 w-4" /> View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/orders/${order.orderNumber}/invoice`} className="cursor-pointer">
                                                            <ExternalLink className="mr-2 h-4 w-4" /> Generate Invoice
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Order Status</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'pending')} className="text-yellow-600">
                                                        <Clock className="mr-2 h-4 w-4" /> Mark Pending
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'processing')} className="text-blue-600">
                                                        <Package className="mr-2 h-4 w-4" /> Mark Processing
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'shipped')} className="text-purple-600">
                                                        <Truck className="mr-2 h-4 w-4" /> Mark Shipped
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'delivered')} className="text-green-600">
                                                        <CheckCircle className="mr-2 h-4 w-4" /> Mark Delivered
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Payment Status</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handlePaymentUpdate(order.id, 'paid')} className="text-green-600">
                                                        <CheckCircle className="mr-2 h-4 w-4" /> Mark as Paid
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handlePaymentUpdate(order.id, 'pending')} className="text-yellow-600">
                                                        <Clock className="mr-2 h-4 w-4" /> Mark as Unpaid
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'cancelled')} className="text-red-600">
                                                        <XCircle className="mr-2 h-4 w-4" /> Cancel Order
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
