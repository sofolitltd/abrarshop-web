import { ProductForm } from "@/components/admin/product-form";
import { getProductById, getBrands, getCategories } from "@/lib/data";
import { notFound } from "next/navigation";
import { updateProduct } from "@/lib/actions";

export default async function EditProductPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const returnTo = typeof resolvedSearchParams.returnTo === 'string' ? resolvedSearchParams.returnTo : null;

    const [product, brands, categories] = await Promise.all([
        getProductById(resolvedParams.id),
        getBrands(),
        getCategories()
    ]);

    if (!product) {
        notFound();
    }

    const updateProductWithId = updateProduct.bind(null, product.id, returnTo);

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
            <ProductForm
                product={product}
                onSubmit={updateProductWithId}
                brands={brands}
                categories={categories}
                cancelHref={returnTo || "/admin/products"}
            />
        </div>
    );
}
