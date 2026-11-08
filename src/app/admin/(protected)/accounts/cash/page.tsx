import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCashBalance, getCashTransactions } from "@/lib/accounts-data";
import { AddCashTransactionDialog } from "@/components/admin/accounts/add-cash-transaction-dialog";
import { AddExpenseDialog } from "@/components/admin/accounts/add-expense-dialog";
import { CashTransactionsTable } from "@/components/admin/accounts/cash-transactions-table";

export const dynamic = "force-dynamic";

export default async function CashPage() {
  const [balance, transactions] = await Promise.all([getCashBalance(), getCashTransactions(100)]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black font-headline uppercase tracking-tight">ক্যাশ</h1>
          <p className="text-zinc-500 text-sm">হাতে থাকা ক্যাশের ইন/আউট হিসাব।</p>
        </div>
        <div className="flex gap-2">
          <AddExpenseDialog />
          <AddCashTransactionDialog />
        </div>
      </div>

      <Card className="rounded-none border-zinc-200">
        <CardHeader>
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400">বর্তমান ক্যাশ ব্যালেন্স</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-black">৳{Math.round(balance).toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card className="rounded-none border-zinc-200">
        <CardHeader>
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em]">লেনদেনের ইতিহাস</CardTitle>
        </CardHeader>
        <CardContent>
          <CashTransactionsTable transactions={transactions} />
        </CardContent>
      </Card>
    </div>
  );
}
