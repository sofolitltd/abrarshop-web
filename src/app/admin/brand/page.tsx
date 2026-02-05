import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { getBrands } from "@/lib/data";
import { BrandsTable } from "@/components/admin/brands-table";
import { NewBrandDialog } from "@/components/admin/new-brand-dialog";

export default async function BrandsPage() {
  const brands = await getBrands();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
        <NewBrandDialog />
      </div>
      <BrandsTable brands={brands} />
    </div>
  );
}
