"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createPurchase, createParty } from "@/lib/accounts-actions";
import type { Product, Party } from "@/lib/types";

type Row = { key: string; productId: string; quantity: string; buyPrice: string };

export function PurchaseForm({ products, suppliers }: { products: Product[]; suppliers: Party[] }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const [supplierId, setSupplierId] = useState<string>("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [note, setNote] = useState("");
  const [paidAmount, setPaidAmount] = useState("0");
  const [rows, setRows] = useState<Row[]>([{ key: crypto.randomUUID(), productId: "", quantity: "1", buyPrice: "" }]);

  const [newSupplierOpen, setNewSupplierOpen] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [localSuppliers, setLocalSuppliers] = useState<Party[]>(suppliers);

  const addRow = () => setRows((r) => [...r, { key: crypto.randomUUID(), productId: "", quantity: "1", buyPrice: "" }]);
  const removeRow = (key: string) => setRows((r) => (r.length > 1 ? r.filter((row) => row.key !== key) : r));

  const updateRow = (key: string, patch: Partial<Row>) =>
    setRows((r) => r.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  const onProductSelect = (key: string, productId: string) => {
    const product = products.find((p) => p.id === productId);
    updateRow(key, { productId, buyPrice: product?.buyPrice != null ? String(product.buyPrice) : "" });
  };

  const total = useMemo(
    () => rows.reduce((sum, r) => sum + (Number(r.quantity) || 0) * (Number(r.buyPrice) || 0), 0),
    [rows]
  );
  const due = Math.max(0, total - (Number(paidAmount) || 0));

  const handleCreateSupplier = () => {
    if (!newSupplierName.trim()) return;
    startTransition(async () => {
      const result = await createParty({ name: newSupplierName, type: "payable" });
      if (result.success && result.party) {
        setLocalSuppliers((s) => [result.party as Party, ...s]);
        setSupplierId(result.party.id);
        setNewSupplierOpen(false);
        setNewSupplierName("");
        toast({ title: "সফল", description: "সাপ্লায়ার যুক্ত হয়েছে।" });
      } else {
        toast({ title: "ত্রুটি", description: result.message, variant: "destructive" });
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const items = rows
      .filter((r) => r.productId && Number(r.quantity) > 0)
      .map((r) => ({ productId: r.productId, quantity: Number(r.quantity), buyPrice: Number(r.buyPrice) || 0 }));

    if (items.length === 0) {
      toast({ title: "ত্রুটি", description: "কমপক্ষে একটি পণ্য যুক্ত করুন।", variant: "destructive" });
      return;
    }

    startTransition(async () => {
      const result = await createPurchase({
        supplierId: supplierId || null,
        invoiceNo,
        note,
        paidAmount: Number(paidAmount) || 0,
        items,
      });
      if (result.success) {
        toast({ title: "সফল", description: "ক্রয় যুক্ত হয়েছে, স্টক আপডেট হয়েছে।" });
        router.push("/admin/accounts/purchase");
        router.refresh();
      } else {
        toast({ title: "ত্রুটি", description: result.message, variant: "destructive" });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="rounded-none border-zinc-200">
        <CardHeader>
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em]">সাপ্লায়ার ও তথ্য</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>সাপ্লায়ার (ঐচ্ছিক)</Label>
            {!newSupplierOpen ? (
              <div className="flex gap-2">
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger><SelectValue placeholder="সাপ্লায়ার নির্বাচন করুন" /></SelectTrigger>
                  <SelectContent>
                    {localSuppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="icon" className="rounded-none shrink-0" onClick={() => setNewSupplierOpen(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  autoFocus
                  placeholder="নতুন সাপ্লায়ারের নাম"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                />
                <Button type="button" className="rounded-none shrink-0" onClick={handleCreateSupplier} disabled={isPending}>
                  যুক্ত করুন
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>ইনভয়েস নং (ঐচ্ছিক)</Label>
            <Input value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>নোট (ঐচ্ছিক)</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-none border-zinc-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em]">পণ্যসমূহ</CardTitle>
          <Button type="button" variant="outline" size="sm" className="gap-1 rounded-none" onClick={addRow}>
            <Plus className="h-4 w-4" /> পণ্য যুক্ত করুন
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.map((row) => {
            const subtotal = (Number(row.quantity) || 0) * (Number(row.buyPrice) || 0);
            return (
              <div key={row.key} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5 space-y-1">
                  <Label className="text-[10px] uppercase text-zinc-400">পণ্য</Label>
                  <Select value={row.productId} onValueChange={(v) => onProductSelect(row.key, v)}>
                    <SelectTrigger><SelectValue placeholder="পণ্য নির্বাচন করুন" /></SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-[10px] uppercase text-zinc-400">পরিমাণ</Label>
                  <Input type="number" min="1" value={row.quantity} onChange={(e) => updateRow(row.key, { quantity: e.target.value })} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-[10px] uppercase text-zinc-400">ক্রয়মূল্য/একক</Label>
                  <Input type="number" step="0.01" min="0" value={row.buyPrice} onChange={(e) => updateRow(row.key, { buyPrice: e.target.value })} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-[10px] uppercase text-zinc-400">সাবটোটাল</Label>
                  <div className="h-9 flex items-center text-sm font-bold">৳{subtotal.toLocaleString()}</div>
                </div>
                <div className="col-span-1">
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeRow(row.key)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="rounded-none border-zinc-200">
        <CardContent className="grid gap-4 sm:grid-cols-3 pt-6">
          <div className="space-y-1">
            <Label className="text-[10px] uppercase text-zinc-400">মোট মূল্য</Label>
            <div className="text-2xl font-black">৳{total.toLocaleString()}</div>
          </div>
          <div className="space-y-2">
            <Label>এখন পরিশোধ (ক্যাশ)</Label>
            <Input type="number" step="0.01" min="0" max={total} value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] uppercase text-zinc-400">বাকি থাকবে</Label>
            <div className="text-2xl font-black text-orange-600">৳{due.toLocaleString()}</div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" disabled={isPending} className="rounded-none w-full sm:w-auto">
        {isPending ? "সংরক্ষণ হচ্ছে..." : "ক্রয় সংরক্ষণ করুন"}
      </Button>
    </form>
  );
}
