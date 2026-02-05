import { getBrands } from "@/lib/data";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import Link from "next/link";
import Image from "next/image";
import { Tag } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Brands - Abrar Shop",
    description: "Browse all brands available at Abrar Shop.",
};

export default async function BrandsPage() {
    const brands = await getBrands();

    return (
        <div className="container py-6">
            <div className="mb-8">
                <Breadcrumb
                    items={[
                        { name: 'Home', href: '/' },
                        { name: 'Brand', href: '/brand' }
                    ]}
                />
                <h1 className="text-3xl font-bold tracking-tight font-headline mt-4">
                    Shop by <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-600">Brand</span>
                </h1>
                <p className="text-muted-foreground mt-2">Browse products from your favorite brands.</p>
            </div>

            {brands.length === 0 ? (
                <div className="text-center py-20 bg-[#f5f6f7] rounded-lg">
                    <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <h2 className="text-xl font-medium text-muted-foreground">No brands found.</h2>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {brands.map(brand => (
                        <Link href={`/brand/${brand.slug}`} key={brand.id} className="group">
                            <div className="flex flex-col items-center justify-center gap-3 p-4 h-full border transition-all duration-300 hover:shadow-lg hover:border-primary bg-[#f5f6f7]">
                                <div className="relative h-20 w-20 flex items-center justify-center">
                                    {brand.imageUrl ? (
                                        <Image
                                            src={brand.imageUrl}
                                            alt={brand.name}
                                            fill
                                            className="object-contain transition-transform duration-300 group-hover:scale-110"
                                            sizes="(min-width: 1280px) 120px, 100px"
                                        />
                                    ) : (
                                        <Tag className="w-10 h-10 text-muted-foreground opacity-40" />
                                    )}
                                </div>
                                <span className="text-center text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                    {brand.name}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
