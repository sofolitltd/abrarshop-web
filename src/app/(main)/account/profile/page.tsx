"use client";

import { useAuth } from "@/context/auth-context";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Package, User, ShoppingBag, Loader2 } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { updateUserProfile } from "@/lib/actions";
import { LogoutButton } from "@/components/account/logout-button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
    const { user, profile, loading } = useAuth();
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
        if (!loading && !user) {
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
    }, [user, profile, loading, router]);

    if (loading) return null;
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
                <h1 className="text-2xl font-bold tracking-tight font-headline mt-4 uppercase">
                    Profile Settings
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-1">
                    <Link href="/account" className="flex items-center gap-3 px-4 py-3 border border-zinc-100 hover:bg-zinc-50 font-bold uppercase text-xs tracking-widest transition-colors">
                        <ShoppingBag className="h-4 w-4" />
                        Dashboard
                    </Link>
                    <Link href="/account/orders" className="flex items-center gap-3 px-4 py-3 border border-zinc-100 hover:bg-zinc-50 font-bold uppercase text-xs tracking-widest transition-colors">
                        <Package className="h-4 w-4" />
                        My Orders
                    </Link>
                    <Link href="/account/profile" className="flex items-center gap-3 px-4 py-3 bg-black text-white font-bold uppercase text-xs tracking-widest">
                        <User className="h-4 w-4" />
                        Profile Settings
                    </Link>
                    <LogoutButton />
                </div>

                <div className="md:col-span-2">
                    <div className="border border-zinc-200 bg-white p-6 md:p-8">
                        <h2 className="text-lg font-bold font-headline uppercase mb-6 pb-2 border-b border-zinc-100">Personal Information</h2>
                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName" className="text-xs font-bold uppercase text-zinc-500">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="rounded-none border-zinc-200 focus-visible:ring-orange-500"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName" className="text-xs font-bold uppercase text-zinc-500">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="rounded-none border-zinc-200 focus-visible:ring-orange-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs font-bold uppercase text-zinc-500 hover:cursor-not-allowed">Email Address</Label>
                                    <Input
                                        id="email"
                                        value={user.email || ""}
                                        disabled
                                        className="rounded-none border-zinc-100 bg-zinc-50 text-zinc-400 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber" className="text-xs font-bold uppercase text-zinc-500">Phone Number</Label>
                                    <Input
                                        id="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        placeholder="017********"
                                        className="rounded-none border-zinc-200 focus-visible:ring-orange-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="district" className="text-xs font-bold uppercase text-zinc-500">District</Label>
                                    <Input
                                        id="district"
                                        value={formData.district}
                                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                        placeholder="e.g. Gaibandha"
                                        className="rounded-none border-zinc-200 focus-visible:ring-orange-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-xs font-bold uppercase text-zinc-500">Full Shipping Address</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="House #, Road #, Area..."
                                    className="rounded-none border-zinc-200 focus-visible:ring-orange-500"
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={isUpdating} className="px-12 py-6 bg-black hover:bg-zinc-900 rounded-none font-bold uppercase tracking-widest text-white">
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
