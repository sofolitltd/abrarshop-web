"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ProductReviews } from "./product-reviews";
import type { Product, Review } from "@/lib/types";

type ProductDetailsTabsProps = {
  product: Product;
  reviews: Review[];
};

export function ProductDetailsTabs({ product, reviews }: ProductDetailsTabsProps) {
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
          Reviews ({reviews.length})
        </button>
      </div>

      <div className="py-8 px-2 max-w-5xl">
        <div className={cn("transition-opacity duration-300", activeTab === "description" ? "block opacity-100" : "hidden opacity-0")}>
          <div className="prose prose-sm max-w-none prose-neutral">
            {product.description ? (
              <p className="text-zinc-600 text-[13px] whitespace-pre-wrap leading-relaxed">
                {product.description}
              </p>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-col gap-3.5">
                  <p className="text-zinc-600 text-[13px] leading-relaxed m-0">
                    Looking for the best <strong>{product.name} Price in BD</strong>? Abrar Shop offers this premium <strong>{product.brand || "authentic"}</strong> product at the most competitive price in the market.
                    As a trusted retailer in the <strong>{product.category || "General"}</strong> category, we ensure you get the best value for your money.
                  </p>

                  <p className="text-zinc-600 text-[13px] leading-relaxed m-0">
                    The current <strong>{product.name} Price in Bangladesh</strong> is only <strong>৳{product.price}</strong> at our store.
                    Compared to the regular price of <strong>৳{product.originalPrice || product.price}</strong>, you can save more when you buy online from us.
                    {product.stock > 0 ? (
                      <span> We have <strong>{product.stock} units</strong> available in our warehouse for fast shipping.</span>
                    ) : (
                      <span> This item is currently out of stock, but you can contact us for the next availability date.</span>
                    )}
                  </p>

                  <p className="text-zinc-600 text-[13px] leading-relaxed m-0">
                    At Abrar Shop, we are committed to providing authentic products and the best shopping experience.
                    Order <strong>{product.name}</strong> today and enjoy high-quality service, secure payment options, and fast shipping.
                  </p>
                </div>

                {product.keywords && product.keywords.length > 0 && (
                  <div className="mt-8 pt-5 border-t border-zinc-100">
                    <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-2.5 tracking-widest">Related Searches</span>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {product.keywords.map((keyword, i) => (
                        <span key={i} className="text-[12px] text-zinc-400 hover:text-orange-600 transition-colors cursor-default">
                          #{keyword.replace(/\s+/g, '')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={cn("transition-opacity duration-300", activeTab === "reviews" ? "block opacity-100" : "hidden opacity-0")}>
          <ProductReviews productId={product.id} initialReviews={reviews} />
        </div>
      </div>
    </div>
  );
}