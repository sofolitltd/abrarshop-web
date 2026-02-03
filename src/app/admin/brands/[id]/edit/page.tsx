import { BrandForm } from "@/components/admin/brand-form";
import { getBrandById } from "@/lib/data";
import { notFound } from "next/navigation";
import { updateBrand } from "@/lib/actions";

export default async function EditBrandPage({ params }: { params: { id: string } }) {
    const brand = await getBrandById(params.id);

    if (!brand) {
        notFound();
    }

    const updateBrandWithId = updateBrand.bind(null, brand.id);

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">Edit Brand</h1>
            <BrandForm brand={brand} onSubmit={updateBrandWithId} />
        </div>
    );
}
