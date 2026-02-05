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
        <section className="py-24 bg-[#f9f9f9]">
            <div className="container">
                <Carousel
                    opts={{
                        align: "start",
                    }}
                    className="w-full"
                >
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="h-px w-8 bg-orange-600"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600">Just In</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tight uppercase leading-none">
                                New <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-800 to-zinc-500">Trends</span>
                            </h2>
                        </div>
                        <div className="flex gap-3">
                            <CarouselPrevious className="static translate-y-0 h-12 w-12 rounded-none border-zinc-200 hover:bg-black hover:text-white transition-all" />
                            <CarouselNext className="static translate-y-0 h-12 w-12 rounded-none border-zinc-200 hover:bg-black hover:text-white transition-all" />
                        </div>
                    </div>
                    <CarouselContent className="-ml-6">
                        {trendingProducts.map((product) => (
                            <CarouselItem key={product.id} className="pl-6 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                                <ProductCard product={product} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        </section>
    );
}
