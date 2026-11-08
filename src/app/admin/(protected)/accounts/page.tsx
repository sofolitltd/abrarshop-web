import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, ShoppingBag, ShoppingCart, HandCoins, Wallet, ArrowUpRight, Plus, Zap } from "lucide-react";
import { getAccountsOverview } from "@/lib/accounts-data";
import { AddExpenseDialog } from "@/components/admin/accounts/add-expense-dialog";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const overview = await getAccountsOverview();

  const cards = [
    {
      title: "আয়",
      href: "/admin/accounts/income",
      icon: TrendingUp,
      color: "text-green-600",
      value: `৳${Math.round(overview.income.netIncome).toLocaleString()}`,
      description: "নিট আয় (বিক্রয় লাভ + অন্য আয় − খরচ)",
    },
    {
      title: "বিক্রয়",
      href: "/admin/accounts/sales",
      icon: ShoppingBag,
      color: "text-blue-600",
      value: `৳${Math.round(overview.income.salesProfit + 0).toLocaleString()}`,
      description: "মোট বিক্রয় লাভ (এই মাস পর্যন্ত সকল অর্ডার)",
    },
    {
      title: "ক্রয়",
      href: "/admin/accounts/purchase",
      icon: ShoppingCart,
      color: "text-orange-600",
      value: `৳${Math.round(overview.totalPurchase).toLocaleString()}`,
      description: "সাম্প্রতিক ক্রয়ের মোট মূল্য",
    },
    {
      title: "দেনা-পাওনা",
      href: "/admin/accounts/due",
      icon: HandCoins,
      color: "text-red-600",
      value: `দেনা ৳${Math.round(overview.totalPayable).toLocaleString()} · পাওনা ৳${Math.round(overview.totalReceivable).toLocaleString()}`,
      description: "সাপ্লায়ার ও কাস্টমারদের বাকি হিসাব",
    },
    {
      title: "ক্যাশ",
      href: "/admin/accounts/cash",
      icon: Wallet,
      color: "text-zinc-700",
      value: `৳${Math.round(overview.cashBalance).toLocaleString()}`,
      description: "এই মুহূর্তে হাতে থাকা ক্যাশ ব্যালেন্স",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black font-headline uppercase tracking-tight">হিসাব</h1>
          <p className="text-zinc-500 text-sm">দোকানের আয়, ব্যয়, ক্রয়-বিক্রয় ও ক্যাশের সম্পূর্ণ হিসাব এক জায়গায়।</p>
        </div>
        <div className="flex gap-2">
          <AddExpenseDialog />
          <Button asChild className="gap-2 rounded-none">
            <Link href="/admin/accounts/purchase/new"><Plus className="h-4 w-4" /> ক্রয় যোগ করুন</Link>
          </Button>
        </div>
      </div>

      <Link href="/admin/quick-sale">
        <Card className="rounded-none border-zinc-900 bg-black text-white hover:bg-zinc-900 transition-colors">
          <CardContent className="flex items-center justify-between py-5">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-orange-400" />
              <div>
                <p className="font-black uppercase tracking-tight">দ্রুত বিক্রয়</p>
                <p className="text-[11px] text-zinc-400">মোবাইল থেকে এক মিনিটে বিক্রি এন্ট্রি করুন</p>
              </div>
            </div>
            <ArrowUpRight className="h-5 w-5 text-zinc-500" />
          </CardContent>
        </Card>
      </Link>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="rounded-none border-zinc-200 hover:border-zinc-400 transition-colors h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{card.title}</CardTitle>
                <card.icon className={`h-4 w-4 ${card.color} opacity-60`} />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-black">{card.value}</div>
                <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-tight">{card.description}</p>
                <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 mt-3">
                  বিস্তারিত দেখুন <ArrowUpRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
