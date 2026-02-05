"use client";

import { useAuth } from "@/context/auth-context";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogoutButton } from "@/components/account/logout-button";
import { Package, User, ShoppingBag } from "lucide-react";

export default function AccountPage() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="container mx-auto py-20 px-4 text-center">
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="container mx-auto pt-4 pb-20 px-4">
            <div className="mb-6">
                <Breadcrumb
                    items={[
                        { name: "Home", href: "/" },
                        { name: "Account", href: "/account" }
                    ]}
                />
                <h1 className="text-2xl font-bold tracking-tight font-headline mt-4 uppercase">
                    My Account
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sidebar/Navigation */}
                <div className="md:col-span-1 space-y-1">
                    <Link href="/account" className="flex items-center gap-3 px-4 py-3 bg-black text-white font-bold uppercase text-xs tracking-widest">
                        <ShoppingBag className="h-4 w-4" />
                        Dashboard
                    </Link>
                    <Link href="/account/orders" className="flex items-center gap-3 px-4 py-3 border border-zinc-100 hover:bg-zinc-50 font-bold uppercase text-xs tracking-widest transition-colors">
                        <Package className="h-4 w-4" />
                        My Orders
                    </Link>
                    <Link href="/account/profile" className="flex items-center gap-3 px-4 py-3 border border-zinc-100 hover:bg-zinc-50 font-bold uppercase text-xs tracking-widest transition-colors">
                        <User className="h-4 w-4" />
                        Profile Settings
                    </Link>
                    <LogoutButton />
                </div>

                {/* Dashboard Content */}
                <div className="md:col-span-2 space-y-6">
                    <div className="border border-zinc-200 p-8 bg-zinc-50">
                        <h2 className="text-xl font-bold font-headline uppercase mb-2">Welcome, {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : user.email}!</h2>
                        <p className="text-sm text-zinc-600">
                            From your account dashboard you can view your <Link href="/account/orders" className="text-orange-600 font-bold underline underline-offset-4">recent orders</Link>, manage your <Link href="/account/profile" className="text-orange-600 font-bold underline underline-offset-4">shipping and billing addresses</Link>, and edit your password and account details.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href="/account/orders" className="border border-zinc-200 p-6 hover:border-black transition-colors group">
                            <Package className="h-8 w-8 mb-4 group-hover:text-orange-600 transition-colors" />
                            <h3 className="font-bold uppercase tracking-tight text-sm">Recent Orders</h3>
                            <p className="text-xs text-zinc-500 mt-1">Check your order status and history</p>
                        </Link>
                        <Link href="/account/profile" className="border border-zinc-200 p-6 hover:border-black transition-colors group">
                            <User className="h-8 w-8 mb-4 group-hover:text-orange-600 transition-colors" />
                            <h3 className="font-bold uppercase tracking-tight text-sm">Account Details</h3>
                            <p className="text-xs text-zinc-500 mt-1">Update your profile and addresses</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
