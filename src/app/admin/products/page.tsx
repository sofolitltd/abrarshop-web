import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { getProducts } from "@/lib/data";
import { ProductsTable } from "@/components/admin/products-table";

export default async function ProductsPage() {
  const { products } = await getProducts();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <Button asChild>
          <Link href="/admin/products/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Product
          </Link>
        </Button>
      </div>
      <ProductsTable products={products} />
    </div>
  );
}
