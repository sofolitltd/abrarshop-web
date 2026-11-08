"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteCashTransaction } from "@/lib/accounts-actions";
import type { CashTransaction } from "@/lib/types";

const categoryLabel: Record<string, string> = {
  sale: "বিক্রয়",
  purchase_payment: "ক্রয়ের টাকা",
  expense: "খরচ",
  payable_payment: "দেনা পরিশোধ",
  receivable_collection: "পাওনা আদায়",
  other_income: "অন্য আয়",
  adjustment: "সমন্বয়",
};

export function CashTransactionsTable({ transactions }: { transactions: CashTransaction[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteCashTransaction(deleteId);
      if (result.success) {
        toast({ title: "সফল", description: "লেনদেন মুছে ফেলা হয়েছে।" });
        router.refresh();
      } else {
        toast({ title: "ত্রুটি", description: result.message, variant: "destructive" });
      }
      setDeleteId(null);
    });
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>তারিখ</TableHead>
            <TableHead>ধরন</TableHead>
            <TableHead>নোট</TableHead>
            <TableHead className="text-right">পরিমাণ</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-zinc-400 py-8">কোনো লেনদেন নেই।</TableCell>
            </TableRow>
          )}
          {transactions.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="text-sm">{format(new Date(t.date), "dd MMM yyyy")}</TableCell>
              <TableCell>
                <Badge variant="outline" className="rounded-none">{categoryLabel[t.category] || t.category}</Badge>
              </TableCell>
              <TableCell className="text-sm text-zinc-500">{t.note || "—"}</TableCell>
              <TableCell className={`text-right font-bold ${t.direction === "in" ? "text-green-600" : "text-red-600"}`}>
                {t.direction === "in" ? "+" : "−"}৳{Number(t.amount).toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-600" onClick={() => setDeleteId(t.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>এই লেনদেনটি মুছে ফেলবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              এটা শুধু ক্যাশের এন্ট্রি মুছবে — সংশ্লিষ্ট অর্ডার, দেনা-পাওনা বা ক্রয় রেকর্ড (যদি থাকে) আলাদাভাবে ঠিক করতে হবে। এটা ফিরিয়ে আনা যাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>বাতিল</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
              {isPending ? "মুছে ফেলা হচ্ছে..." : "মুছে ফেলুন"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
