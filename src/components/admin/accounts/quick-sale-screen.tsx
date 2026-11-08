"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Search, Plus, Minus, Trash2, Package, X, Loader2, CheckCircle2, Banknote, Smartphone, ScanBarcode, AlertTriangle, Mic, MicOff, Contact } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { searchProducts, createOrderManual } from "@/lib/actions";
import { recordQuickSaleDue, recordQuickSaleCashReceipt } from "@/lib/accounts-actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { BarcodeScannerDialog } from "@/components/admin/barcode-scanner-dialog";
import type { Party } from "@/lib/types";

type CartItem = {
  id: string;
  name: string;
  price: number;
  buyPrice: number;
  stock: number;
  quantity: number;
  discount: number;
  discountType: "flat" | "percent";
  image?: string;
};

type RecentCustomer = { name: string; mobile: string | null };

const PAYMENT_METHODS: { value: "cash" | "bkash" | "nagad"; label: string; icon: typeof Banknote }[] = [
  { value: "cash", label: "ক্যাশ", icon: Banknote },
  { value: "bkash", label: "বিকাশ", icon: Smartphone },
  { value: "nagad", label: "নগদ", icon: Smartphone },
];

export function QuickSaleScreen({
  recentCustomers,
  allCustomers,
}: {
  recentCustomers: RecentCustomer[];
  allCustomers: Party[];
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bkash" | "nagad">("cash");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [receivedTouched, setReceivedTouched] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [contactPickerOpen, setContactPickerOpen] = useState(false);
  const [contactSearch, setContactSearch] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const listenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    if (value.trim().length < 1) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchProducts(value, 8, "all");
      setSearchResults(results);
    } catch {
      // ignore
    } finally {
      setIsSearching(false);
    }
  };

  const stopListening = () => {
    if (listenTimeoutRef.current) {
      clearTimeout(listenTimeoutRef.current);
      listenTimeoutRef.current = null;
    }
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
  };

  const toggleVoiceSearch = () => {
    if (isListening) {
      stopListening();
      return;
    }

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      toast({ title: "সাপোর্ট নেই", description: "এই ব্রাউজারে ভয়েস সার্চ কাজ করে না (HTTPS প্রয়োজন হতে পারে)।", variant: "destructive" });
      return;
    }

    const recognition = new SpeechRecognitionClass();
    // "bn-BD" understands mixed Bangla/English speech well on Chrome/Android.
    recognition.lang = "bn-BD";
    // continuous:false lets the browser auto-stop after a short pause in speech,
    // same as a normal voice-search box — it just restarts itself (below) while
    // the mic button is still toggled on, so speech still flows live.
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (transcript.trim()) handleSearch(transcript.trim());
    };
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "no-speech" || event.error === "aborted") return;
      toast({ title: "ভয়েস সার্চ ব্যর্থ", description: `ত্রুটি: ${event.error}। আবার চেষ্টা করুন।`, variant: "destructive" });
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      if (listenTimeoutRef.current) {
        clearTimeout(listenTimeoutRef.current);
        listenTimeoutRef.current = null;
      }
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();

    // Safety net: force-stop after 10s even if the browser never fires onend.
    listenTimeoutRef.current = setTimeout(() => stopListening(), 10000);
  };

  const addToCart = (product: any) => {
    if (product.stock <= 0) {
      toast({ title: "স্টক নেই", description: `"${product.name}" এর স্টক শেষ।`, variant: "destructive" });
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast({ title: "স্টক সীমিত", description: "এর বেশি স্টকে নেই।", variant: "destructive" });
          return prev;
        }
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          buyPrice: Number(product.buyPrice || 0),
          stock: product.stock,
          quantity: 1,
          discount: 0,
          discountType: "flat" as const,
          image: product.images?.[0],
        },
      ];
    });
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleScan = async (value: string) => {
    try {
      const results = await searchProducts(value, 5, "all");
      const match = results.find((p: any) => p.barcode === value) || results[0];
      if (match) {
        addToCart(match);
        toast({ title: "পণ্য যুক্ত হয়েছে", description: match.name });
      } else {
        toast({ title: "পণ্য পাওয়া যায়নি", description: `বারকোড: ${value}`, variant: "destructive" });
      }
    } catch {
      toast({ title: "ত্রুটি", description: "বারকোড খোঁজা যায়নি।", variant: "destructive" });
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextQty = Math.max(1, item.quantity + delta);
        if (nextQty > item.stock) {
          toast({ title: "স্টক সীমিত", description: "এর বেশি স্টকে নেই।", variant: "destructive" });
          return item;
        }
        return { ...item, quantity: nextQty };
      })
    );
  };

  const updateDiscount = (id: string, amount: number, type?: "flat" | "percent") => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, discount: Math.max(0, amount), discountType: type || item.discountType } : item
      )
    );
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((item) => item.id !== id));

  const pickContact = (c: Party) => {
    setCustomerName(c.name);
    setCustomerPhone(c.phone || "");
    setContactPickerOpen(false);
    setContactSearch("");
  };

  const filteredContacts = allCustomers.filter((c) => {
    const q = contactSearch.trim().toLowerCase();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || (c.phone || "").toLowerCase().includes(q);
  });

  const calculateLineTotal = (item: CartItem) => {
    const base = item.price * item.quantity;
    const discounted = item.discountType === "percent" ? base - base * (item.discount / 100) : base - item.discount;
    return Math.max(0, discounted);
  };

  const total = cart.reduce((sum, item) => sum + calculateLineTotal(item), 0);
  const effectiveReceived = receivedTouched ? Math.max(0, Number(receivedAmount) || 0) : total;
  const dueAmount = Math.max(0, total - effectiveReceived);

  const handleComplete = () => {
    if (cart.length === 0) {
      toast({ title: "ত্রুটি", description: "কমপক্ষে একটা পণ্য যুক্ত করুন।", variant: "destructive" });
      return;
    }
    if (dueAmount > 0 && (!customerName.trim() || !customerPhone.trim())) {
      toast({ title: "ত্রুটি", description: "টাকা বাকি থাকলে কাস্টমারের নাম ও ফোন নাম্বার দুটোই লাগবে।", variant: "destructive" });
      return;
    }
    startTransition(async () => {
      const result = await createOrderManual({
        customerName: customerName.trim() || undefined,
        customerMobile: customerPhone.trim() || undefined,
        paymentMethod,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: Math.round((calculateLineTotal(item) / item.quantity) * 100) / 100,
        })),
        orderSource: "local",
      });

      if (!result.success) {
        toast({ title: "ত্রুটি", description: result.message, variant: "destructive" });
        return;
      }

      // Record the cash (or bKash/Nagad) actually received into the Accounts cash ledger.
      if (effectiveReceived > 0) {
        const cashResult = await recordQuickSaleCashReceipt({
          amount: effectiveReceived,
          note: `দ্রুত বিক্রয় - অর্ডার #${result.orderNumber}`,
          relatedOrderId: result.orderId,
        });
        if (!cashResult.success) {
          toast({ title: "অর্ডার হয়েছে, কিন্তু ক্যাশে যুক্ত হয়নি", description: cashResult.message, variant: "destructive" });
        }
      }

      if (dueAmount > 0) {
        const dueResult = await recordQuickSaleDue({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          amount: dueAmount,
          note: `দ্রুত বিক্রয় - অর্ডার #${result.orderNumber}`,
          relatedOrderId: result.orderId,
        });
        if (!dueResult.success) {
          toast({ title: "অর্ডার হয়েছে, কিন্তু বাকি যুক্ত হয়নি", description: dueResult.message, variant: "destructive" });
        } else {
          toast({
            title: "বিক্রি সম্পন্ন (আংশিক পরিশোধ)",
            description: `অর্ডার #${result.orderNumber} • মোট ৳${result.totalAmount.toLocaleString()} • ক্যাশে ৳${effectiveReceived.toLocaleString()} • বাকি ৳${dueAmount.toLocaleString()} "${dueResult.partyName}"-এর পাওনায় যুক্ত হয়েছে।`,
          });
        }
      } else {
        toast({ title: "বিক্রি সম্পন্ন", description: `অর্ডার #${result.orderNumber} • ৳${result.totalAmount.toLocaleString()} ক্যাশে যুক্ত হয়েছে।` });
      }

      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setPaymentMethod("cash");
      setReceivedAmount("");
      setReceivedTouched(false);
    });
  };

  return (
    <div className="max-w-sm mx-auto flex flex-col min-h-[calc(100vh-24px)]">
      {/* Search (includes a tiny back link so the app bar isn't needed) */}
      <div className="relative z-20 mb-2 flex gap-1.5 shrink-0">
        <Link
          href="/admin/accounts"
          className="h-10 w-8 shrink-0 flex items-center justify-center border border-zinc-200 bg-white text-zinc-400"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={isListening ? "শুনছি..." : "পণ্য খুঁজুন..."}
            className="pl-8 pr-16 h-10 text-sm rounded-none border-zinc-200 bg-white"
          />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center">
            {searchTerm && !isListening && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSearchResults([]);
                }}
                className="p-1 text-zinc-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={toggleVoiceSearch}
              className={cn("p-1 rounded-full", isListening ? "text-red-600 animate-pulse" : "text-zinc-400")}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 shadow-2xl max-h-[55vh] overflow-y-auto">
              {searchResults.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="w-full flex items-center gap-2 p-2 hover:bg-zinc-50 border-b border-zinc-50 last:border-0 text-left"
                >
                  <div className="relative h-10 w-10 shrink-0 bg-zinc-50 border border-zinc-100">
                    {product.images?.[0] ? (
                      <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                    ) : (
                      <Package className="h-4 w-4 m-auto text-zinc-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{product.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-black text-orange-600">৳{product.price}</span>
                      <span className={cn("text-[10px]", product.stock <= 5 ? "text-red-600 font-bold" : "text-zinc-400")}>
                        স্টক: {product.stock}
                      </span>
                    </div>
                  </div>
                  <Plus className="h-4 w-4 text-zinc-300 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-10 shrink-0 rounded-none border-zinc-200 bg-white p-0"
          onClick={() => setScannerOpen(true)}
        >
          <ScanBarcode className="h-4 w-4" />
        </Button>
      </div>

      <BarcodeScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScan={handleScan}
        title="বারকোড স্কান করুন"
        description="পণ্যের বারকোডের দিকে ক্যামেরা তাক করুন।"
      />

      {/* Cart (scrollable middle) */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-zinc-300 border border-dashed border-zinc-200 py-8">
            <Package className="h-7 w-7 mb-1 opacity-40" />
            <p className="text-[10px] font-bold uppercase tracking-widest">পণ্য খুঁজে যুক্ত করুন</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {cart.map((item) => {
              const lineTotal = calculateLineTotal(item);
              const effectiveUnitPrice = lineTotal / item.quantity;
              const belowCost = item.buyPrice > 0 && effectiveUnitPrice < item.buyPrice;
              return (
                <div key={item.id} className="bg-white border border-zinc-200 p-1.5">
                  <div className="flex items-center gap-2">
                    <div className="relative h-9 w-9 shrink-0 bg-zinc-50 border border-zinc-100">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <Package className="h-3.5 w-3.5 m-auto text-zinc-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate leading-tight">{item.name}</p>
                      <p className="text-[10px] text-zinc-400 leading-tight">
                        ক্রয় ৳{item.buyPrice || "—"} · বিক্রয় ৳{item.price}
                      </p>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-zinc-300 hover:text-red-500 p-1 shrink-0">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="h-7 w-7 flex items-center justify-center border border-zinc-200"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-black">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="h-7 w-7 flex items-center justify-center border border-zinc-200"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex items-center shrink-0 border border-zinc-200">
                      <button
                        onClick={() => updateDiscount(item.id, item.discount, "flat")}
                        className={cn("h-7 w-6 text-[9px] font-black", item.discountType === "flat" ? "bg-black text-white" : "text-zinc-400")}
                      >
                        ৳
                      </button>
                      <button
                        onClick={() => updateDiscount(item.id, item.discount, "percent")}
                        className={cn("h-7 w-6 text-[9px] font-black border-l border-zinc-200", item.discountType === "percent" ? "bg-black text-white" : "text-zinc-400")}
                      >
                        %
                      </button>
                    </div>
                    <Input
                      type="number"
                      value={item.discount || ""}
                      placeholder="ছাড়"
                      onChange={(e) => updateDiscount(item.id, Number(e.target.value) || 0)}
                      className="h-7 w-14 rounded-none border-zinc-200 text-right font-bold px-1.5 text-xs shrink-0"
                    />
                    <span className={cn("flex-1 text-right text-xs font-black", belowCost ? "text-red-600" : "text-orange-600")}>
                      ৳{lineTotal.toLocaleString()}
                    </span>
                  </div>
                  {belowCost && (
                    <p className="flex items-center gap-1 text-[9px] font-bold text-red-600 mt-1">
                      <AlertTriangle className="h-2.5 w-2.5" /> ক্রয়মূল্যের চেয়ে কম দামে বিক্রি হচ্ছে
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Payment method */}
        <div className="flex gap-1.5 mt-2">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.value}
              onClick={() => setPaymentMethod(m.value)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 py-1.5 border font-bold text-[11px] rounded-none",
                paymentMethod === m.value ? "bg-black text-white border-black" : "bg-white border-zinc-200 text-zinc-600"
              )}
            >
              <m.icon className="h-3 w-3" />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sticky checkout bar */}
      <div className="sticky bottom-0 left-0 right-0 shrink-0 -mx-3 px-3 py-2 bg-white border-t border-zinc-200 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <span className="text-[9px] font-black uppercase text-zinc-400">মোট</span>
            <div className="text-xl font-black text-orange-600 leading-tight">৳{total.toLocaleString()}</div>
          </div>
          <div className="w-24">
            <span className="text-[9px] font-black uppercase text-zinc-400">প্রাপ্ত</span>
            <Input
              type="number"
              value={receivedTouched ? receivedAmount : total}
              onChange={(e) => {
                setReceivedTouched(true);
                setReceivedAmount(e.target.value);
              }}
              className="h-8 rounded-none border-zinc-200 text-right font-bold text-sm px-2"
            />
          </div>
          {dueAmount > 0 && (
            <div className="w-20 text-right">
              <span className="text-[9px] font-black uppercase text-red-500">বাকি</span>
              <div className="text-sm font-black text-red-600 leading-tight">৳{dueAmount.toLocaleString()}</div>
            </div>
          )}
        </div>

        <div className="flex gap-1.5">
          <Input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder={dueAmount > 0 ? "নাম (আবশ্যক)" : "নাম (ঐচ্ছিক)"}
            className={cn("h-8 flex-1 rounded-none border-zinc-200 bg-white text-xs px-2", dueAmount > 0 && !customerName.trim() && "border-red-300")}
          />
          <Input
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder={dueAmount > 0 ? "ফোন (আবশ্যক)" : "ফোন (ঐচ্ছিক)"}
            className={cn("h-8 flex-1 rounded-none border-zinc-200 bg-white text-xs px-2", dueAmount > 0 && !customerPhone.trim() && "border-red-300")}
          />
          <button
            type="button"
            onClick={() => setContactPickerOpen(true)}
            className="h-8 w-8 shrink-0 flex items-center justify-center border border-zinc-200 bg-white text-zinc-500"
            title="কাস্টমার তালিকা থেকে নির্বাচন করুন"
          >
            <Contact className="h-4 w-4" />
          </button>
        </div>

        {recentCustomers.length > 0 && (
          <div className="flex gap-1 overflow-x-auto">
            {recentCustomers.slice(0, 8).map((c) => (
              <button
                key={`${c.name}-${c.mobile}`}
                onClick={() => {
                  setCustomerName(c.name);
                  setCustomerPhone(c.mobile || "");
                }}
                className={cn(
                  "shrink-0 px-2 py-0.5 text-[10px] font-bold border rounded-none whitespace-nowrap",
                  customerName === c.name ? "bg-black text-white border-black" : "bg-white border-zinc-200 text-zinc-600"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        <Button
          className="w-full h-11 rounded-none bg-black hover:bg-zinc-800 text-white text-sm font-black uppercase gap-2"
          disabled={cart.length === 0 || isPending}
          onClick={handleComplete}
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          বিক্রি সম্পন্ন করুন
        </Button>
      </div>

      <Dialog open={contactPickerOpen} onOpenChange={(open) => { setContactPickerOpen(open); if (!open) setContactSearch(""); }}>
        <DialogContent className="sm:max-w-sm p-0 gap-0 max-h-[70vh] flex flex-col">
          <DialogHeader className="p-3 border-b border-zinc-100">
            <DialogTitle className="text-sm">কাস্টমার তালিকা থেকে নির্বাচন করুন</DialogTitle>
          </DialogHeader>
          <div className="p-2 border-b border-zinc-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <Input
                autoFocus
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                placeholder="নাম বা ফোন দিয়ে খুঁজুন..."
                className="pl-8 h-9 text-sm rounded-none border-zinc-200"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.length === 0 && (
              <p className="text-center text-zinc-400 text-xs py-8">কোনো কাস্টমার পাওয়া যায়নি।</p>
            )}
            {filteredContacts.map((c) => (
              <button
                key={c.id}
                onClick={() => pickContact(c)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-zinc-50 border-b border-zinc-50 last:border-0 text-left"
              >
                <div>
                  <p className="text-sm font-bold">{c.name}</p>
                  {c.phone && <p className="text-xs text-zinc-400">{c.phone}</p>}
                </div>
                {Number(c.currentBalance) > 0 && (
                  <span className="text-xs font-black text-red-600">৳{Number(c.currentBalance).toLocaleString()}</span>
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
