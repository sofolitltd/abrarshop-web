import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { getPartyById, getPartyTransactions } from "@/lib/accounts-data";
import { AddPartyTransactionDialog } from "@/components/admin/accounts/add-party-transaction-dialog";

export const dynamic = "force-dynamic";

export default async function PartyDetailPage({ params }: { params: Promise<{ partyId: string }> }) {
  const { partyId } = await params;
  const party = await getPartyById(partyId);
  if (!party) notFound();

  const transactions = await getPartyTransactions(partyId);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black font-headline uppercase tracking-tight">{party.name}</h1>
          <p className="text-zinc-500 text-sm">
            {party.type === "payable" ? "সাপ্লায়ার" : "কাস্টমার"} {party.phone ? `· ${party.phone}` : ""}
          </p>
        </div>
        <AddPartyTransactionDialog
          partyId={party.id}
          partyType={party.type}
          trigger={
            <Button className="gap-2 rounded-none">
              <Plus className="h-4 w-4" /> হিসাব আপডেট করুন
            </Button>
          }
        />
      </div>

      <Card className="rounded-none border-zinc-200">
        <CardHeader>
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            বর্তমান {party.type === "payable" ? "দেনা" : "পাওনা"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-red-600">৳{Number(party.currentBalance).toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card className="rounded-none border-zinc-200">
        <CardHeader>
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em]">লেনদেনের ইতিহাস</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>তারিখ</TableHead>
                <TableHead>ধরন</TableHead>
                <TableHead>নোট</TableHead>
                <TableHead className="text-right">পরিমাণ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-zinc-400 py-8">কোনো লেনদেন নেই।</TableCell>
                </TableRow>
              )}
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-sm">{format(new Date(t.date), "dd MMM yyyy")}</TableCell>
                  <TableCell>{t.type === "due" ? "বাকি যুক্ত হলো" : "পরিশোধ হলো"}</TableCell>
                  <TableCell className="text-sm text-zinc-500">{t.note || "—"}</TableCell>
                  <TableCell className={`text-right font-bold ${t.type === "due" ? "text-red-600" : "text-green-600"}`}>
                    {t.type === "due" ? "+" : "−"}৳{Number(t.amount).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
