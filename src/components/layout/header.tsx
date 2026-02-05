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

const navLinks = [
  { href: "/product", label: "Products" },
];

const SearchBarFallback = () => <Skeleton className="h-10 w-full" />;
const DesktopSearchBarFallback = () => <Skeleton className="h-10 w-full min-w-[350px]" />;

export function Header() {
  const { isDrawerOpen, setDrawerOpen } = useCart();
  const [isMobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black text-white">
      <div className="container flex h-16 items-center">

        {/* Mobile Header */}
        <div className="flex w-full items-center md:hidden h-full">
          <div className="flex-1 h-full flex items-center">
            <Link href="/" className="inline-block">
              <span className="text-xl font-bold font-headline tracking-tighter text-white">
                ABRAR<span className="text-orange-500">{" "}SHOP</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="rounded-none hover:bg-zinc-900 text-white hover:text-white" onClick={() => setMobileSearchOpen(p => !p)}>
              <Search className={cn("h-5 w-5", isMobileSearchOpen && "text-orange-500")} />
              <span className="sr-only">Toggle Search</span>
            </Button>
            <CartIcon onClick={() => setDrawerOpen(true)} className="text-white hover:bg-zinc-900 hover:text-white" />
            <Button variant="ghost" size="icon" className="rounded-none hover:bg-zinc-900 text-white hover:text-white" asChild>
              <Link href="/login" aria-label="Login or view account">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden w-full items-center justify-between md:flex h-full">
          <div className="flex items-center gap-8 h-full">
            <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
              <span className="text-2xl font-bold font-headline tracking-tighter text-white">
                ABRAR<span className="text-orange-500">{" "}SHOP</span>
              </span>
            </Link>
            <nav className="flex items-center gap-6 text-sm h-full">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={label}
                  href={href}
                  className="transition-colors hover:text-orange-500 text-zinc-400 font-medium"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-full min-w-[350px]">
              <Suspense fallback={<DesktopSearchBarFallback />}>
                <SearchInput />
              </Suspense>
            </div>
            <CartIcon onClick={() => setDrawerOpen(true)} className="text-white hover:bg-zinc-900 hover:text-white" />
            <Button variant="ghost" size="icon" className="rounded-none hover:bg-zinc-900 text-white hover:text-white" asChild>
              <Link href="/login" aria-label="Login or view account">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

      </div>

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
