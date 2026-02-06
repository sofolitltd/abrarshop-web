"use client";

import { useAuth } from "@/context/auth-context";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { updateUserProfile } from "@/lib/actions";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountNav } from "@/components/account/account-nav";

export default function ProfilePage() {
    const { user, profile, loading: authLoading } = useAuth();
    const router = useRouter();
    const [isUpdating, setIsUpdating] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        address: "",
        district: "",
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
        if (profile) {
            setFormData({
                firstName: profile.firstName || "",
                lastName: profile.lastName || "",
                phoneNumber: profile.phoneNumber || "",
                address: profile.address || "",
                district: profile.district || "",
            });
        }
    }, [user, profile, authLoading, router]);

    if (authLoading) {
        return (
            <div className="container mx-auto pt-4 pb-20 px-4">
                <div className="mb-6">
                    <Skeleton className="h-4 w-32 mb-4" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-1 lg:col-span-2 space-y-1">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                    </div>
                    <div className="md:col-span-11 lg:col-span-10">
                        <Skeleton className="h-[500px] w-full" />
                    </div>
                </div>
            </div>
        );
    }
    if (!user) return null;

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const result = await updateUserProfile(user.uid, formData);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to update profile.");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="container mx-auto pt-4 pb-20 px-4">
            <div className="mb-6">
                <Breadcrumb
                    items={[
                        { name: "Home", href: "/" },
                        { name: "Account", href: "/account" },
                        { name: "Profile", href: "/account/profile" }
                    ]}
                />
                <h1 className="text-2xl font-bold tracking-tight font-headline mt-4 uppercase text-black">
                    Profile Settings
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <AccountNav />

                <div className="md:col-span-11 lg:col-span-10">
                    <div className="border border-zinc-200 bg-white p-6 md:p-10 shadow-sm">
                        <div className="mb-8 pb-4 border-b border-zinc-100">
                            <h2 className="text-lg font-black font-headline uppercase">Personal Information</h2>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Update your delivery and contact details</p>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label htmlFor="firstName" className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="h-12 rounded-none border-zinc-200 focus-visible:ring-black font-medium"
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="lastName" className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="h-12 rounded-none border-zinc-200 focus-visible:ring-black font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-3">
                                    <Label htmlFor="email" className="text-[10px] font-black uppercase text-zinc-400 tracking-widest hover:cursor-not-allowed">Email Address</Label>
                                    <Input
                                        id="email"
                                        value={user.email || ""}
                                        disabled
                                        className="h-12 rounded-none border-zinc-100 bg-zinc-50 text-zinc-400 cursor-not-allowed font-medium"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label htmlFor="phoneNumber" className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Phone Number</Label>
                                    <Input
                                        id="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        placeholder="017********"
                                        className="h-12 rounded-none border-zinc-200 focus-visible:ring-black font-medium"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="district" className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">District</Label>
                                    <Input
                                        id="district"
                                        value={formData.district}
                                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                        placeholder="e.g. Gaibandha"
                                        className="h-12 rounded-none border-zinc-200 focus-visible:ring-black font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="address" className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Full Shipping Address</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="House #, Road #, Area..."
                                    className="h-12 rounded-none border-zinc-200 focus-visible:ring-black font-medium"
                                />
                            </div>

                            <div className="flex justify-end pt-4 border-t border-zinc-50">
                                <Button type="submit" disabled={isUpdating} className="h-14 px-12 bg-black hover:bg-zinc-800 rounded-none font-black uppercase tracking-widest text-[11px] text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all">
                                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
