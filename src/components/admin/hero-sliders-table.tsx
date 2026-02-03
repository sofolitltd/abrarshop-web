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

type HeroSlidersTableProps = {
  sliders: HeroSlider[];
};

export function HeroSlidersTable({ sliders }: HeroSlidersTableProps) {
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();

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
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sliders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No hero sliders found.
                </TableCell>
              </TableRow>
            )}
            {sliders.map((slider) => (
              <TableRow key={slider.id}>
                <TableCell>
                  <Image
                      src={slider.imageUrl}
                      alt={slider.title}
                      width={100}
                      height={50}
                      className="rounded-md object-cover aspect-video"
                  />
                </TableCell>
                <TableCell className="font-medium">{slider.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {slider.type.replace('-', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>{slider.displayOrder}</TableCell>
                <TableCell>
                    {slider.isActive ? (
                        <Badge><CheckCircle className="mr-1 h-3 w-3" /> Active</Badge>
                    ) : (
                        <Badge variant="secondary"><XCircle className="mr-1 h-3 w-3" /> Inactive</Badge>
                    )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/hero-sliders/${slider.id}/edit`} className="flex items-center gap-2">
                           <Pencil className="h-4 w-4" /> Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteId(slider.id)} className="flex items-center gap-2 text-destructive focus:text-destructive">
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
    </>
  );
}
