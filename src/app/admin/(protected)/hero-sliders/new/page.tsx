import { HeroSliderForm } from "@/components/admin/hero-slider-form";
import { createHeroSlider } from "@/lib/actions";

export default function NewHeroSliderPage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">New Hero Slider</h1>
            <HeroSliderForm onSubmit={createHeroSlider} />
        </div>
    );
}
