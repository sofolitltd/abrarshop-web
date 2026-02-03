import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";

const stats = [
    { title: "Total Revenue", value: "45,232৳", icon: DollarSign, change: "+20.1% from last month" },
    { title: "Sales", value: "+2350", icon: ShoppingCart, change: "+180.1% from last month" },
    { title: "Total Products", value: "8", icon: Package, change: "static" },
    { title: "Active Users", value: "573", icon: Users, change: "+2 since last hour" },
];


export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">{stat.change}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">No recent activity to display.</p>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
