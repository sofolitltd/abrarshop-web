"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ProductGalleryProps = {
  images: string[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
  };

  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) {
    return (
      <Card className="aspect-square bg-muted flex flex-col items-center justify-center border-none shadow-none">
        <div className="text-muted-foreground text-[8px] uppercase font-bold leading-none">
          <span>No</span>
          <span>img</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main Image Container */}
      <div className="relative group w-full max-w-[600px]">
        <Card className="overflow-hidden border-none shadow-none rounded-none bg-[#f5f6f7]">
          <CardContent className="relative aspect-square p-0">
            <Image
              src={(images[activeIndex] || images[0]) || "https://placehold.co/600x400?text=No+Image"}
              alt={`${productName} - Image ${activeIndex + 1}`}
              fill
              className="object-contain"
              sizes="(min-width: 1024px) 600px, 100vw"
              priority
            />
          </CardContent>
        </Card>

        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-none bg-background/50 hover:bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity md:h-10 md:w-10 z-10"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-none bg-background/50 hover:bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity md:h-10 md:w-10 z-10"
              onClick={handleNext}
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnails Container - Always at bottom */}
      {images.length > 1 && (
        <div className="flex gap-2 min-w-min overflow-x-auto pb-2 scrollbar-hide">
          {images.map((src, index) => (
            <button
              key={index}
              className={cn(
                "relative h-16 w-16 md:h-20 md:w-20 flex-shrink-0 cursor-pointer overflow-hidden border transition-all",
                activeIndex === index ? "border-black border-2" : "border-border opacity-60 hover:opacity-100"
              )}
              onClick={() => handleThumbnailClick(index)}
            >
              <Image
                src={src}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
