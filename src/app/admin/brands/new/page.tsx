import { BrandForm } from "@/components/admin/brand-form";
import { createBrand } from "@/lib/actions";

export default function NewBrandPage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">New Brand</h1>
            <BrandForm onSubmit={createBrand} />
        </div>
    );
}
