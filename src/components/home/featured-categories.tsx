import { getCategories } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import Link from "next/link";

export async function FeaturedCategories() {
    const categories = await getCategories({ topLevelOnly: true });

    const featuredCategories = categories.slice(0, 16);

    const getFallbackIcon = (slug: string) => {
        const icon = PlaceHolderImages.find(img => img.id === `category-${slug}`);
        return icon || PlaceHolderImages.find(img => img.id === 'category-default');
    };

    if (featuredCategories.length === 0) {
        return null;
    }

    return (
        <section className="py-12 sm:py-16">
            <div className="container">
                <h2 className="mb-8 text-3xl font-bold tracking-tight text-center font-headline">
                    Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-600">Categories</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {featuredCategories.map(category => {
                        const fallbackIcon = getFallbackIcon(category.slug);
                        const imageUrl = category.imageUrl || fallbackIcon?.imageUrl;
                        const imageHint = category.imageUrl ? category.name : fallbackIcon?.imageHint;

                        return (
                            <Link href={`/category/${category.slug}`} key={category.id} className="group">
                                <div className="flex flex-col items-center justify-center gap-3 p-4 h-full rounded-none bg-card border transition-all duration-300 hover:shadow-lg hover:border-primary">
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
