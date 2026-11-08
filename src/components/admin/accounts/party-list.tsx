"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AddPartyDialog } from "@/components/admin/accounts/add-party-dialog";
import type { Party } from "@/lib/types";

export function PartyList({ parties, type }: { parties: Party[]; type: "payable" | "receivable" }) {
  const [query, setQuery] = useState("");

  const filtered = parties.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || (p.phone || "").toLowerCase().includes(q);
  });

  return (
    <Card className="rounded-none border-zinc-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-black uppercase tracking-[0.2em]">
          {type === "payable" ? "সাপ্লায়ার তালিকা" : "কাস্টমার তালিকা"}
        </CardTitle>
        <AddPartyDialog type={type} />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={type === "payable" ? "নাম বা ফোন দিয়ে সাপ্লায়ার খুঁজুন..." : "নাম বা ফোন দিয়ে কাস্টমার খুঁজুন..."}
            className="pl-9 rounded-none border-zinc-200"
          />
        </div>
        <div className="divide-y divide-zinc-100">
          {filtered.length === 0 && (
            <p className="text-center text-zinc-400 py-8 text-sm">
              {query ? "কোনো মিল পাওয়া যায়নি।" : `কোনো ${type === "payable" ? "সাপ্লায়ার" : "কাস্টমার"} নেই।`}
            </p>
          )}
          {filtered.map((p) => (
            <Link
              key={p.id}
              href={`/admin/accounts/due/${p.id}`}
              className="flex items-center justify-between py-3 hover:bg-zinc-50 px-2 -mx-2"
            >
              <div>
                <div className="font-medium">{p.name}</div>
                {p.phone && <div className="text-xs text-zinc-400">{p.phone}</div>}
              </div>
              <div className={`font-black ${Number(p.currentBalance) > 0 ? "text-red-600" : "text-zinc-400"}`}>
                ৳{Number(p.currentBalance).toLocaleString()}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
