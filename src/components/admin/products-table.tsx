"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, ArrowUpDown, Search } from "lucide-react";
import Image from "next/image";
import type { Product, Category, Brand } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteProduct, deleteMultipleProducts } from "@/lib/actions"; // Import bulk delete
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";


type ProductsTableProps = {
  products: Product[];
  totalPages: number;
  currentPage: number;
  categories: Category[];
  brands: Brand[];
};

export function ProductsTable({ products, totalPages, currentPage, categories, brands }: ProductsTableProps) {
  const [deleteProductId, setDeleteProductId] = React.useState<string | null>(null);
  const [selectedProductIds, setSelectedProductIds] = React.useState<string[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = React.useState(false);
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = React.useState(searchParams.get("query")?.toString() || "");
  const [selectedCategory, setSelectedCategory] = React.useState(searchParams.get("categoryId")?.toString() || "all");
  const [selectedBrand, setSelectedBrand] = React.useState(searchParams.get("brandId")?.toString() || "all");
  const [selectedSort, setSelectedSort] = React.useState(searchParams.get("sortBy")?.toString() || "newest");

  // Sort categories hierarchically (Tree View)
  const sortedCategories = React.useMemo(() => {
    const categoryMap = new Map<string, Category & { children: any[], level: number }>();
    categories.forEach(c => categoryMap.set(c.id, { ...c, children: [], level: 0 }));

    const roots: any[] = [];

    // Build Tree
    categories.forEach(c => {
      const node = categoryMap.get(c.id);
      if (c.parentId && categoryMap.has(c.parentId)) {
        categoryMap.get(c.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    // Flatten Tree
    const flatList: (Category & { level: number })[] = [];

    function traverse(nodes: any[], level: number) {
      nodes.sort((a, b) => a.name.localeCompare(b.name));
      nodes.forEach(node => {
        node.level = level;
        flatList.push(node);
        if (node.children.length > 0) {
          traverse(node.children, level + 1);
        }
      });
    }

    traverse(roots, 0);
    return flatList;
  }, [categories]);

  // Helper to generate pagination URLs preserving existing filters
  const createPageUrl = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  // Debounced search and filters
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams);

      // Check if filters have changed compared to current URL
      const currentQuery = searchParams.get("query") || "";
      const currentCategory = searchParams.get("categoryId") || "all";
      const currentBrand = searchParams.get("brandId") || "all";
      const currentSort = searchParams.get("sortBy") || "newest";

      const hasFilterChanged =
        searchQuery !== currentQuery ||
        selectedCategory !== currentCategory ||
        selectedBrand !== currentBrand ||
        selectedSort !== currentSort;

      if (hasFilterChanged) {
        if (searchQuery) params.set("query", searchQuery);
        else params.delete("query");

        if (selectedCategory && selectedCategory !== "all") params.set("categoryId", selectedCategory);
        else params.delete("categoryId");

        if (selectedBrand && selectedBrand !== "all") params.set("brandId", selectedBrand);
        else params.delete("brandId");

        if (selectedSort && selectedSort !== "newest") params.set("sortBy", selectedSort);
        else params.delete("sortBy");

        params.set("page", "1"); // Only reset to page 1 if actual filters changed

        router.push(`${pathname}?${params.toString()}`);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, selectedBrand, selectedSort, pathname, router, searchParams]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedBrand("all");
    setSelectedSort("newest");
  };
  const handleDelete = () => {
    if (deleteProductId) {
      startTransition(async () => {
        const result = await deleteProduct(deleteProductId);
        if (result?.message.includes("Failed")) {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: result.message,
          });
          // Remove from selection if it was selected
          setSelectedProductIds(prev => prev.filter(id => id !== deleteProductId));
        }
        setDeleteProductId(null);
      });
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedProductIds.length > 0) {
      startTransition(async () => {
        const result = await deleteMultipleProducts(selectedProductIds);
        if (result.success) {
          toast({
            title: "Success",
            description: result.message,
          });
          setSelectedProductIds([]); // Clear selection
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
          });
        }
        setShowBulkDeleteDialog(false);
      });
    }
  };


  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProductIds(products.map((p) => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Container */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative max-w-sm flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {sortedCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <span
                    className={cat.level === 0 ? "font-bold" : ""}
                    dangerouslySetInnerHTML={{ __html: '&nbsp;'.repeat(cat.level * 4) + cat.name }}
                  />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSort} onValueChange={setSelectedSort}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>

          {(searchQuery || selectedCategory !== "all" || selectedBrand !== "all" || selectedSort !== "newest") && (
            <Button variant="ghost" onClick={clearFilters} className="h-9 px-2">
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedProductIds.length > 0 && (
          <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-md border">
            <span className="text-sm font-medium pl-2">{selectedProductIds.length} items selected</span>
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedProductIds([])}
                className="h-8"
              >
                Unselect
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowBulkDeleteDialog(true)}
                disabled={isPending}
                className="h-8 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected
              </Button>
            </div>
          </div>
        )
        }

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[1%] border p-0">
                  <div className="flex justify-center p-[2px]">
                    <Checkbox
                      checked={
                        products.length > 0 &&
                        selectedProductIds.length === products.length
                      }
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      aria-label="Select all"
                    />
                  </div>
                </TableHead>
                <TableHead className="w-[1%] border whitespace-nowrap text-center">SKU</TableHead>
                <TableHead className="w-[1%] border">Image</TableHead>
                <TableHead className="border">Name</TableHead>
                <TableHead className="w-[1%] border whitespace-nowrap">Category</TableHead>
                <TableHead className="w-[1%] border whitespace-nowrap">Brand</TableHead>
                <TableHead className="w-[1%] border text-center whitespace-nowrap min-w-[80px]">Special</TableHead>
                <TableHead className="w-[1%] border text-center whitespace-nowrap min-w-[80px]">Regular</TableHead>
                <TableHead className="w-[1%] border text-center whitespace-nowrap min-w-[80px]">Buy</TableHead>
                <TableHead className="w-[1%] border text-center whitespace-nowrap">Stock</TableHead>
                <TableHead className="w-[1%] border text-center whitespace-nowrap">Dis(%)</TableHead>
                <TableHead className="w-[1%] border text-center whitespace-nowrap">Publish</TableHead>
                <TableHead className="w-[1%] border"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={12} className="h-24 text-center">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
              {products.map((product) => (
                <TableRow key={product.id} data-state={selectedProductIds.includes(product.id) && "selected"}>
                  <TableCell className="border p-0">
                    <div className="flex justify-center p-[2px]">
                      <Checkbox
                        checked={selectedProductIds.includes(product.id)}
                        onCheckedChange={() => handleSelectProduct(product.id)}
                        aria-label={`Select ${product.name}`}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="border whitespace-nowrap text-center">{product.sku || '-'}</TableCell>
                  <TableCell className="border">
                    <div className="flex justify-center">
                      <div className="h-10 w-10 relative overflow-hidden rounded-md">
                        {product.images && product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex flex-col items-center justify-center text-[8px] uppercase font-bold leading-none text-muted-foreground">
                            <span>No</span>
                            <span>img</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium border min-w-[150px]">
                    <div className="flex flex-col">
                      <span>{product.name}</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.isFeatured && <Badge variant="outline" className="text-[10px] h-4 px-1">Featured</Badge>}
                        {product.isTrending && <Badge variant="secondary" className="text-[10px] h-4 px-1">Trending</Badge>}
                        {product.isBestSelling && <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none text-[10px] h-4 px-1">Best Seller</Badge>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="border whitespace-nowrap">
                    {product.category}
                  </TableCell>
                  <TableCell className="border whitespace-nowrap">
                    {product.brand}
                  </TableCell>
                  <TableCell className="border font-semibold text-center whitespace-nowrap min-w-[80px]">
                    {product.price.toFixed(0)}
                  </TableCell>
                  <TableCell className="border text-muted-foreground text-center whitespace-nowrap min-w-[80px]">
                    {product.originalPrice ? product.originalPrice.toFixed(0) : '-'}
                  </TableCell>
                  <TableCell className="border text-center text-muted-foreground whitespace-nowrap min-w-[80px]">
                    {product.buyPrice ? product.buyPrice.toFixed(0) : '-'}
                  </TableCell>
                  <TableCell className="border text-center whitespace-nowrap">{product.stock}</TableCell>
                  <TableCell className="border text-center whitespace-nowrap">
                    {product.discount}%
                  </TableCell>
                  <TableCell className="border text-center whitespace-nowrap">
                    <Badge variant={product.status === 'published' ? 'default' : 'secondary'}>
                      {product.status === 'published' ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="border">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/products/${product.id}/edit`} className="flex items-center gap-2">
                            <Pencil className="h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteProductId(product.id)} className="flex items-center gap-2 text-destructive focus:text-destructive">
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {
          totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={currentPage > 1 ? createPageUrl(currentPage - 1) : '#'}
                    aria-disabled={currentPage <= 1}
                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {/* Smart Pagination Logic */}
                {(() => {
                  const pages = [];
                  const maxVisible = 7; // Max buttons to show including ellipsis

                  if (totalPages <= maxVisible) {
                    // Show all pages if total is small
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    // Always show first, last, current, and neighbors
                    const showStart = currentPage <= 4;
                    const showEnd = currentPage >= totalPages - 3;

                    if (showStart) {
                      for (let i = 1; i <= 5; i++) pages.push(i);
                      pages.push('ellipsis');
                      pages.push(totalPages);
                    } else if (showEnd) {
                      pages.push(1);
                      pages.push('ellipsis');
                      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      pages.push('ellipsis');
                      pages.push(currentPage - 1);
                      pages.push(currentPage);
                      pages.push(currentPage + 1);
                      pages.push('ellipsis');
                      pages.push(totalPages);
                    }
                  }

                  return pages.map((page, i) => {
                    if (page === 'ellipsis') {
                      return (
                        <PaginationItem key={`ellipsis-${i}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }

                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href={createPageUrl(page)}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  });
                })()}

                <PaginationItem>
                  <PaginationNext
                    href={createPageUrl(currentPage + 1)}
                    aria-disabled={currentPage >= totalPages}
                    className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )
        }

        <AlertDialog open={!!deleteProductId} onOpenChange={(open) => !open && setDeleteProductId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the product.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
                {isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {selectedProductIds.length} products?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete {selectedProductIds.length} selected product{selectedProductIds.length > 1 ? 's' : ''}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleBulkDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
                {isPending ? "Deleting..." : "Delete All"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

