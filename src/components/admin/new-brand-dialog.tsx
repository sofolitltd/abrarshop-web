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
import { BrandForm } from "./brand-form";
import { createBrand } from "@/lib/actions";

export function NewBrandDialog() {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Brand
                </Button>
            </DialogTrigger>
            <DialogContent
                className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>New Brand</DialogTitle>
                </DialogHeader>
                <BrandForm
                    onSubmit={createBrand}
                    hideCard
                    onSuccess={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
