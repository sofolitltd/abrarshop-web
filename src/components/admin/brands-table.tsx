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
import { MoreHorizontal, Pencil, Trash2, Search, SlidersHorizontal } from "lucide-react";
import type { Brand } from "@/lib/types";
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
import { deleteBrand, updateBrand } from "@/lib/actions";
import { BrandForm } from "./brand-form";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type BrandsTableProps = {
  brands: Brand[];
};

export function BrandsTable({ brands }: BrandsTableProps) {
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [editBrand, setEditBrand] = React.useState<Brand | null>(null);
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<"name" | "createdAt" | "updatedAt">("createdAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  const filteredBrands = React.useMemo(() => {
    return brands
      .filter((brand) => {
        const query = searchQuery.toLowerCase();
        return brand.name.toLowerCase().includes(query);
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === "name") {
          comparison = a.name.localeCompare(b.name);
        } else if (sortBy === "createdAt") {
          comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        } else if (sortBy === "updatedAt") {
          comparison = new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime();
        }
        return sortOrder === "asc" ? comparison : -comparison;
      });
  }, [brands, searchQuery, sortBy, sortOrder]);

  const handleDelete = () => {
    if (deleteId) {
      startTransition(async () => {
        const result = await deleteBrand(deleteId);
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
            placeholder="Search brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
            const [field, order] = value.split("-") as [any, any];
            setSortBy(field);
            setSortOrder(order);
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">Newest First</SelectItem>
              <SelectItem value="createdAt-asc">Oldest First</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="updatedAt-desc">Recently Updated</SelectItem>
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
              <TableHead>Created at</TableHead>
              <TableHead className="w-[100px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBrands.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No brands found.
                </TableCell>
              </TableRow>
            )}
            {filteredBrands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell>
                  {brand.imageUrl ? (
                    <Image
                      src={brand.imageUrl}
                      alt={brand.name}
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
                <TableCell className="font-medium">{brand.name}</TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">{brand.slug}</TableCell>
                <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                  {brand.createdAt ? new Date(brand.createdAt).toLocaleDateString() : "-"}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditBrand(brand)}
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(brand.id)}
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
              This action cannot be undone. This will permanently delete the brand.
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

      <Dialog open={!!editBrand} onOpenChange={(open) => !open && setEditBrand(null)}>
        <DialogContent
          className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Edit Brand</DialogTitle>
          </DialogHeader>
          {editBrand && (
            <BrandForm
              brand={editBrand}
              onSubmit={(data) => updateBrand(editBrand.id, data)}
              hideCard
              onSuccess={() => setEditBrand(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
