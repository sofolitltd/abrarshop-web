import { ProductForm } from "@/components/admin/product-form";
import { getProductById, getBrands, getCategories } from "@/lib/data";
import { notFound } from "next/navigation";
import { updateProduct } from "@/lib/actions";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const [product, brands, categories] = await Promise.all([
        getProductById(resolvedParams.id),
        getBrands(),
        getCategories()
    ]);

    if (!product) {
        notFound();
    }

    const updateProductWithId = updateProduct.bind(null, product.id);

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
            <ProductForm
                product={product}
                onSubmit={updateProductWithId}
                brands={brands}
                categories={categories}
            />
        </div>
    );
}
