import { ProductList } from "@/components/product/product-list";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { NewTrends } from "@/components/home/new-trends";
import { BestSelling } from "@/components/home/best-selling";
import { FeaturedBrands } from "@/components/home/featured-brands";
import { getHeroSliders } from "@/lib/data";

export default async function HomePage() {
  const [
    activeSliders,
    promoTop,
    promoBottom
  ] = await Promise.all([
    getHeroSliders({ isActive: true, type: 'carousel' }),
    getHeroSliders({ isActive: true, type: 'promo-top', limit: 1 }),
    getHeroSliders({ isActive: true, type: 'promo-bottom', limit: 1 })
  ]);
  
  return (
    <>
      <HeroSection 
        sliders={activeSliders}
        promoTop={promoTop[0]}
        promoBottom={promoBottom[0]}
      />
      <FeaturedCategories />
      <NewTrends />
      <BestSelling />

      {/*  */}
      <section id="products" className="py-16 sm:py-24">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight font-headline">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-600 ">Featured Products</span>
            </h2>
            <p className="text-muted-foreground">Check & Get Your Desired Product!</p>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            <ProductList isFeatured={true} limit={15} />
          </div>
        </div>
      </section>

      {/*  */}
      <FeaturedBrands />
    </>
  );
}
