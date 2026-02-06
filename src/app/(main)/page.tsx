import { ProductList } from "@/components/product/product-list";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { NewTrends } from "@/components/home/new-trends";
import { BestSelling } from "@/components/home/best-selling";
import { FeaturedBrands } from "@/components/home/featured-brands";
import { getHeroSliders } from "@/lib/data";
import { FadeUp } from "@/components/animations/fade-up";

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
    <div className="relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-orange-50/50 to-transparent -z-10 blur-3xl opacity-50 pointer-events-none" />
      <FadeUp duration={0.8}>
        <HeroSection
          sliders={activeSliders}
          promoTop={promoTop[0]}
          promoBottom={promoBottom[0]}
        />
      </FadeUp>

      <FadeUp delay={0.2}>
        <FeaturedCategories />
      </FadeUp>

      <FadeUp>
        <NewTrends />
      </FadeUp>

      <FadeUp>
        <BestSelling />
      </FadeUp>

      <section id="products" className="py-8 md:py-16 lg:py-20 bg-[#fcfcfc] bg-grid relative overflow-hidden">
        <div className="bg-noise" />
        <div className="container">
          <FadeUp>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-16">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px w-8 bg-orange-600"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600">Top Choices</span>
                </div>
                <h2 className="flex flex-col sm:flex-row gap-4 text-3xl sm:text-4xl md:text-5xl font-black font-headline tracking-tight uppercase leading-none">
                  Featured <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-800 to-zinc-500">Products</span>
                </h2>
                <p className="text-zinc-500 text-xs md:text-sm font-medium uppercase tracking-[0.1em] pt-1">Check & Get Your Desired Product!</p>
              </div>
              <div className="h-1.5 w-24 bg-black hidden md:block"></div>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-4">
              <ProductList isFeatured={true} limit={10} />
            </div>
          </FadeUp>
        </div>
      </section>

      <FadeUp>
        <FeaturedBrands />
      </FadeUp>
    </div>
  );
}
