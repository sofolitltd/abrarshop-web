"use client";

import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Category } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

interface MobileNavProps {
    categories: Category[];
}

export function MobileNav({ categories }: MobileNavProps) {
    const [open, setOpen] = useState(false);

    // Separate parent categories and subcategories
    const parentCategories = categories.filter(cat => !cat.parentId);
    const getSubcategories = (parentId: string) =>
        categories.filter(cat => cat.parentId === parentId);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2 text-white bg-zinc-900 hover:text-black rounded-none">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] p-0 border-r-zinc-200">
                <SheetHeader className="p-4 border-b border-zinc-100 text-left">
                    <SheetTitle className="font-headline font-bold uppercase tracking-tighter">
                        Abrar<span className="text-orange-600"> Shop</span>
                    </SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-80px)]">
                    <div className="flex flex-col py-2">
                        <Link
                            href="/"
                            onClick={() => setOpen(false)}
                            className="px-6 py-4 text-sm font-bold uppercase tracking-wider hover:bg-zinc-50 transition-colors border-b border-zinc-50"
                        >
                            Home
                        </Link>

                        <Accordion type="single" collapsible className="w-full">
                            {/* All Products Accordion */}
                            <AccordionItem value="all-products" className="border-b border-zinc-50">
                                <AccordionTrigger className="px-6 py-4 text-sm font-bold uppercase tracking-wider hover:bg-zinc-50 hover:no-underline">
                                    All Products
                                </AccordionTrigger>
                                <AccordionContent className="pb-0 bg-zinc-50">
                                    <div className="flex flex-col">
                                        <Link
                                            href="/product"
                                            onClick={() => setOpen(false)}
                                            className="px-8 py-3 text-sm font-medium text-zinc-600 hover:text-orange-600 hover:bg-zinc-100 transition-colors flex justify-between items-center"
                                        >
                                            View All Products
                                            <ChevronRight className="h-3 w-3" />
                                        </Link>
                                        <Separator className="opacity-50" />
                                        <Link
                                            href="/product?isTrending=true"
                                            onClick={() => setOpen(false)}
                                            className="px-8 py-3 text-sm font-medium text-zinc-600 hover:text-orange-600 hover:bg-zinc-100 transition-colors"
                                        >
                                            Trending Now
                                        </Link>
                                        <Link
                                            href="/product?isBestSelling=true"
                                            onClick={() => setOpen(false)}
                                            className="px-8 py-3 text-sm font-medium text-zinc-600 hover:text-orange-600 hover:bg-zinc-100 transition-colors"
                                        >
                                            Best Sellers
                                        </Link>
                                        <Link
                                            href="/product?isFeatured=true"
                                            onClick={() => setOpen(false)}
                                            className="px-8 py-3 text-sm font-medium text-zinc-600 hover:text-orange-600 hover:bg-zinc-100 transition-colors"
                                        >
                                            Featured Items
                                        </Link>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Individual Category Accordions */}
                            {parentCategories.map((category) => {
                                const subcategories = getSubcategories(category.id);
                                const hasSubcategories = subcategories.length > 0;

                                return (
                                    <AccordionItem key={category.id} value={category.id} className="border-b border-zinc-50">
                                        <AccordionTrigger className="px-6 py-4 text-sm font-bold uppercase tracking-wider hover:bg-zinc-50 hover:no-underline">
                                            {category.name}
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-0 bg-zinc-50">
                                            <div className="flex flex-col">
                                                <Link
                                                    href={`/product?category=${category.slug}`}
                                                    onClick={() => setOpen(false)}
                                                    className="px-8 py-3 text-sm font-medium text-zinc-600 hover:text-orange-600 hover:bg-zinc-100 transition-colors flex justify-between items-center"
                                                >
                                                    View All {category.name}
                                                    <ChevronRight className="h-3 w-3" />
                                                </Link>
                                                {hasSubcategories && (
                                                    <>
                                                        <Separator className="opacity-50" />
                                                        {subcategories.map((subcat) => (
                                                            <Link
                                                                key={subcat.id}
                                                                href={`/product?category=${subcat.slug}`}
                                                                onClick={() => setOpen(false)}
                                                                className="px-8 py-3 text-sm font-medium text-zinc-600 hover:text-orange-600 hover:bg-zinc-100 transition-colors"
                                                            >
                                                                {subcat.name}
                                                            </Link>
                                                        ))}
                                                    </>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>

                        <Link
                            href="/track-order"
                            onClick={() => setOpen(false)}
                            className="px-6 py-4 text-sm font-bold uppercase tracking-wider hover:bg-zinc-50 transition-colors border-b border-zinc-50"
                        >
                            Track Order
                        </Link>
                    </div>

                    <div className="mt-8 px-6 pb-6">
                        <div className="p-4 bg-zinc-50 rounded-lg text-center">
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Need Help?</p>
                            <p className="text-sm font-bold text-black mb-1">017258577772</p>
                            <p className="text-sm font-bold text-black">support@abrarshop.online</p>
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
