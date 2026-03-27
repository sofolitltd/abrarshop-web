import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users, TrendingUp, ArrowUpRight } from "lucide-react";
import { getDashboardStats } from "@/lib/actions";
import { Overview } from "@/components/admin/overview";
import { RecentSales } from "@/components/admin/recent-sales";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const { stats, recentOrders, salesData } = await getDashboardStats();

    const statCards = [
        { title: "Total Revenue", value: `৳${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, description: "Total earnings from paid orders", color: "text-green-600" },
        { title: "Transactions", value: stats.totalSales, icon: ShoppingCart, description: "Total orders placed", color: "text-blue-600" },
        { title: "Products", value: stats.totalProducts, icon: Package, description: "Total catalog items", color: "text-orange-600" },
        { title: "Customers", value: stats.totalCustomers, icon: Users, description: "Registered user base", color: "text-zinc-600" },
    ];

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black font-headline uppercase tracking-tight">Dashboard <span className="">Overview</span></h1>
                <p className="text-zinc-500 text-sm">Real-time performance metrics and shop activity.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <Card key={stat.title} className="rounded-none border-zinc-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{stat.title}</CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color} opacity-40`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black">{stat.value}</div>
                            <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-tight">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4 rounded-none border-zinc-200 overflow-hidden min-w-0">
                    <CardHeader>
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em]">Sales Overview</CardTitle>
                        <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Revenue generated in the last 7 days</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2 pr-4">
                        <div className="h-[350px] w-full min-w-0">
                            <Overview data={salesData} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3 rounded-none border-zinc-200 overflow-hidden min-w-0">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-xs font-black uppercase tracking-[0.2em]">Recent Sales</CardTitle>
                            <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Latest 5 customer transactions</CardDescription>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <RecentSales orders={recentOrders} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
