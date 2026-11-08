import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { getPurchases } from "@/lib/accounts-data";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = { paid: "পরিশোধিত", partial: "আংশিক", due: "বাকি" };
const statusColor: Record<string, string> = {
  paid: "bg-green-100 text-green-700 border-green-200",
  partial: "bg-orange-100 text-orange-700 border-orange-200",
  due: "bg-red-100 text-red-700 border-red-200",
};

export default async function PurchasePage() {
  const purchases = await getPurchases();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black font-headline uppercase tracking-tight">ক্রয়</h1>
          <p className="text-zinc-500 text-sm">সাপ্লায়ারদের কাছ থেকে পণ্য ক্রয়ের তালিকা — স্টক ও দেনার সাথে যুক্ত।</p>
        </div>
        <Button asChild className="gap-2 rounded-none">
          <Link href="/admin/accounts/purchase/new"><Plus className="h-4 w-4" /> নতুন ক্রয়</Link>
        </Button>
      </div>

      <Card className="rounded-none border-zinc-200">
        <CardHeader>
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em]">ক্রয়ের তালিকা</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>তারিখ</TableHead>
                <TableHead>সাপ্লায়ার</TableHead>
                <TableHead>ইনভয়েস</TableHead>
                <TableHead className="text-right">মোট</TableHead>
                <TableHead className="text-right">পরিশোধিত</TableHead>
                <TableHead className="text-right">বাকি</TableHead>
                <TableHead>অবস্থা</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-zinc-400 py-8">কোনো ক্রয় পাওয়া যায়নি।</TableCell>
                </TableRow>
              )}
              {purchases.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-sm">{format(new Date(p.date), "dd MMM yyyy")}</TableCell>
                  <TableCell className="font-medium">{p.supplierName || "—"}</TableCell>
                  <TableCell className="text-sm text-zinc-500">{p.invoiceNo || "—"}</TableCell>
                  <TableCell className="text-right">৳{Number(p.totalAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-right text-green-600">৳{Number(p.paidAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-right text-red-600">৳{Number(p.dueAmount).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`rounded-none ${statusColor[p.paymentStatus]}`}>
                      {statusLabel[p.paymentStatus]}
                    </Badge>
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
