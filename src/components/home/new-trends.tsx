import { getProducts } from "@/lib/data";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { ProductCard } from "../product/product-card";

export async function NewTrends() {
    const { products: trendingProducts } = await getProducts({ isTrending: true, limit: 10 });

    if (trendingProducts.length === 0) {
        return null;
    }

    return (
        <section className="pt-12 pb-16 bg-[#f5f6f7]">
            <div className="container ">
                <Carousel
                    opts={{
                        align: "start",
                    }}
                    className="w-full"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold tracking-tight font-headline">
                            New <span className="text-orange-500">Trends</span>
                        </h2>
                        <div className="hidden md:flex gap-2">
                            <CarouselPrevious className="relative top-auto left-auto -translate-y-0" />
                            <CarouselNext className="relative top-auto right-auto -translate-y-0" />
                        </div>
                    </div>
                    <CarouselContent className="-ml-4">
                        {trendingProducts.map((product) => (
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
