import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { getProducts, getCategories, getBrands } from "@/lib/data";
import { ProductsTable } from "@/components/admin/products-table";
import { ProductStatisticsDialog } from "@/components/admin/product-statistics-dialog";

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
      status: null,
    }),
    getCategories(),
    getBrands(),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Products ({totalCount})</h1>
        <div className="flex items-center gap-2 shrink-0">
          <ProductStatisticsDialog />
          <Button asChild className="shrink-0">
            <Link href="/admin/products/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">New Product</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </Button>
        </div>
      </div>
      <div className="min-w-0">
        <ProductsTable
          products={products}
          totalPages={totalPages}
          currentPage={page}
          categories={categories}
          brands={brands}
        />
      </div>
    </div>
  );
}
