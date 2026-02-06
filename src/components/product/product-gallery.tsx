"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, X, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type ProductGalleryProps = {
  images: string[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({});
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Swipe Logic
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    if (distance > minSwipeDistance) handleNext();
    else if (distance < -minSwipeDistance) handlePrev();
  };

  const handleNext = () => setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
  const handlePrev = () => setActiveIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: "scale(2.2)" });
  };

  if (!images || images.length === 0) {
    return (
      <Card className="aspect-square bg-muted flex flex-col items-center justify-center border-none shadow-none">
        <span className="text-muted-foreground text-[10px] font-bold uppercase">No Image</span>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main Image Container */}
      <div className="relative group w-full max-w-[600px]">
        <div
          ref={containerRef}
          className="relative overflow-hidden cursor-crosshair bg-[#f5f6f7] aspect-square"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setZoomStyle({})}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onClick={() => setIsLightboxOpen(true)}
        >
          <div
            className="w-full h-full transition-transform duration-200 ease-out flex items-center justify-center"
            style={zoomStyle}
          >
            <Image
              src={images[activeIndex]}
              alt={`${productName} - Image ${activeIndex + 1}`}
              fill
              className="object-contain"
              sizes="(min-width: 1024px) 600px, 100vw"
              priority
            />
          </div>

          {/* Overlay Badges */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity md:flex hidden pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1.5 flex items-center gap-2 shadow-sm">
              <ZoomIn className="w-3.5 h-3.5 text-black" />
              <span className="text-[10px] font-bold uppercase tracking-tight">Hover to Zoom</span>
            </div>
            <div className="bg-black text-white px-2.5 py-1.5 flex items-center gap-2 shadow-sm">
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-tight">Click to Enlarge</span>
            </div>
          </div>
        </div>

        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 text-black hover:bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 text-black hover:bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnails Container */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {images.map((src, index) => (
          <button
            key={index}
            className={cn(
              "relative h-16 w-16 md:h-20 md:w-20 shrink-0 overflow-hidden border-2 transition-all",
              activeIndex === index ? "border-orange-500" : "border-transparent opacity-60 hover:opacity-100"
            )}
            onClick={() => setActiveIndex(index)}
          >
            <Image src={src} alt={`${productName} thumbnail ${index + 1}`} fill className="object-cover" sizes="80px" />
          </button>
        ))}
      </div>

      {/* Lightbox / Fullscreen Dialog */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent showCloseButton={false} className="max-w-screen h-[calc(60vh)] w-screen p-0 border-none bg-white flex flex-col items-center justify-center gap-0 outline-none">
          {/* Header with Title and Close */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md z-50 flex items-center justify-between px-6 border-b border-zinc-100">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 leading-none mb-1">Product Gallery</span>
              <DialogTitle className="text-sm md:text-base font-bold text-black truncate max-w-[200px] md:max-w-md uppercase tracking-tight leading-tight">
                {productName}
              </DialogTitle>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-black hover:bg-zinc-100 rounded-full transition-colors shrink-0"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="relative w-full flex-1 flex items-center justify-center p-4 md:p-12 overflow-hidden bg-white mt-16">
            <div
              className="relative w-full h-full max-w-5xl bg-[#f5f6f7] flex items-center justify-center overflow-hidden"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <Image
                src={images[activeIndex]}
                alt={`${productName} large view`}
                fill
                className="object-contain p-4 md:p-12"
                sizes="100vw"
                priority
              />
            </div>

            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 md:h-14 md:w-14 text-black hover:bg-white/90 bg-white/50 backdrop-blur-sm rounded-full shadow-lg transition-all z-10"
                  onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                >
                  <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 md:h-14 md:w-14 text-black hover:bg-white/90 bg-white/50 backdrop-blur-sm rounded-full shadow-lg transition-all z-10"
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                >
                  <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
                </Button>
              </>
            )}

            {/* Pagination Indicators */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-2 z-20">
              <div className="bg-black/90 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest mb-4">
                {activeIndex + 1} / {images.length}
              </div>
              <div className="absolute bottom-0 flex gap-2">
                {images.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === activeIndex ? "w-8 bg-orange-600" : "w-1.5 bg-zinc-300"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
