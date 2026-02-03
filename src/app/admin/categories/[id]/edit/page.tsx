import { CategoryForm } from "@/components/admin/category-form";
import { getCategoryById, getCategories } from "@/lib/data";
import { notFound } from "next/navigation";
import { updateCategory } from "@/lib/actions";

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
    const category = await getCategoryById(params.id);
    const categories = await getCategories();

    if (!category) {
        notFound();
    }

    const updateCategoryWithId = updateCategory.bind(null, category.id);

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
            <CategoryForm category={category} categories={categories} onSubmit={updateCategoryWithId} />
        </div>
    );
}
