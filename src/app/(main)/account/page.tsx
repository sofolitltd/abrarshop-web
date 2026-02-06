"use client";

import { useAuth } from "@/context/auth-context";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Package, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountNav } from "@/components/account/account-nav";

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
            <div className="container mx-auto pt-4 pb-20 px-4">
                <div className="mb-6">
                    <Skeleton className="h-4 w-32 mb-4" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-1 lg:col-span-2 space-y-1">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                    </div>
                    <div className="md:col-span-11 lg:col-span-10 space-y-6">
                        <Skeleton className="h-40 w-full" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    </div>
                </div>
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
                <h1 className="text-2xl font-bold tracking-tight font-headline mt-4 uppercase text-black">
                    My Account
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <AccountNav />

                {/* Dashboard Content */}
                <div className="md:col-span-11 lg:col-span-10 space-y-6">
                    <div className="border border-zinc-200 p-8 bg-zinc-50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <User className="h-32 w-32 -mr-10 -mt-10" />
                        </div>
                        <h2 className="text-xl font-bold font-headline uppercase mb-2 relative z-10">Welcome, {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : user.email}!</h2>
                        <p className="text-sm text-zinc-600 relative z-10 max-w-2xl">
                            From your account dashboard you can view your <Link href="/account/orders" className="text-orange-600 font-bold underline underline-offset-4 decoration-2">recent orders</Link>, manage your <Link href="/account/profile" className="text-orange-600 font-bold underline underline-offset-4 decoration-2">shipping and billing addresses</Link>, and edit your password and account details.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href="/account/orders" className="border border-zinc-200 p-8 hover:border-black transition-all group bg-white hover:shadow-xl">
                            <Package className="h-10 w-10 mb-6 group-hover:text-orange-600 transition-colors" />
                            <h3 className="font-bold uppercase tracking-widest text-xs">Recent Orders</h3>
                            <p className="text-[10px] text-zinc-500 mt-2 font-medium uppercase tracking-tight">Check your order status and history</p>
                        </Link>
                        <Link href="/account/profile" className="border border-zinc-200 p-8 hover:border-black transition-all group bg-white hover:shadow-xl">
                            <User className="h-10 w-10 mb-6 group-hover:text-orange-600 transition-colors" />
                            <h3 className="font-bold uppercase tracking-widest text-xs">Account Details</h3>
                            <p className="text-[10px] text-zinc-500 mt-2 font-medium uppercase tracking-tight">Update your profile and addresses</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
