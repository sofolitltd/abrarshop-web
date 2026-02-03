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

  return (
    <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-4">

      {/*  */}
      {images.length > 1 && (
        <div className="md:order-1 order-2">
          <div className="grid grid-cols-5 md:grid-cols-1 gap-2">
            {images.map((src, index) => (
              <button
                key={index}
                className={cn(
                  "relative aspect-square cursor-pointer overflow-hidden border-2",
                  activeIndex === index ? "border-primary" : "border-transparent"
                )}
                onClick={() => handleThumbnailClick(index)}
              >
                <Image
                  src={src}
                  alt={`${productName} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 767px) 20vw, 80px"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="relative group w-full md:order-2 ">
        <Card className="overflow-hidden">
          <CardContent className="relative aspect-square p-0">
            <Image
              src={images[activeIndex]}
              alt={`${productName} - Image ${activeIndex + 1}`}
              fill
              className="object-contain"
              sizes="(min-width: 1024px) 500px, (min-width: 768px) 80vw, 100vw"
            // priority
            />
          </CardContent>
        </Card>
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-none bg-background/50 hover:bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity md:h-10 md:w-10"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-none bg-background/50 hover:bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity md:h-10 md:w-10"
              onClick={handleNext}
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
