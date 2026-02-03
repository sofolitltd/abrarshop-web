import { getProducts } from "@/lib/data";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProductCard } from "../product/product-card";

export async function BestSelling() {
    const { products: bestSellingProducts } = await getProducts({ isBestSelling: true, limit: 10 });

    if (bestSellingProducts.length === 0) {
        return null;
    }

    return (
        <section className="py-16 sm:py-24 bg-secondary/50">
            <div className="container">
                <Carousel
                    opts={{
                        align: "start",
                    }}
                    className="w-full"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold tracking-tight font-headline">
                        Best <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-600">Selling</span>
                        </h2>
                        <div className="hidden md:flex gap-2">
                            <CarouselPrevious className="relative top-auto left-auto -translate-y-0" />
                            <CarouselNext className="relative top-auto right-auto -translate-y-0" />
                        </div>
                    </div>
                    <CarouselContent className="-ml-4">
                        {bestSellingProducts.map((product) => (
                            <CarouselItem key={product.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                                <ProductCard product={product} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        </section>
    );
}
