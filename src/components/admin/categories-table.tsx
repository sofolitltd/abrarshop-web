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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Search, SlidersHorizontal, CornerDownRight } from "lucide-react";
import type { Category } from "@/lib/types";
import Link from "next/link";
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
import { deleteCategory, updateCategory, toggleCategoryFeatured } from "@/lib/actions";
import { CategoryForm } from "./category-form";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type CategoriesTableProps = {
  categories: Category[];
};

export function CategoriesTable({ categories }: CategoriesTableProps) {
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [editCategory, setEditCategory] = React.useState<Category | null>(null);
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<"name" | "createdAt">("name");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  const filteredCategories = React.useMemo(() => {
    const query = searchQuery.toLowerCase();

    // 1. If Searching OR Sorting by Date -> Return Flat List
    if (query || sortBy === "createdAt") {
      return categories.filter((category) => {
        // Filter logic
        if (!query) return true;
        return (
          category.name.toLowerCase().includes(query) ||
          category.parentName?.toLowerCase().includes(query)
        );
      }).sort((a, b) => {
        // Flattened Sort logic
        if (sortBy === "createdAt") {
          // Newest first
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        // Fallback name sort for search results
        return a.name.localeCompare(b.name);
      });
    }

    // 2. Default: Tree View (Name A-Z)
    // Only applied when no search AND sortBy is 'name' (default)

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

    // Flatten Tree for Table
    const flatList: (Category & { level: number })[] = [];

    function traverse(nodes: any[], level: number) {
      // Sort siblings by name (A-Z) - forcing ascending for tree structure consistency
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

  }, [categories, searchQuery, sortBy]);

  const handleDelete = () => {
    if (deleteId) {
      startTransition(async () => {
        const result = await deleteCategory(deleteId);
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
        }
        setDeleteId(null);
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={(value) => {
            // Simplified sort logic: direct mapping
            setSortBy(value as "name" | "createdAt");
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Tree View (A-Z)</SelectItem>
              <SelectItem value="createdAt">Newest First (Flat)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="rounded-md border overflow-hidden">
        <Table className="border-collapse [&_td]:border [&_th]:border">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Parent Category</TableHead>
              <TableHead className="w-[100px] text-center">Featured</TableHead>
              <TableHead>Created at</TableHead>
              <TableHead className="w-[100px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No categories found.
                </TableCell>
              </TableRow>
            )}
            {filteredCategories.map((category) => (
              <TableRow
                key={category.id}
                className={((category as any).level === 0 && !searchQuery && sortBy === "name") ? "bg-muted/30 hover:bg-muted/50" : ""}
              >
                <TableCell>
                  {category.imageUrl ? (
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      width={40}
                      height={40}
                      className="rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center text-muted-foreground text-xs">
                      No img
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2" style={{ paddingLeft: `${((category as any).level || 0) * 24}px` }}>
                    {((category as any).level || 0) > 0 && (
                      <span className="text-muted-foreground/30"><CornerDownRight className="h-4 w-4" /></span>
                    )}
                    <span className={((category as any).level === 0 && !searchQuery && sortBy === "name") ? "font-bold text-foreground" : "text-foreground/80"}>
                      {category.name}
                    </span>
                    {category.isFeatured && (
                      <Badge variant="outline" className="text-[10px] h-4 px-1 bg-amber-50 text-amber-600 border-amber-200">Featured</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">{category.slug}</TableCell>
                <TableCell>
                  {category.parentName ? (
                    <Badge variant="secondary">{category.parentName}</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={category.isFeatured}
                    onCheckedChange={(checked) => {
                      startTransition(async () => {
                        const result = await toggleCategoryFeatured(category.id, checked);
                        if (!result.success) {
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
                        }
                      });
                    }}
                    disabled={isPending}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                  {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : "-"}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditCategory(category)}
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(category.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category.
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

      <Dialog open={!!editCategory} onOpenChange={(open) => !open && setEditCategory(null)}>
        <DialogContent
          className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          {editCategory && (
            <CategoryForm
              category={editCategory}
              categories={categories}
              onSubmit={(data) => updateCategory(editCategory.id, data)}
              hideCard
              onSuccess={() => setEditCategory(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
