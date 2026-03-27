"use client";

import { useState, useTransition, useEffect } from "react";
import { Search, Plus, Minus, Trash2, User, Phone, CheckCircle, Package, ArrowLeft, Loader2, CreditCard, Banknote, Smartphone, X, Mail, MapPin, Truck, Globe, Store, Percent } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { searchProducts, createOrderManual, validateCoupon } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface POSItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  buyPrice: number;
  quantity: number;
  stock: number;
  discount: number;
  discountType: 'flat' | 'percent';
  image?: string;
}

import { DistrictSelect } from "@/components/district-select";

export function POSSystem() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState<'all' | 'sku'>('all');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [cart, setCart] = useState<POSItem[]>([]);
  const [orderSource, setOrderSource] = useState<'local' | 'online'>('local');
  const [customer, setCustomer] = useState({ 
    name: "", 
    mobile: "", 
    email: "", 
    address: "", 
    district: "Gaibandha",
    deliveryFee: 0 
  });
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash' | 'nagad' | 'pos' | 'other'>('cash');
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [total, setTotal] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const router = useRouter();

  const handleSearch = async (val: string, mode: 'all' | 'sku' = searchBy) => {
    setSearchTerm(val);
    if (val.length < 1) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchProducts(val, 8, mode);
      setSearchResults(results);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const addToCart = (product: any) => {
    if (product.stock <= 0) {
      toast.error("Product out of stock");
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error("Cannot add more than available stock");
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { 
        id: product.id, 
        name: product.name, 
        price: Number(product.price), 
        originalPrice: Number(product.originalPrice || product.price),
        buyPrice: Number(product.buyPrice || 0),
        quantity: 1, 
        stock: product.stock,
        discount: 0,
        discountType: 'flat',
        image: product.images?.[0]
      }];
    });
    setSearchTerm("");
    setSearchResults([]);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        if (newQty > item.stock) {
          toast.error("Insufficient stock");
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const updateDiscount = (id: string, amount: number, type?: 'flat' | 'percent') => {
    setCart(prev => prev.map(item => 
      item.id === id ? { 
        ...item, 
        discount: Math.max(0, amount),
        discountType: type || item.discountType 
      } : item
    ));
  };

  const calculateItemTotal = (item: POSItem) => {
    const base = item.price * item.quantity;
    if (item.discountType === 'percent') {
      return base - (base * (item.discount / 100));
    }
    return base - (item.discount || 0);
  };

  useEffect(() => {
    const subtotal = cart.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    const shipping = orderSource === 'online' ? Number(customer.deliveryFee || 0) : 0;
    
    // Recalculate coupon discount if needed
    if (appliedCoupon) {
      if (subtotal < Number(appliedCoupon.minOrderAmount)) {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        toast.error("Coupon removed: subtotal below minimum");
      } else {
        let discount = 0;
        if (appliedCoupon.discountType === 'percentage') {
          discount = (subtotal * Number(appliedCoupon.discountValue)) / 100;
          if (appliedCoupon.maxDiscountAmount && discount > Number(appliedCoupon.maxDiscountAmount)) {
            discount = Number(appliedCoupon.maxDiscountAmount);
          }
        } else {
          discount = Number(appliedCoupon.discountValue);
        }
        setCouponDiscount(discount);
      }
    } else {
      setCouponDiscount(0);
    }
    
    setTotal(Math.max(0, subtotal + shipping - couponDiscount));
  }, [cart, customer.deliveryFee, orderSource, appliedCoupon, couponDiscount]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    const subtotal = cart.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    const result = await validateCoupon(couponCode, subtotal);
    
    if (result.success) {
      setAppliedCoupon(result.coupon);
      setCouponDiscount(result.discount || 0);
      toast.success("Coupon applied!");
    } else {
      toast.error(result.message || "Invalid coupon");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Basket is empty");
      return;
    }

    if (orderSource === 'online' && (!customer.address || !customer.mobile || !customer.name)) {
        toast.error("Online orders require Name, Mobile, and Address");
        return;
    }

    startTransition(async () => {
      const result = await createOrderManual({
        customerName: customer.name,
        customerMobile: customer.mobile,
        customerEmail: customer.email,
        customerAddress: customer.address,
        customerDistrict: customer.district,
        deliveryFee: customer.deliveryFee,
        paymentMethod,
        items: cart,
        orderSource: orderSource,
        couponId: appliedCoupon?.id,
        discountAmount: couponDiscount,
      });

      if (result.success) {
        toast.success(`Success! Order #${result.orderNumber} created.`);
        router.push(`/admin/orders`);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-4 relative">
      <div className="flex items-center gap-3 relative z-[100]">
        <Button variant="ghost" size="icon" asChild className="rounded-none border border-zinc-200 h-10 w-10">
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-black uppercase tracking-tighter">New Order</h1>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Main Column: Current Basket */}
        <div className="lg:col-span-12 xl:col-span-8 flex flex-col min-h-0">
          <Card className="rounded-none border-zinc-200 flex flex-col min-h-0 flex-1">
            <div className="px-4 border-b border-zinc-100 space-y-4">
               <div className="flex gap-2 relative">
                  <div className="relative flex-1 group/search">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input 
                      type="text"
                      placeholder={searchBy === 'sku' ? "Add by SKU..." : "Add products to basket..."}
                      className="!pl-8 !pr-8 !h-9 rounded-none border-zinc-200 text-sm focus-visible:ring-black px-4 bg-white"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                    {searchTerm && (
                      <button 
                        onClick={() => { setSearchTerm(""); setSearchResults([]); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-black"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}

                    {/* FLOATING RESULTS OVERLAY */}
                    {searchResults.length > 0 && (
                      <Card className="absolute top-full left-0 right-0 mt-1 rounded-none border-zinc-200 shadow-2xl max-h-[400px] overflow-y-auto bg-white py-1 z-[200]">
                         {searchResults.map((product) => (
                            <div 
                              key={product.id} 
                              className="p-2 hover:bg-zinc-50 cursor-pointer flex items-center gap-3 border-b border-zinc-50 last:border-0"
                              onClick={() => { addToCart(product); setSearchTerm(""); setSearchResults([]); }}
                            >
                              <div className="relative h-12 w-12 shrink-0 bg-zinc-50 border border-zinc-100">
                                {product.images?.[0] ? <Image src={product.images[0]} alt={product.name} fill className="object-cover" /> : <Package className="h-4 w-4 m-auto" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-black uppercase tracking-tight truncate">{product.name}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[9px] font-bold text-zinc-400">SKU: {product.sku}</span>
                                  <span className="text-[10px] font-black text-[#ff5a00]">Tk {product.price}</span>
                                  <span className={cn("text-[10px] font-black", product.stock <= 5 ? "text-red-600" : "text-zinc-500 underline decoration-zinc-200")}>Stock: {product.stock}</span>
                                  {product.originalPrice && <span className="text-[9px] font-bold text-zinc-400 line-through">Reg: {product.originalPrice}</span>}
                                  {product.buyPrice && <span className="text-[9px] font-bold text-emerald-600">Buy: {product.buyPrice}</span>}
                                </div>
                              </div>
                              <Plus className="h-4 w-4 text-zinc-200 mr-2" />
                            </div>
                         ))}
                      </Card>
                    )}
                  </div>

                  <Select value={searchBy} onValueChange={(val: any) => setSearchBy(val)}>
                    <SelectTrigger className="w-[80px] h-9 rounded-none border-zinc-200 font-black text-[10px] uppercase bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-zinc-200">
                      <SelectItem value="all" className="text-[10px] font-black uppercase">Name</SelectItem>
                      <SelectItem value="sku" className="text-[10px] font-black uppercase">SKU</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-200 border-2 border-dashed border-zinc-50">
                  <Package className="h-12 w-12 mb-2 opacity-10" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Add products from search overlay</p>
                </div>
              ) : (
                <div className="space-y-4">
                   {cart.map((item) => (
                    <div key={item.id} className="group border-b border-zinc-100 last:border-0 pb-4">
                      <div className="flex gap-4 items-center">
                        <div className="relative h-16 w-16 shrink-0 bg-zinc-50 border border-zinc-100 overflow-hidden">
                          {item.image ? <Image src={item.image} alt={item.name} fill className="object-cover" /> : <Package className="h-6 w-6 m-auto text-zinc-200" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-xs font-black uppercase tracking-tight truncate max-w-[300px]">{item.name}</p>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeFromCart(item.id)}>
                               <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                               <Button variant="outline" size="icon" className="h-8 w-8 rounded-none border-zinc-200" onClick={() => updateQuantity(item.id, -1)}>
                                  <Minus className="h-4 w-4" />
                               </Button>
                               <span className="text-sm font-black w-8 text-center">{item.quantity}</span>
                               <Button variant="outline" size="icon" className="h-8 w-8 rounded-none border-zinc-200" onClick={() => updateQuantity(item.id, 1)}>
                                  <Plus className="h-4 w-4" />
                               </Button>
                            </div>
                            <div className="flex items-center gap-6 text-right">
                               <div>
                                  <p className="text-[8px] font-black uppercase text-zinc-400">Unit Price</p>
                                  <p className="text-xs font-black">Tk {item.price}</p>
                               </div>
                               <div className="w-24">
                                  <p className="text-[8px] font-black uppercase text-zinc-400">Line Total</p>
                                  <p className="text-sm font-black text-[#ff5a00]">Tk {calculateItemTotal(item)}</p>
                                  {item.discount > 0 && <p className="text-[10px] font-bold text-zinc-300 line-through">Tk {item.price * item.quantity}</p>}
                               </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 bg-zinc-50/50 p-2 border border-transparent group-hover:border-zinc-100">
                         <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase text-zinc-400">Mode:</span>
                            <div className="flex border border-zinc-200 overflow-hidden bg-white">
                               <button onClick={() => updateDiscount(item.id, item.discount, 'flat')} className={cn("text-[9px] px-2.5 py-1 font-black", item.discountType === 'flat' ? "bg-black text-white" : "text-zinc-400")}>TK</button>
                               <button onClick={() => updateDiscount(item.id, item.discount, 'percent')} className={cn("text-[9px] px-2.5 py-1 font-black border-l border-zinc-200", item.discountType === 'percent' ? "bg-black text-white" : "text-zinc-400")}>%</button>
                            </div>
                         </div>
                         <div className="relative">
                            <Input type="number" value={item.discount || ""} onChange={(e) => updateDiscount(item.id, Number(e.target.value))} className="h-8 w-24 text-xs font-black pr-8 rounded-none border-zinc-200 text-right focus:ring-0" />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-300">{item.discountType === 'percent' ? '%' : 'Tk'}</span>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Sidebar: User Info & Checkout */}
        <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-4 min-h-0">
          <Card className="rounded-none border-zinc-200 p-5 flex flex-col min-h-0 bg-white shadow-sm overflow-y-auto custom-scrollbar h-full">
             <div className="space-y-6">
                <div>
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-[#ff5a00] mb-4 border-b border-zinc-50 pb-2 flex items-center gap-2">
                      <User className="h-3 w-3" /> Customer Details
                   </h4>
                   <div className="space-y-4">
                      <Tabs 
                        value={orderSource} 
                        onValueChange={(val: any) => setOrderSource(val)}
                        className="w-full"
                      >
                        <TabsList className="grid grid-cols-2 rounded-none h-10 bg-zinc-100 p-1">
                          <TabsTrigger value="local" className="rounded-none h-8 text-[10px] font-black uppercase flex gap-2">
                            <Store className="h-3 w-3" /> Offline
                          </TabsTrigger>
                          <TabsTrigger value="online" className="rounded-none h-8 text-[10px] font-black uppercase flex gap-2">
                            <Globe className="h-3 w-3" /> Online
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>

                      <div className="space-y-3">
                        <Input placeholder="Full Name" className="h-10 rounded-none border-zinc-200 text-sm" value={customer.name} onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))} />
                        <Input placeholder="Mobile Number" className="h-10 rounded-none border-zinc-200 text-sm" value={customer.mobile} onChange={(e) => setCustomer(prev => ({ ...prev, mobile: e.target.value }))} />
                      </div>
                      
                      {orderSource === 'online' && (
                        <div className="space-y-3 pt-2">
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                            <Input placeholder="Email Address (Optional)" className="pl-9 h-10 rounded-none border-zinc-200 text-sm" value={customer.email} onChange={(e) => setCustomer(prev => ({ ...prev, email: e.target.value }))} />
                          </div>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-3.5 w-3.5 text-zinc-400" />
                            <Textarea placeholder="Full Delivery Address" className="pl-9 min-h-[80px] rounded-none border-zinc-200 text-sm" value={customer.address} onChange={(e) => setCustomer(prev => ({ ...prev, address: e.target.value }))} />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <DistrictSelect value={customer.district} onChange={(val) => setCustomer(prev => ({ ...prev, district: val }))} />
                            <div className="relative">
                              <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                              <Input type="number" placeholder="Delivery Fee" className="pl-9 h-10 rounded-none border-zinc-200 text-sm" value={customer.deliveryFee || ""} onChange={(e) => setCustomer(prev => ({ ...prev, deliveryFee: Number(e.target.value) }))} />
                            </div>
                          </div>
                        </div>
                      )}
                   </div>
                </div>

                <div className="space-y-4 pt-2 border-t border-zinc-50">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                      <Percent className="h-3 w-3" /> Coupon Discount
                   </h4>
                   {appliedCoupon ? (
                     <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-2.5">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">{appliedCoupon.code}</span>
                          <span className="text-[9px] font-bold text-emerald-600 italic">Saved Tk {couponDiscount}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={removeCoupon} className="h-8 w-8 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800">
                          <X className="h-4 w-4" />
                        </Button>
                     </div>
                   ) : (
                     <div className="flex gap-1.5">
                       <Input 
                         placeholder="Enter Coupon Code" 
                         value={couponCode}
                         onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                         className="rounded-none border-zinc-200 h-10 font-black uppercase text-[10px] tracking-widest pl-3 bg-zinc-50/50" 
                       />
                       <Button 
                         type="button"
                         onClick={handleApplyCoupon}
                         disabled={!couponCode || cart.length === 0}
                         className="rounded-none bg-black text-white px-4 h-10 font-bold uppercase text-[9px] tracking-widest"
                       >
                         Apply
                       </Button>
                     </div>
                   )}
                </div>

                <div >
                   <h4 className=" text-[10px] font-black uppercase tracking-widest text-zinc-800 mb-4 border-b border-zinc-50 pb-2 flex items-center gap-2">
                      <CreditCard className="h-3 w-3" /> Payment Options
                   </h4>
                   <Select value={paymentMethod} onValueChange={(val: any) => setPaymentMethod(val)}>
                      <SelectTrigger className="w-full h-12 rounded-none border-zinc-200 font-black uppercase text-xs tracking-widest shadow-sm">
                        <SelectValue placeholder="Select Payment Method" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-zinc-200">
                        <SelectItem value="cash" className="text-xs font-black uppercase flex gap-2">
                           <div className="flex items-center gap-2">
                             <Banknote className="h-4 w-4 text-emerald-600" /> 
                             {orderSource === 'online' ? 'Cash on Delivery' : 'Cash'}
                           </div>
                        </SelectItem>
                        <SelectItem value="bkash" className="text-xs font-black uppercase">
                           <div className="flex items-center gap-2">
                             <Smartphone className="h-4 w-4 text-pink-600" /> bKash
                           </div>
                        </SelectItem>
                        <SelectItem value="nagad" className="text-xs font-black uppercase text-orange-600">
                           <div className="flex items-center gap-2">
                             <Smartphone className="h-4 w-4" /> Nagad
                           </div>
                        </SelectItem>
                        <SelectItem value="pos" className="text-xs font-black uppercase">
                           <div className="flex items-center gap-2">
                             <CreditCard className="h-4 w-4 text-blue-600" /> Card / POS
                           </div>
                        </SelectItem>
                        <SelectItem value="other" className="text-xs font-black uppercase">
                           <div className="flex items-center gap-2">
                             <Plus className="h-4 w-4 text-zinc-400" /> Other / Mixed
                           </div>
                        </SelectItem>
                      </SelectContent>
                   </Select>
                </div>

                <div className="pt-6 border-t-4 border-double border-zinc-100 mt-auto">
                   <div className="flex justify-between items-end mb-1">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Grand Total</span>
                        {couponDiscount > 0 && (
                          <span className="text-[9px] font-black uppercase text-emerald-600">Discount: -Tk {couponDiscount}</span>
                        )}
                      </div>
                      <span className="text-4xl font-black tracking-tighter text-[#ff5a00]">Tk {total}</span>
                   </div>
                   {orderSource === 'online' && customer.deliveryFee > 0 && (
                     <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest text-right">Includes Tk {customer.deliveryFee} Delivery Fee</p>
                   )}
                   
                   <Button 
                     className="w-full h-16 bg-black hover:bg-zinc-800 text-white rounded-none font-black uppercase text-xs tracking-widest gap-3 mt-6 shadow-xl shadow-zinc-200"
                     disabled={cart.length === 0 || isPending}
                     onClick={handleCheckout}
                   >
                     {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                     {orderSource === 'local' ? 'Finalize Order' : 'Generate Online Order'}
                   </Button>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
