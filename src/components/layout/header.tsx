"use client";

import Link from "next/link";
import { useState, Suspense, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CartIcon } from "@/components/cart/cart-icon";
import { CartSheet } from "@/components/cart/cart-sheet";
import { useCart } from "@/context/cart-context";
import { SearchInput } from "./search-input";
import { Search, User, Menu, X, ShoppingBag } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";

import { Category } from "@/lib/types";
import { TopBar } from "./top-bar";
import { MainNav } from "./main-nav";
import { MobileNav } from "./mobile-nav";

const SearchBarFallback = () => <Skeleton className="h-10 w-full bg-zinc-100" />;
const DesktopSearchBarFallback = () => <Skeleton className="h-10 w-full min-w-[350px] bg-zinc-100" />;

interface HeaderProps {
  categories?: Category[];
}

export function Header({ categories = [] }: HeaderProps) {
  const { isDrawerOpen, setDrawerOpen } = useCart();
  const { user } = useAuth();
  const [isMobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const pathname = usePathname();

  // Instant scroll resetting on page change
  useEffect(() => {
    const html = document.documentElement;
    const originalScrollBehavior = html.style.scrollBehavior;
    
    // Temporarily turn off smooth scroll
    html.style.scrollBehavior = "auto";
    
    // Instantly jump to top
    window.scrollTo(0, 0);
    setIsVisible(true);
    
    // Restore user's global smooth scroll preference
    const timeout = setTimeout(() => {
      html.style.scrollBehavior = originalScrollBehavior || "";
    }, 50);

    return () => clearTimeout(timeout);
  }, [pathname]);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Always show at top
      if (currentScrollY < 100) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && !isMobileSearchOpen && !isDrawerOpen) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobileSearchOpen, isDrawerOpen]);


  return (
    <header className={cn(
      "sticky z-50 w-full flex flex-col backdrop-blur-md bg-white/70 border-b border-zinc-200/50 shadow-sm transition-all duration-300",
      isVisible ? "top-0" : "top-0 lg:-top-9"
    )}>
      
      {/* Top Bar Wrapper */}
      <div className="hidden sm:block h-9 border-b border-zinc-200/50">
        <TopBar />
      </div>

      {/* Main Header */}
      <div className="w-full text-black">
        <div className="container flex h-16 items-center">

          {/* Mobile Header */}
          <div className="flex w-full items-center justify-between min-[1200px]:hidden h-full py-4">
            {/* Left side: Menu + Logo */}
            <div className="flex items-center gap-2">
              <MobileNav categories={categories} />
              <Link href="/" className="inline-block">
                <span className="text-xl font-bold font-headline tracking-tighter text-black uppercase">
                  {SITE_CONFIG.name.split(' ')[0]}<span className="text-orange-500"> {SITE_CONFIG.name.split(' ')[1]}</span>
                </span>
              </Link>
            </div>

            {/* Right side: Search, Cart, Profile */}
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="icon" className="rounded-none bg-zinc-100/50 text-black hover:bg-zinc-100 hover:text-orange-500" onClick={() => setMobileSearchOpen(p => !p)}>
                <Search className={cn("h-5 w-5", isMobileSearchOpen && "text-orange-500")} />
                <span className="sr-only">Toggle Search</span>
              </Button>
              <CartIcon onClick={() => setDrawerOpen(true)} className="text-black bg-zinc-100/50 hover:bg-zinc-100 hover:text-orange-500" />
              <Button variant="ghost" size="icon" className="rounded-none bg-zinc-100/50 text-black hover:bg-zinc-100 hover:text-orange-500" asChild>
                <Link href={user ? "/account" : "/login"} aria-label="Login or view account">
                  <User className={cn("h-5 w-5", user && "text-orange-500")} />
                </Link>
              </Button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden min-[1200px]:flex w-full items-center justify-between h-full">
            <Link href="/" className="inline-block hover:opacity-90 transition-opacity mr-12">
              <span className="text-3xl font-bold font-headline tracking-tighter text-black uppercase">
                {SITE_CONFIG.name.split(' ')[0]}<span className="text-orange-500">{" "}{SITE_CONFIG.name.split(' ')[1]}</span>
              </span>
            </Link>

            <div className="flex-1 max-w-2xl mx-12">
              <Suspense fallback={<DesktopSearchBarFallback />}>
                <SearchInput />
              </Suspense>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" className="h-9 rounded-none bg-zinc-100/50 text-black hover:bg-zinc-100 hover:text-orange-500 gap-2 px-4 shadow-sm" asChild>
                <Link href={user ? "/account" : "/login"} aria-label="Login or view account">
                  <User className={cn("h-5 w-5", user && "text-orange-500")} />
                  <div className="flex flex-col items-start hidden lg:flex">
                    <span className="text-[10px] uppercase text-zinc-500 leading-none">Account</span>
                    <span className="text-sm font-bold leading-none">{user ? 'My Profile' : 'Login / Register'}</span>
                  </div>
                </Link>
              </Button>

              <CartIcon 
                onClick={() => setDrawerOpen(true)} 
                className="text-black bg-zinc-100/50 hover:bg-zinc-100 hover:text-orange-500 shadow-sm transition-colors h-9 px-4" 
              />
            </div>
          </div>

        </div>
      </div>

      {/* Main Navigation */}
      <MainNav categories={categories} />

      {/* Mobile Search */}
      {isMobileSearchOpen && (
        <div className="min-[1200px]:hidden border-t border-zinc-100 bg-white/95 backdrop-blur-md">
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
