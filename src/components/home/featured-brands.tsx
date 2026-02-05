import { getBrands } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";
import { Tag } from "lucide-react";
import { FadeUp } from "../animations/fade-up";

export async function FeaturedBrands() {
    const allBrands = await getBrands();
    const brands = allBrands.slice(0, 8); // Showing a few more for the grid

    if (brands.length === 0) {
        return null;
    }

    return (
        <section className="py-20 bg-white relative overflow-hidden">
            <div className="bg-noise" />
            <div className="container">
                <FadeUp>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
                        
                        
                        <div className="space-y-2">
                         
                               <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tight uppercase leading-none">
                                Official <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-800 to-zinc-500">Brands</span>
                            </h2>
                            <div className="h-1.5 w-20 bg-black"></div>
                            <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest pt-2">Authentic products from the world's best makers.</p>
                        </div>
                        <Link href="/brand" className="group flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] hover:text-orange-600 transition-colors">
                            View All Partners
                            <div className="h-px w-8 bg-zinc-300 group-hover:w-12 group-hover:bg-orange-600 transition-all duration-300"></div>
                        </Link>
                    </div>
                </FadeUp>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-0 border-t border-l border-zinc-100">
                    {brands.map((brand, index) => (
                        <FadeUp key={brand.id} delay={index * 0.05} distance={20}>
                            <Link href={`/brand/${brand.slug}`} className="group border-r border-b border-zinc-100 block">
                                <div className="flex flex-col items-center justify-center p-8 h-32 transition-all duration-500 hover:bg-zinc-50 relative overflow-hidden">
                                    <div className="relative h-20 w-20 flex items-center justify-center grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110">
                                        {brand.imageUrl ? (
                                            <Image
                                                src={brand.imageUrl}
                                                alt={brand.name}
                                                fill
                                                className="object-contain"
                                                sizes="(max-width: 640px) 100px, 80px"
                                            />
                                        ) : (
                                            <Tag className="w-12 h-12 text-zinc-300" />
                                        )}
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 h-1 bg-orange-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                                    <span className="mt-4 text-[10px] text-center font-black uppercase tracking-widest text-zinc-400 group-hover:text-black transition-colors">
                                        {brand.name}
                                    </span>
                                </div>
                            </Link>
                        </FadeUp>
                    ))}
                </div>
            </div>
        </section>
    );
}