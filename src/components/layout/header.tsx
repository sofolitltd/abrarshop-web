"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { CartIcon } from "@/components/cart/cart-icon";
import { CartSheet } from "@/components/cart/cart-sheet";
import { useCart } from "@/context/cart-context";
import { SearchInput } from "./search-input";
import { User, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";

import { Category } from "@/lib/types";
import { TopBar } from "./top-bar";
import { MainNav } from "./main-nav";
import { MobileNav } from "./mobile-nav";

const SearchBarFallback = () => <Skeleton className="h-10 w-full" />;
const DesktopSearchBarFallback = () => <Skeleton className="h-10 w-full min-w-[350px]" />;

interface HeaderProps {
  categories?: Category[];
}

export function Header({ categories = [] }: HeaderProps) {
  const { isDrawerOpen, setDrawerOpen } = useCart();
  const { user } = useAuth();
  const [isMobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full flex flex-col">
      <TopBar />
      <div className="w-full border-b border-zinc-800 bg-black text-white">
        <div className="container flex h-16 items-center">

          {/* Mobile Header */}
          <div className="flex w-full items-center justify-between md:hidden h-full py-4">
            {/* Left side: Menu + Logo */}
            <div className="flex items-center gap-2">
              <MobileNav categories={categories} />
              <Link href="/" className="inline-block">
                <span className="text-xl font-bold font-headline tracking-tighter text-white">
                  ABRAR<span className="text-orange-500"> SHOP</span>
                </span>
              </Link>
            </div>

            {/* Right side: Search, Cart, Profile */}
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="icon" className="rounded-none bg-zinc-900 text-white hover:text-black" onClick={() => setMobileSearchOpen(p => !p)}>
                <Search className={cn("h-5 w-5", isMobileSearchOpen && "text-orange-500")} />
                <span className="sr-only">Toggle Search</span>
              </Button>
              <CartIcon onClick={() => setDrawerOpen(true)} className="text-white bg-zinc-900 hover:text-black" />
              <Button variant="ghost" size="icon" className="rounded-none bg-zinc-900 text-white hover:text-black" asChild>
                <Link href={user ? "/account" : "/login"} aria-label="Login or view account">
                  <User className={cn("h-5 w-5", user && "text-orange-500")} />
                </Link>
              </Button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden w-full items-center justify-between md:flex h-full">
            <Link href="/" className="inline-block hover:opacity-90 transition-opacity mr-12">
              <span className="text-3xl font-bold font-headline tracking-tighter text-white">
                ABRAR<span className="text-orange-500">{" "}SHOP</span>
              </span>
            </Link>

            <div className="flex-1 max-w-2xl mx-12">
              <Suspense fallback={<DesktopSearchBarFallback />}>
                <SearchInput />
              </Suspense>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" className="rounded-none bg-zinc-900 text-white hover:text-black gap-2" asChild>
                <Link href={user ? "/account" : "/login"} aria-label="Login or view account">
                  <User className={cn("h-8 w-8", user && "text-orange-500")} />
                  <div className="flex flex-col items-start hidden lg:flex">
                    <span className="text-[10px] uppercase text-zinc-400 leading-none">Account</span>
                    <span className="text-sm font-bold leading-none">{user ? 'My Profile' : 'Login / Register'}</span>
                  </div>
                </Link>
              </Button>

              <div onClick={() => setDrawerOpen(true)} className="flex items-center bg-zinc-900 gap-2 cursor-pointer hover:bg-zinc-900  transition-colors">
                <CartIcon className="text-white" />
              </div>
            </div>
          </div>

        </div>
      </div>

      <MainNav categories={categories} />

      {isMobileSearchOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-black">
          <div className="container py-3">
            <Suspense fallback={<SearchBarFallback />}>
              <SearchInput />
            </Suspense>
          </div>
        </div>
      )}

      <CartSheet open={isDrawerOpen} onOpenChange={setDrawerOpen} />
    </header>
  );
}
