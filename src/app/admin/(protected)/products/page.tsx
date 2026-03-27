import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { getProducts, getCategories, getBrands } from "@/lib/data";
import { ProductsTable } from "@/components/admin/products-table";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams;
  const page = typeof resolvedSearchParams.page === 'string' ? Number(resolvedSearchParams.page) : 1;
  const query = typeof resolvedSearchParams.query === 'string' ? resolvedSearchParams.query : undefined;
  const categoryId = typeof resolvedSearchParams.categoryId === 'string' ? resolvedSearchParams.categoryId : undefined;
  const brandId = typeof resolvedSearchParams.brandId === 'string' ? resolvedSearchParams.brandId : undefined;
  const sortBy = typeof resolvedSearchParams.sortBy === 'string' ? resolvedSearchParams.sortBy : 'newest';
  const limit = 25;

  const [
    { products, totalCount },
    categories,
    brands
  ] = await Promise.all([
    getProducts({
      query,
      page,
      limit,
      sortBy,
      categoryId,
      brandId,
    }),
    getCategories(),
    getBrands(),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Products ({totalCount})</h1>
        <Button asChild>
          <Link href="/admin/products/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Product
          </Link>
        </Button>
      </div>
      <ProductsTable
        products={products}
        totalPages={totalPages}
        currentPage={page}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}
