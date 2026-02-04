"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { CategoryForm } from "./category-form";
import { createCategory } from "@/lib/actions";
import type { Category } from "@/lib/types";

type NewCategoryDialogProps = {
    categories: Category[];
};

export function NewCategoryDialog({ categories }: NewCategoryDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Category
                </Button>
            </DialogTrigger>
            <DialogContent
                className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>New Category</DialogTitle>
                </DialogHeader>
                <CategoryForm
                    categories={categories}
                    onSubmit={createCategory}
                    hideCard
                    onSuccess={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
