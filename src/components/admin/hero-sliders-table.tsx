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
import { MoreHorizontal, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import type { HeroSlider } from "@/lib/types";
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
import { deleteHeroSlider } from "@/lib/actions";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";

type HeroSlidersTableProps = {
  sliders: HeroSlider[];
};

export function HeroSlidersTable({ sliders }: HeroSlidersTableProps) {
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");

  const filteredSliders = React.useMemo(() => {
    return sliders.filter((slider) => {
      const matchSearch = slider.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = typeFilter === "all" || slider.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [sliders, searchQuery, typeFilter]);

  const handleDelete = () => {
    if (deleteId) {
      startTransition(async () => {
        const result = await deleteHeroSlider(deleteId);
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
            placeholder="Search sliders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="carousel">Carousel</SelectItem>
              <SelectItem value="promo-top">Promo Top</SelectItem>
              <SelectItem value="promo-bottom">Promo Bottom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table className="border-collapse [&_td]:border [&_th]:border">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px] text-center">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-center">Order</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="w-[100px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSliders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No hero sliders found.
                </TableCell>
              </TableRow>
            )}
            {filteredSliders.map((slider) => (
              <TableRow key={slider.id}>
                <TableCell className="p-2">
                  <div className="flex justify-center">
                    <Image
                      src={slider.imageUrl}
                      alt={slider.title}
                      width={80}
                      height={45}
                      className="rounded border object-cover aspect-video"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{slider.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {slider.type.replace('-', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">{slider.displayOrder}</TableCell>
                <TableCell className="text-center">
                  {slider.isActive ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Active</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                      <Link href={`/admin/hero-sliders/${slider.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(slider.id)}
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
              This action cannot be undone. This will permanently delete the hero slider.
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
    </div>
  );
}
