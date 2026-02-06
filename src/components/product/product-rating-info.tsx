"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductRatingInfoProps {
    averageRating: string | number;
    reviewCount: number;
}

export function ProductRatingInfo({ averageRating, reviewCount }: ProductRatingInfoProps) {
    const scrollToReviews = () => {
        const element = document.getElementById("reviews");
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <button
            onClick={scrollToReviews}
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
        >
            <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                        key={s}
                        className={cn(
                            "w-3.5 h-3.5",
                            s <= Math.round(Number(averageRating))
                                ? "fill-orange-500 text-orange-500"
                                : "text-zinc-300"
                        )}
                    />
                ))}
            </div>
            <span className="text-xs font-bold text-zinc-600">({reviewCount} Reviews)</span>
        </button>
    );
}
