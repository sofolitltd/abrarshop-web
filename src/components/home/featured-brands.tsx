import { getBrands } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";
import { Tag } from "lucide-react";

export async function FeaturedBrands() {
    const brands = await getBrands();

    if (brands.length === 0) {
        return null;
    }

    return (
        <section className="py-16 sm:py-24 bg-secondary/50">
            <div className="container">
                <h2 className="mb-8 text-3xl font-bold tracking-tight text-center font-headline">
                    Shop by <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-600">Brand</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {brands.map(brand => (
                            <div className="flex flex-col items-center justify-center gap-3 p-4 h-full bg-card border rounded-lg">
                                <div className="relative h-16 w-16 flex items-center justify-center">
                                    {brand.imageUrl ? (
                                        <Image
                                            src={brand.imageUrl}
                                            alt={brand.name}
                                            fill
                                            className="object-contain transition-transform duration-300 group-hover:scale-110"
                                            sizes="64px"
                                        />
                                    ) : (
                                        <Tag className="w-10 h-10 text-muted-foreground" />
                                    )}
                                </div>
                                <span className="text-center text-sm font-medium text-foreground group-hover:text-primary">{brand.name}</span>
                            </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
