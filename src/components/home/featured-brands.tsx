import { getBrands } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";
import { Tag } from "lucide-react";

export async function FeaturedBrands() {
    const allBrands = await getBrands();
    const brands = allBrands.slice(0, 16);

    if (brands.length === 0) {
        return null;
    }

    return (
        <section className="pt-12 pb-20 bg-secondary/50">
            <div className="container">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold tracking-tight font-headline">
                        Shop by <span className="text-orange-500">Brand</span>
                    </h2>
                    <Link href="/brands" className="text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors uppercase tracking-tight">
                        See All Brands →
                    </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {brands.map(brand => (
                        <Link href={`/brands/${brand.slug}`} key={brand.id} className="group">
                            <div className="flex flex-col items-center justify-center gap-3 p-4 h-full border transition-all duration-300 hover:shadow-lg hover:border-primary bg-[#f5f6f7]">
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
                                <span className="text-center text-sm font-medium text-foreground group-hover:text-primary">
                                    {brand.name}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}