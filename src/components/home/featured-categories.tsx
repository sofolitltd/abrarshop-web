import { getCategories } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import Link from "next/link";

export async function FeaturedCategories() {
    let categories = await getCategories({ isFeatured: true });

    // Fallback if no category is marked as featured
    if (categories.length === 0) {
        categories = await getCategories({ topLevelOnly: true });
    }

    const featuredCategories = categories.slice(0, 16);

    const getFallbackIcon = (slug: string) => {
        const icon = PlaceHolderImages.find(img => img.id === `category-${slug}`);
        return icon || PlaceHolderImages.find(img => img.id === 'category-default');
    };

    if (featuredCategories.length === 0) {
        return null;
    }

    return (
        <section className="pt-10 pb-20">
            <div className="container">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold tracking-tight font-headline">
                        Featured <span className="text-orange-500">Categories</span>
                    </h2>
                    <Link href="/categories" className="text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors uppercase tracking-tight">
                        See All Categories →
                    </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 ">
                    {featuredCategories.map(category => {
                        const fallbackIcon = getFallbackIcon(category.slug);
                        const imageUrl = category.imageUrl || fallbackIcon?.imageUrl;
                        const imageHint = category.imageUrl ? category.name : fallbackIcon?.imageHint;

                        return (
                            <Link href={`/category/${category.slug}`} key={category.id} className="group">
                                <div className="flex flex-col items-center justify-center gap-3 p-4 h-full rounded-none border transition-all duration-300 hover:shadow-lg hover:border-primary bg-[#f5f6f7]">
                                    <div className="relative h-16 w-16">
                                        {imageUrl && (
                                            <Image
                                                src={imageUrl}
                                                alt={category.name}
                                                fill
                                                className="object-contain transition-transform duration-300 group-hover:scale-110"
                                                sizes="64px"
                                                data-ai-hint={imageHint}
                                            />
                                        )}
                                    </div>
                                    <span className="text-center text-sm font-medium text-foreground group-hover:text-primary">{category.name}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
