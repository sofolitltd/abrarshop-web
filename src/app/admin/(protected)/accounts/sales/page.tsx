import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Receipt, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { getSalesReport } from "@/lib/accounts-data";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const report = await getSalesReport();

  const statCards = [
    { title: "মোট বিক্রয় (রেভিনিউ)", value: report.totalRevenue, icon: DollarSign, color: "text-blue-600" },
    { title: "আনুমানিক ক্রয়মূল্য", value: report.totalCost, icon: Receipt, color: "text-zinc-600" },
    { title: "মোট লাভ", value: report.totalProfit, icon: TrendingUp, color: "text-green-600" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-black font-headline uppercase tracking-tight">বিক্রয়</h1>
        <p className="text-zinc-500 text-sm">অনলাইন অর্ডার ও POS থেকে হওয়া সকল বিক্রয়ের রিপোর্ট (আনুমানিক লাভ, বর্তমান ক্রয়মূল্য অনুযায়ী)।</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {statCards.map((s) => (
          <Card key={s.title} className="rounded-none border-zinc-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{s.title}</CardTitle>
              <s.icon className={`h-4 w-4 ${s.color} opacity-60`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black">৳{Math.round(s.value).toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-none border-zinc-200">
        <CardHeader>
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em]">অর্ডারভিত্তিক বিবরণ</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>অর্ডার নং</TableHead>
                <TableHead>তারিখ</TableHead>
                <TableHead className="text-right">বিক্রয়</TableHead>
                <TableHead className="text-right">ক্রয়মূল্য</TableHead>
                <TableHead className="text-right">লাভ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-zinc-400 py-8">কোনো বিক্রয় পাওয়া যায়নি।</TableCell>
                </TableRow>
              )}
              {report.rows.map((row) => (
                <TableRow key={row.orderNumber}>
                  <TableCell>
                    <Link href={`/admin/orders/${row.orderNumber}`} className="font-medium text-blue-600 hover:underline">
                      {row.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm">{format(new Date(row.date), "dd MMM yyyy")}</TableCell>
                  <TableCell className="text-right">৳{row.revenue.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-zinc-500">৳{row.cost.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-bold text-green-600">৳{row.profit.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
