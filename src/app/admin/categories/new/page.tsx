import { CategoryForm } from "@/components/admin/category-form";
import { createCategory } from "@/lib/actions";
import { getCategories } from "@/lib/data";

export default async function NewCategoryPage() {
    const categories = await getCategories();
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">New Category</h1>
            <CategoryForm categories={categories} onSubmit={createCategory} />
        </div>
    );
}
