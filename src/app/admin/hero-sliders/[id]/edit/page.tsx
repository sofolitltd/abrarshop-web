import { HeroSliderForm } from "@/components/admin/hero-slider-form";
import { getHeroSliderById } from "@/lib/data";
import { notFound } from "next/navigation";
import { updateHeroSlider } from "@/lib/actions";

export default async function EditHeroSliderPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const slider = await getHeroSliderById(resolvedParams.id);

    if (!slider) {
        notFound();
    }

    const updateHeroSliderWithId = updateHeroSlider.bind(null, slider.id);

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">Edit Hero Slider</h1>
            <HeroSliderForm slider={slider} onSubmit={updateHeroSliderWithId} />
        </div>
    );
}
