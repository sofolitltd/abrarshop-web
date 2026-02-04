import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { getCategories } from "@/lib/data";
import { CategoriesTable } from "@/components/admin/categories-table";
import { NewCategoryDialog } from "@/components/admin/new-category-dialog";

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <NewCategoryDialog categories={categories} />
      </div>
      <CategoriesTable categories={categories} />
    </div>
  );
}
