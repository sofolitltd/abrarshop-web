"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { createPartyTransaction } from "@/lib/accounts-actions";

export function AddPartyTransactionDialog({
  partyId,
  partyType,
  trigger,
}: {
  partyId: string;
  partyType: "payable" | "receivable";
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"due" | "payment">("due");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const reset = () => {
    setAmount("");
    setNote("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await createPartyTransaction({ partyId, type, amount, note });
      if (result.success) {
        toast({ title: "সফল", description: "লেনদেন যুক্ত হয়েছে।" });
        setOpen(false);
        reset();
        router.refresh();
      } else {
        toast({ title: "ত্রুটি", description: result.message, variant: "destructive" });
      }
    });
  };

  const dueLabel = partyType === "payable" ? "নতুন বাকি (আমরা পাব না, দিতে হবে বেশি)" : "নতুন বাকি (সে দিবে)";
  const paymentLabel = partyType === "payable" ? "টাকা পরিশোধ করলাম (ক্যাশ থেকে যাবে)" : "টাকা পেলাম (ক্যাশে ঢুকবে)";

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) setType("due"); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>হিসাব আপডেট করুন</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={type === "due" ? "default" : "outline"}
              className="rounded-none text-xs"
              onClick={() => setType("due")}
            >
              {dueLabel}
            </Button>
            <Button
              type="button"
              variant={type === "payment" ? "default" : "outline"}
              className="rounded-none text-xs"
              onClick={() => setType("payment")}
            >
              {paymentLabel}
            </Button>
          </div>
          <div className="space-y-2">
            <Label>টাকার পরিমাণ</Label>
            <Input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>নোট (ঐচ্ছিক)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending} className="rounded-none">
              {isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
