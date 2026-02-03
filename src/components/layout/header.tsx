"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { CartIcon } from "@/components/cart/cart-icon";
import { CartSheet } from "@/components/cart/cart-sheet";
import { SearchInput } from "./search-input";
import { User, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const navLinks = [
  { href: "/products", label: "Products" },
];

const SearchBarFallback = () => <Skeleton className="h-10 w-full" />;
const DesktopSearchBarFallback = () => <Skeleton className="h-10 w-full min-w-[350px]" />;

export function Header() {
  const [isCartOpen, setCartOpen] = useState(false);
  const [isMobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">

        {/* Mobile Header */}
        <div className="flex w-full items-center md:hidden">
          <div className="flex-1">
            <Link href="/" className="flex items-center space-x-2">
              {/* <Image src="/icon.svg" alt="Abrar Shop Logo" width={32} height={32} /> */}
              <span className="font-bold sm:inline-block">ABRAR SHOP</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="rounded-none" onClick={() => setMobileSearchOpen(p => !p)}>
              <Search className={cn("h-5 w-5", isMobileSearchOpen && "text-primary")} />
              <span className="sr-only">Toggle Search</span>
            </Button>
            <CartIcon onClick={() => setCartOpen(true)} />
            <Button variant="ghost" size="icon" className="rounded-none" asChild>
              <Link href="/login" aria-label="Login or view account">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden w-full items-center justify-between md:flex">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              {/* <Image src="/icon.svg" alt="Abrar Shop Logo" width={32} height={32} /> */}
              <span className="font-bold">ABRAR SHOP</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={label}
                  href={href}
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
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
            <CartIcon onClick={() => setCartOpen(true)} />
            <Button variant="ghost" size="icon" className="rounded-none" asChild>
              <Link href="/login" aria-label="Login or view account">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

      </div>

      {isMobileSearchOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container py-3">
            <Suspense fallback={<SearchBarFallback />}>
              <SearchInput />
            </Suspense>
          </div>
        </div>
      )}

      <CartSheet open={isCartOpen} onOpenChange={setCartOpen} />
    </header>
  );
}
