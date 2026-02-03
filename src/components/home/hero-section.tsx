
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { HeroSlider } from "@/lib/types";

type HeroSectionProps = {
  sliders: HeroSlider[];
  promoTop?: HeroSlider;
  promoBottom?: HeroSlider;
}

export function HeroSection({ sliders, promoTop, promoBottom }: HeroSectionProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });

    api.on("reInit", () => {
      setCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section className="w-full">
      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            {sliders.length > 0 ? (
              <Carousel
                opts={{ loop: true }}
                setApi={setApi}
                plugins={[plugin.current]}
                className="w-full h-full"
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
              >
                <CarouselContent>
                  {sliders.map(slider => (
                    <CarouselItem key={slider.id}>
                      <Link href={slider.link || '#'} className="block">
                        <Card className="overflow-hidden border-none rounded-none">
                          <CardContent className="relative p-0 aspect-[16/9]">
                            <Image
                              src={slider.imageUrl}
                              alt={slider.title}
                              fill
                              className="object-cover"
                              sizes="(min-width: 1024px) 66vw, 100vw"
                            />
                          </CardContent>
                        </Card>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {sliders.length > 1 && (
                  <>
                    <CarouselPrevious className="absolute left-4 hidden sm:inline-flex" />
                    <CarouselNext className="absolute right-4 hidden sm:inline-flex" />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {Array.from({ length: count }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => api?.scrollTo(index)}
                          className={cn(
                            "h-2 w-2 rounded-none transition-all duration-300",
                            current === index ? "w-4 bg-primary" : "bg-white/50"
                          )}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </Carousel>
            ) : (
              <Card className="overflow-hidden h-full rounded-none">
                <CardContent className="relative w-full h-full p-0 bg-muted flex items-center justify-center aspect-video">
                  <p className="text-muted-foreground">No active carousel slides.</p>
                </CardContent>
              </Card>
            )}
          </div>
          <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 lg:grid-rows-2 gap-4">
            <Card className="overflow-hidden rounded-none w-full h-full">
              {promoTop ? (
                <Link href={promoTop.link || "#"} className="block h-full">
                  <CardContent className="relative w-full h-full p-0 aspect-video lg:aspect-auto">
                    <Image
                      src={promoTop.imageUrl}
                      alt={promoTop.title}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 33vw, 50vw"
                    />
                  </CardContent>
                </Link>
              ) : (
                <CardContent className="relative w-full h-full p-0 bg-muted flex items-center justify-center aspect-video">
                  <p className="text-muted-foreground text-sm">No promo banner</p>
                </CardContent>
              )}
            </Card>
            <Card className="overflow-hidden rounded-none w-full h-full">
              {promoBottom ? (
                <Link href={promoBottom.link || "#"} className="block h-full">
                  <CardContent className="relative w-full h-full p-0 aspect-video lg:aspect-auto">
                    <Image
                      src={promoBottom.imageUrl}
                      alt={promoBottom.title}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 33vw, 50vw"
                    />
                  </CardContent>
                </Link>
              ) : (
                <CardContent className="relative w-full h-full p-0 bg-muted flex items-center justify-center aspect-video">
                  <p className="text-muted-foreground text-sm">No promo banner</p>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
