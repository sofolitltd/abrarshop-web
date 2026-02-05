import { getCategories } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
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
        <section className="py-24 bg-[#fcfcfc] bg-grid relative overflow-hidden">
            <div className="bg-noise" />
            <div className="container">
                <FadeUp>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="h-px w-8 bg-orange-600"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600">Top Categories</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black font-headline tracking-tighter uppercase leading-[0.9]">
                                Popular <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-800 to-zinc-500">Categories</span>
                            </h2>
                        </div>
                        <Link href="/category" className="bg-black text-white px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-600 transition-all duration-500 rounded-none">
                            Explore Catalog
                        </Link>
                    </div>
                </FadeUp>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-zinc-50 text-zinc-200">
                                                <ShoppingBag className="w-20 h-20" strokeWidth={0.5} />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>

                                        <div className="absolute inset-x-0 bottom-0 p-8 space-y-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Collection 0{index + 1}</p>
                                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight">
                                                {category.name}
                                            </h3>
                                            <div className="h-0.5 w-0 group-hover:w-12 bg-white transition-all duration-500 delay-100"></div>
                                        </div>

                                        <div className="absolute top-6 right-6 h-12 w-12 rounded-full border border-white/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-y-4 group-hover:translate-y-0 backdrop-blur-sm">
                                            <ShoppingBag className="w-5 h-5" />
                                        </div>
                                    </div>
                                </Link>
                            </FadeUp>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
