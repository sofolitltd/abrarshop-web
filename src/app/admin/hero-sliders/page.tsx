import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { getHeroSliders } from "@/lib/data";
import { HeroSlidersTable } from "@/components/admin/hero-sliders-table";

export default async function HeroSlidersPage() {
  const sliders = await getHeroSliders();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Hero Sliders</h1>
        <Button asChild>
          <Link href="/admin/hero-sliders/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Slider
          </Link>
        </Button>
      </div>
      <HeroSlidersTable sliders={sliders} />
    </div>
  );
}
