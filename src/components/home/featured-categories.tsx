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

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mt-12">
                    {featuredCategories.map((category, index) => {
                        const imageUrl = category.imageUrl || "";

                        return (
                            <FadeUp key={category.id} delay={index * 0.1}>
                                <Link href={`/category/${category.slug}`} className="group flex flex-col gap-4 transition-all duration-300">
                                    {/* Minimalist Image Container */}
                                    <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl bg-[#f7f7f7] border border-zinc-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-2xl group-hover:border-zinc-200 transition-all duration-500">
                                        <div className="absolute inset-4 sm:inset-6 flex items-center justify-center">
                                            {imageUrl ? (
                                                <Image
                                                    src={imageUrl}
                                                    alt={category.name}
                                                    fill
                                                    className="object-contain scale-95 group-hover:scale-110 transition-transform duration-700 ease-out"
                                                    sizes="(max-width: 640px) 50vw, 25vw"
                                                />
                                            ) : (
                                                <ShoppingBag className="w-12 h-12 text-zinc-300" strokeWidth={1} />
                                            )}
                                        </div>
                                        
                                        {/* Subtle overlay accent */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/0 via-transparent to-orange-500/0 group-hover:to-orange-500/5 transition-colors duration-500"></div>
                                    </div>

                                    {/* Typography underneath */}
                                    <div className="flex flex-col items-center justify-center space-y-1">
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Explore</p>
                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                            <h3 className="text-xs sm:text-sm md:text-base font-black text-black uppercase tracking-widest group-hover:text-orange-600 transition-colors">
                                                {category.name}
                                            </h3>
                                            <ArrowRight className="w-3.5 h-3.5 text-orange-600 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
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
