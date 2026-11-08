import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, ShoppingBag, PlusCircle, MinusCircle } from "lucide-react";
import { format } from "date-fns";
import { getIncomeSummary, getOtherIncomes } from "@/lib/accounts-data";
import { AddOtherIncomeDialog } from "@/components/admin/accounts/add-other-income-dialog";

export const dynamic = "force-dynamic";

export default async function IncomePage() {
  const [summary, otherIncomes] = await Promise.all([getIncomeSummary(), getOtherIncomes()]);

  const statCards = [
    { title: "বিক্রয় থেকে লাভ", value: summary.salesProfit, icon: ShoppingBag, color: "text-blue-600" },
    { title: "অন্য আয়", value: summary.totalOtherIncome, icon: PlusCircle, color: "text-green-600" },
    { title: "মোট খরচ", value: summary.totalExpense, icon: MinusCircle, color: "text-red-600" },
    { title: "নিট আয়", value: summary.netIncome, icon: TrendingUp, color: "text-zinc-800" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black font-headline uppercase tracking-tight">আয়</h1>
          <p className="text-zinc-500 text-sm">বিক্রয়ের লাভ ও অন্য আয়ের সম্পূর্ণ হিসাব।</p>
        </div>
        <AddOtherIncomeDialog />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em]">অন্য আয়ের তালিকা</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>তারিখ</TableHead>
                <TableHead>শিরোনাম</TableHead>
                <TableHead>নোট</TableHead>
                <TableHead className="text-right">পরিমাণ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {otherIncomes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-zinc-400 py-8">কোনো এন্ট্রি নেই।</TableCell>
                </TableRow>
              )}
              {otherIncomes.map((inc) => (
                <TableRow key={inc.id}>
                  <TableCell className="text-sm">{format(new Date(inc.date), "dd MMM yyyy")}</TableCell>
                  <TableCell className="font-medium">{inc.title}</TableCell>
                  <TableCell className="text-sm text-zinc-500">{inc.note || "—"}</TableCell>
                  <TableCell className="text-right font-bold text-green-600">৳{Number(inc.amount).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
