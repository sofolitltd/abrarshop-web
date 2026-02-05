
"use client";

import { Search, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useTransition } from "react";
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover";
import { searchProducts } from "@/lib/actions";
import type { Product } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { useDebounce } from "@/hooks/use-debounce";

export function SearchInput() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const defaultQuery = searchParams.get("q") || "";

    const [query, setQuery] = useState(defaultQuery);
    const [results, setResults] = useState<Product[]>([]);
    const [isPopoverOpen, setPopoverOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const debouncedQuery = useDebounce(query, 300);

    useEffect(() => {
        if (debouncedQuery) {
            startTransition(async () => {
                const products = await searchProducts(debouncedQuery, 5);
                setResults(products);
                if (products.length > 0) {
                    setPopoverOpen(true)
                } else {
                    setPopoverOpen(false)
                }
            });
        } else {
            setResults([]);
            setPopoverOpen(false);
        }
    }, [debouncedQuery]);

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!query.trim()) {
            return;
        }
        setPopoverOpen(false);
        router.push(`/product?q=${encodeURIComponent(query)}`);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
    }

    const handleFocus = () => {
        if (query.trim() && results.length > 0) {
            setPopoverOpen(true);
        }
    }

    return (
        <Popover open={isPopoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverAnchor asChild>
                <form onSubmit={handleSearchSubmit} className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        name="q"
                        value={query}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        placeholder="Search products..."
                        className="pl-8 w-full"
                        autoComplete="off"
                    />
                    {isPending && <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
                </form>
            </PopoverAnchor>
            <PopoverContent
                align="start"
                className="w-[var(--radix-popover-trigger-width)] p-0"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                {results.length > 0 ? (
                    <div className="flex flex-col">
                        <div className="p-2 space-y-1 max-h-[40vh] overflow-y-auto">
                            {results.map(product => (
                                <Link href={`/product/${product.slug}`} key={product.id} className="block hover:bg-accent rounded-none p-2" onClick={() => setPopoverOpen(false)}>
                                    <div className="flex items-center gap-4">
                                        <Image src={product.images[0]} alt={product.name} width={40} height={40} className="rounded-none" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium truncate">{product.name}</p>
                                            <p className="text-sm text-primary font-semibold">{product.price.toFixed(0)}৳</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div className="border-t p-2 text-center">
                            <Link href={`/product?q=${encodeURIComponent(query)}`} className="text-sm text-primary hover:underline" onClick={() => setPopoverOpen(false)}>
                                See all results
                            </Link>
                        </div>
                    </div>
                ) : (
                    !isPending && debouncedQuery && <p className="p-4 text-sm text-center text-muted-foreground">No products found.</p>
                )}
            </PopoverContent>
        </Popover>
    );
}