"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, Search, Trash2, Edit2, Percent, Calendar, DollarSign, History, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from "@/lib/actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "0",
    maxDiscountAmount: "",
    usageLimit: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  const fetchCoupons = async () => {
    const data = await getCoupons();
    setCoupons(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = editingCoupon 
        ? await updateCoupon(editingCoupon.id, formData)
        : await createCoupon(formData);

      if (result.success) {
        toast.success(editingCoupon ? "Coupon updated" : "Coupon created");
        setIsDialogOpen(false);
        setEditingCoupon(null);
        setFormData({
          code: "",
          discountType: "percentage",
          discountValue: "",
          minOrderAmount: "0",
          maxDiscountAmount: "",
          usageLimit: "",
          startDate: "",
          endDate: "",
          isActive: true,
        });
        fetchCoupons();
      } else {
        toast.error("Failed to save coupon");
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    const result = await deleteCoupon(id);
    if (result.success) {
      toast.success("Coupon deleted");
      fetchCoupons();
    } else {
      toast.error("Failed to delete coupon");
    }
  };

  const handleEdit = (coupon: any) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minOrderAmount: coupon.minOrderAmount.toString(),
      maxDiscountAmount: coupon.maxDiscountAmount?.toString() || "",
      usageLimit: coupon.usageLimit?.toString() || "",
      startDate: coupon.startDate ? format(new Date(coupon.startDate), "yyyy-MM-dd") : "",
      endDate: coupon.endDate ? format(new Date(coupon.endDate), "yyyy-MM-dd") : "",
      isActive: coupon.isActive,
    });
    setIsDialogOpen(true);
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Coupon Management</h1>
          <p className="text-sm text-zinc-500 font-bold uppercase tracking-tight">Create and manage shop discounts</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCoupon(null)} className="rounded-none bg-black text-white px-6 font-bold uppercase tracking-widest text-xs h-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none transition-all">
              <Plus className="mr-2 h-4 w-4" /> New Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-none border-zinc-200 sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-tighter">
                {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateOrUpdate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-400">Coupon Code</label>
                <Input 
                  placeholder="e.g. SUMMER25" 
                  className="rounded-none border-zinc-200 h-12 uppercase font-black"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400">Type</label>
                  <Select value={formData.discountType} onValueChange={(val) => setFormData({ ...formData, discountType: val })}>
                    <SelectTrigger className="rounded-none border-zinc-200 h-12 font-black uppercase text-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-zinc-200">
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (Tk)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400">Value</label>
                  <Input 
                    type="number"
                    placeholder="e.g. 10" 
                    className="rounded-none border-zinc-200 h-12 font-black"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400">Min Order (Tk)</label>
                  <Input 
                    type="number"
                    className="rounded-none border-zinc-200 h-12 font-black"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400">Max Discount (Tk)</label>
                  <Input 
                    type="number"
                    placeholder="Optional"
                    className="rounded-none border-zinc-200 h-12 font-black"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400">Usage Limit</label>
                  <Input 
                    type="number"
                    placeholder="Infinite if empty"
                    className="rounded-none border-zinc-200 h-12 font-black"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400">Status</label>
                  <Select value={formData.isActive ? "true" : "false"} onValueChange={(val) => setFormData({ ...formData, isActive: val === "true" })}>
                    <SelectTrigger className="rounded-none border-zinc-200 h-12 font-black uppercase text-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-zinc-200">
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400">Start Date</label>
                  <Input 
                    type="date"
                    className="rounded-none border-zinc-200 h-12 font-black"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400">End Date</label>
                  <Input 
                    type="date"
                    className="rounded-none border-zinc-200 h-12 font-black"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <Button type="submit" disabled={isPending} className="w-full h-14 bg-black text-white hover:bg-zinc-900 rounded-none font-black uppercase tracking-[0.2em] text-xs">
                {isPending ? "Saving..." : (editingCoupon ? "Update Coupon" : "Create Coupon")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input 
          className="pl-10 h-12 rounded-none border-zinc-200 bg-white" 
          placeholder="Filter by coupon code..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="p-12 text-center text-zinc-400 uppercase font-black text-xs tracking-widest bg-zinc-50 border-2 border-dashed">Loading coupons...</div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 uppercase font-black text-xs tracking-widest bg-zinc-50 border-2 border-dashed">No coupons found.</div>
        ) : (
          filteredCoupons.map((coupon) => (
            <Card key={coupon.id} className="rounded-none border-zinc-200 p-6 bg-white overflow-hidden relative group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 bg-zinc-50 rounded-none border border-zinc-100 flex flex-col items-center justify-center text-zinc-800">
                    <Percent className="h-5 w-5 mb-1" />
                    <span className="text-[10px] font-black uppercase">{coupon.discountType === 'percentage' ? '%' : 'Tk'}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black uppercase tracking-tighter">{coupon.code}</h3>
                      <Badge className={cn("rounded-none px-2 py-0 text-[9px] font-black uppercase tracking-widest", coupon.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-none" : "bg-red-50 text-red-700 border-red-100 shadow-none")}>
                        {coupon.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                       <div className="flex items-center gap-1 text-zinc-500">
                          <DollarSign className="h-3 w-3" />
                          <span className="text-[10px] font-bold uppercase">
                            {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `Tk ${coupon.discountValue} OFF`}
                          </span>
                       </div>
                       <div className="flex items-center gap-1 text-zinc-500">
                          <History className="h-3 w-3" />
                          <span className="text-[10px] font-bold uppercase italic">
                            Used {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ""} times
                          </span>
                       </div>
                       <div className="flex items-center gap-1 text-zinc-500">
                          <CheckCircle2 className="h-3 w-3" />
                          <span className="text-[10px] font-bold uppercase">Min Spend: Tk {coupon.minOrderAmount}</span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 border-l border-zinc-100 pl-6 h-full">
                  <div className="hidden xl:block">
                     <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-1">Validity</p>
                     <div className="flex items-center gap-2 text-[10px] font-black">
                        {coupon.startDate ? format(new Date(coupon.startDate), "MMM dd, yyyy") : "Anytime"}
                        <span className="text-zinc-300">→</span>
                        {coupon.endDate ? format(new Date(coupon.endDate), "MMM dd, yyyy") : "Forever"}
                     </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(coupon)} className="rounded-none border-zinc-200 h-10 w-10 hover:bg-[#ff5a00] hover:text-white hover:border-[#ff5a00] transition-all">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(coupon.id)} className="rounded-none border-zinc-200 h-10 w-10 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Background accent */}
              <div className="absolute right-0 top-0 h-full w-24 bg-zinc-50/30 -skew-x-12 translate-x-12 pointer-events-none" />
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
