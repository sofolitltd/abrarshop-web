import { getAllUsers } from "@/lib/actions";
import { AdminCustomersTable } from "@/components/admin/customers-table";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, UserPlus, MapPin } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const allUsers = await getAllUsers();

  const stats = [
    { label: 'Total Customers', value: allUsers.length, icon: Users, color: 'text-zinc-600' },
    { label: 'New This Month', value: allUsers.filter(u => new Date(u.createdAt).getMonth() === new Date().getMonth()).length, icon: UserPlus, color: 'text-orange-600' },
    { label: 'With Address', value: allUsers.filter(u => u.address).length, icon: MapPin, color: 'text-blue-600' },
    { label: 'Verified', value: allUsers.length, icon: UserCheck, color: 'text-green-600' }, // For now all are verified
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black font-headline uppercase tracking-tight">Customer Database</h1>
        <p className="text-zinc-500 text-sm">View and manage your registered customer base and their details.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      <AdminCustomersTable initialCustomers={allUsers} />
    </div>
  );
}
