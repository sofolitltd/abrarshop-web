"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Search, Plus, Minus, Trash2, Package, X, Loader2, CheckCircle2, Banknote, Smartphone, ScanBarcode, AlertTriangle, Mic, MicOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchProducts, createOrderManual } from "@/lib/actions";
import { recordQuickSaleDue, recordQuickSaleCashReceipt } from "@/lib/accounts-actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { BarcodeScannerDialog } from "@/components/admin/barcode-scanner-dialog";

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

export function QuickSaleScreen({ recentCustomers }: { recentCustomers: RecentCustomer[] }) {
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
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef("");

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

  const toggleVoiceSearch = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      toast({ title: "সাপোর্ট নেই", description: "এই ব্রাউজারে ভয়েস সার্চ কাজ করে না।", variant: "destructive" });
      return;
    }

    const recognition = new SpeechRecognitionClass();
    // "bn-BD" understands mixed Bangla/English speech well on Chrome/Android.
    recognition.lang = "bn-BD";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    finalTranscriptRef.current = "";
    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      handleSearch((finalTranscriptRef.current + interimTranscript).trim());
    };
    recognition.onerror = () => {
      toast({ title: "ভয়েস সার্চ ব্যর্থ", description: "আবার চেষ্টা করুন।", variant: "destructive" });
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
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
    <div className="max-w-md mx-auto flex flex-col min-h-[calc(100vh-110px)]">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" asChild className="rounded-none border border-zinc-200 h-10 w-10 shrink-0">
          <Link href="/admin/accounts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-black uppercase tracking-tighter">দ্রুত বিক্রয়</h1>
      </div>

      {/* Search */}
      <div className="relative z-20 mb-3 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
          <Input
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={isListening ? "শুনছি..." : "পণ্য খুঁজুন বা মাইকে বলুন..."}
            className="pl-11 pr-20 h-14 text-base rounded-none border-zinc-200 bg-white"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchTerm && !isListening && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSearchResults([]);
                }}
                className="p-1.5 text-zinc-300"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            <button
              type="button"
              onClick={toggleVoiceSearch}
              className={cn(
                "p-1.5 rounded-full",
                isListening ? "text-red-600 animate-pulse" : "text-zinc-400"
              )}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 shadow-2xl max-h-[60vh] overflow-y-auto">
              {searchResults.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-zinc-50 border-b border-zinc-50 last:border-0 text-left"
                >
                  <div className="relative h-14 w-14 shrink-0 bg-zinc-50 border border-zinc-100">
                    {product.images?.[0] ? (
                      <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                    ) : (
                      <Package className="h-5 w-5 m-auto text-zinc-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{product.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-sm font-black text-orange-600">৳{product.price}</span>
                      <span className={cn("text-xs", product.stock <= 5 ? "text-red-600 font-bold" : "text-zinc-400")}>
                        স্টক: {product.stock}
                      </span>
                    </div>
                  </div>
                  <Plus className="h-5 w-5 text-zinc-300 shrink-0" />
                </button>
              ))}
            </div>
          )}
          {isSearching && <p className="text-xs text-zinc-400 mt-1">খোঁজা হচ্ছে...</p>}
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-14 w-14 shrink-0 rounded-none border-zinc-200 bg-white p-0"
          onClick={() => setScannerOpen(true)}
        >
          <ScanBarcode className="h-6 w-6" />
        </Button>
      </div>

      <BarcodeScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScan={handleScan}
        title="বারকোড স্কান করুন"
        description="পণ্যের বারকোডের দিকে ক্যামেরা তাক করুন।"
      />

      {/* Cart */}
      <div className="flex-1 overflow-y-auto">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-zinc-300 border-2 border-dashed border-zinc-100 py-16">
            <Package className="h-10 w-10 mb-2 opacity-40" />
            <p className="text-xs font-bold uppercase tracking-widest">পণ্য খুঁজে যুক্ত করুন</p>
          </div>
        ) : (
          <div className="space-y-2">
            {cart.map((item) => {
              const lineTotal = calculateLineTotal(item);
              const effectiveUnitPrice = lineTotal / item.quantity;
              const belowCost = item.buyPrice > 0 && effectiveUnitPrice < item.buyPrice;
              return (
                <div key={item.id} className="bg-white border border-zinc-200 p-3 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 shrink-0 bg-zinc-50 border border-zinc-100">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <Package className="h-5 w-5 m-auto text-zinc-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{item.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[11px] text-zinc-400">ক্রয়: ৳{item.buyPrice || "—"}</span>
                        <span className="text-[11px] text-zinc-500 font-bold">বিক্রয়: ৳{item.price}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 shrink-0" onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="outline" size="icon" className="h-9 w-9 rounded-none" onClick={() => updateQuantity(item.id, -1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-black">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-9 w-9 rounded-none" onClick={() => updateQuantity(item.id, 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <div className="flex border border-zinc-200 overflow-hidden">
                        <button
                          onClick={() => updateDiscount(item.id, item.discount, "flat")}
                          className={cn("px-2 py-2 text-[10px] font-black", item.discountType === "flat" ? "bg-black text-white" : "text-zinc-400")}
                        >
                          ৳
                        </button>
                        <button
                          onClick={() => updateDiscount(item.id, item.discount, "percent")}
                          className={cn("px-2 py-2 text-[10px] font-black border-l border-zinc-200", item.discountType === "percent" ? "bg-black text-white" : "text-zinc-400")}
                        >
                          %
                        </button>
                      </div>
                      <Input
                        type="number"
                        value={item.discount || ""}
                        placeholder="ছাড়"
                        onChange={(e) => updateDiscount(item.id, Number(e.target.value) || 0)}
                        className="h-9 w-16 rounded-none border-zinc-200 text-right font-bold px-2"
                      />
                    </div>
                  </div>
                  <div className={cn("flex items-center justify-between pt-1", belowCost && "text-red-600")}>
                    {belowCost ? (
                      <p className="flex items-center gap-1 text-[11px] font-bold">
                        <AlertTriangle className="h-3 w-3" /> ক্রয়মূল্যের চেয়ে কম দামে বিক্রি হচ্ছে
                      </p>
                    ) : (
                      <span />
                    )}
                    <span className={cn("text-sm font-black", belowCost ? "text-red-600" : "text-orange-600")}>
                      = ৳{lineTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Payment method */}
        <div className="flex gap-2 mt-4">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.value}
              onClick={() => setPaymentMethod(m.value)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 border font-bold text-xs rounded-none",
                paymentMethod === m.value ? "bg-black text-white border-black" : "bg-white border-zinc-200 text-zinc-600"
              )}
            >
              <m.icon className="h-3.5 w-3.5" />
              {m.label}
            </button>
          ))}
        </div>

        {/* spacer so content isn't hidden behind sticky bar */}
        <div className="h-24" />
      </div>

      {/* Sticky checkout bar */}
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-3 -mx-4 px-4 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase text-zinc-400">মোট</span>
          <span className="text-3xl font-black text-orange-600">৳{total.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-zinc-500 shrink-0">প্রাপ্ত টাকা</span>
          <Input
            type="number"
            value={receivedTouched ? receivedAmount : total}
            onChange={(e) => {
              setReceivedTouched(true);
              setReceivedAmount(e.target.value);
            }}
            className="h-10 w-28 rounded-none border-zinc-200 text-right font-bold"
          />
        </div>

        {/* Customer name & phone */}
        <div className="space-y-1.5">
          <Input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder={dueAmount > 0 ? "কাস্টমারের নাম (আবশ্যক, বাকি আছে)" : "কাস্টমারের নাম (ঐচ্ছিক)"}
            className={cn("h-10 rounded-none border-zinc-200 bg-white text-sm", dueAmount > 0 && !customerName.trim() && "border-red-300")}
          />
          <Input
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder={dueAmount > 0 ? "ফোন নাম্বার (আবশ্যক, বাকি আছে)" : "ফোন নাম্বার (ঐচ্ছিক)"}
            className={cn("h-10 rounded-none border-zinc-200 bg-white text-sm", dueAmount > 0 && !customerPhone.trim() && "border-red-300")}
          />
          {recentCustomers.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              {recentCustomers.map((c) => (
                <button
                  key={`${c.name}-${c.mobile}`}
                  onClick={() => {
                    setCustomerName(c.name);
                    setCustomerPhone(c.mobile || "");
                  }}
                  className={cn(
                    "shrink-0 px-2.5 py-1 text-[11px] font-bold border rounded-none whitespace-nowrap",
                    customerName === c.name ? "bg-black text-white border-black" : "bg-white border-zinc-200 text-zinc-600"
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {dueAmount > 0 && (
          <div className="flex items-center justify-between bg-red-50 border border-red-200 px-3 py-1.5">
            <span className="flex items-center gap-1 text-xs font-bold text-red-600">
              <AlertTriangle className="h-3.5 w-3.5" /> বাকি থাকবে
            </span>
            <span className="text-sm font-black text-red-600">৳{dueAmount.toLocaleString()}</span>
          </div>
        )}
        <Button
          className="w-full h-16 rounded-none bg-black hover:bg-zinc-800 text-white text-base font-black uppercase gap-2"
          disabled={cart.length === 0 || isPending}
          onClick={handleComplete}
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
          বিক্রি সম্পন্ন করুন
        </Button>
      </div>
    </div>
  );
}
