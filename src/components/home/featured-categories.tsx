import { getCategories } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { FadeUp } from "../animations/fade-up";

export async function FeaturedCategories() {
    let categories = await getCategories({ isFeatured: true });

    if (categories.length === 0) {
        categories = await getCategories({ topLevelOnly: true });
    }

    const featuredCategories = categories.slice(0, 8);

    if (featuredCategories.length === 0) {
        return null;
    }

    return (
        <section className="py-8 md:py-16 lg:py-20 bg-[#fcfcfc] bg-grid relative overflow-hidden">
            <div className="bg-noise" />
            <div className="container">
                <FadeUp>
                    <div className="space-y-4 text-center flex flex-col items-center">
                            <div className="flex items-center gap-2">
                                <div className="h-px w-8 bg-orange-600"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600">Top Categories</span>
                            </div>
                            <h2 className="text-xl sm:text-4xl md:text-5xl font-black font-headline tracking-tight uppercase leading-[0.9] gap-2 flex flex-row">
                                Popular <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-800 to-zinc-500">Categories</span>
                            </h2>
                        </div>
                </FadeUp>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mt-12">
                    {featuredCategories.map((category, index) => {
                        const imageUrl = category.imageUrl || "";

                        return (
                            <FadeUp key={category.id} delay={index * 0.1}>
                                <Link href={`/category/${category.slug}`} className="group relative overflow-hidden bg-white shadow-sm hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 block rounded-xl">
                                    <div className="aspect-[4/5] relative overflow-hidden">
                                        {imageUrl ? (
                                            <Image
                                                src={imageUrl}
                                                alt={category.name}
                                                fill
                                                className="object-contain scale-80 transition-transform duration-[1.5s] group-hover:scale-100"
                                                sizes="(max-width: 640px) 50vw, 25vw"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-zinc-50 text-zinc-200">
                                                <ShoppingBag className="w-16 h-16 md:w-20 md:h-20" strokeWidth={0.5} />
                                            </div>
                                        )}
                                    
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>

                                        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 md:p-4 space-y-1 sm:space-y-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                            <p className="text-[9px] md:text-[10px] font-black text-orange-400 uppercase tracking-widest">Collection 0{index + 1}</p>
                                            <h3 className="text-base sm:text-xl md:text-xl font-black text-white uppercase tracking-tighter leading-tight">
                                                {category.name}
                                            </h3>
                                            <div className="h-px md:h-0.5 w-0 group-hover:w-12 bg-white transition-all duration-500 delay-100"></div>
                                        </div>

                                        <div className="absolute top-4 right-4 md:top-6 md:right-6 h-10 w-10 md:h-12 md:w-12 rounded-full border border-white/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-y-4 group-hover:translate-y-0 backdrop-blur-sm">
                                            <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
                                        </div>
                                    </div>
                                </Link>
                            </FadeUp>
                        );
                    })}
                </div>
                <div className="flex justify-center mt-12">
                    <Link href="/category" className="bg-black text-white px-6 py-3 md:px-8 md:py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-600 transition-all duration-500 rounded-none w-fit flex items-center gap-2">
                        Explore All Categories <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
