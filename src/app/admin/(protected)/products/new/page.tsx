import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "@/lib/actions";
import { getBrands, getCategories } from "@/lib/data";

export default async function NewProductPage() {
    const [brands, categories] = await Promise.all([
        getBrands(),
        getCategories()
    ]);

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">New Product</h1>
            <ProductForm 
                onSubmit={createProduct}
                brands={brands}
                categories={categories}
            />
        </div>
    );
}
