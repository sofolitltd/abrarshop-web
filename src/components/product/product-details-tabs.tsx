"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

type ProductDetailsTabsProps = {
  product: Product;
};

export function ProductDetailsTabs({ product }: ProductDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 w-full lg:w-fit lg:flex lg:flex-row border border-border bg-white shadow-sm">
        <button
          onClick={() => setActiveTab("description")}
          className={cn(
            "px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-none",
            activeTab === "description"
              ? "bg-black text-white"
              : "bg-transparent text-black hover:bg-muted"
          )}
        >
          Description
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={cn(
            "px-10 py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-none border-l border-border",
            activeTab === "reviews"
              ? "bg-black text-white"
              : "bg-transparent text-black hover:bg-muted"
          )}
        >
          Reviews
        </button>
      </div>

      <div className="py-8 px-2 max-w-5xl">
        <div className={cn("transition-opacity duration-300", activeTab === "description" ? "block opacity-100" : "hidden opacity-0")}>
          <div className="prose prose-sm max-w-none prose-neutral">
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>

        <div className={cn("transition-opacity duration-300", activeTab === "reviews" ? "block opacity-100" : "hidden opacity-0")}>
          <div className="space-y-4">
            <h3 className="text-xl font-bold font-headline uppercase tracking-tight">Customer Reviews</h3>
            <p className="text-muted-foreground italic">
              No reviews yet. Be the first to review this product!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}