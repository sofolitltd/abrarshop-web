"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { SlugFormField } from "./slug-form-field";
import { ImageUploader } from "./image-uploader";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/lib/actions";

const categorySchema = z.object({
    name: z.string().min(2, "Category name must be at least 2 characters long."),
    slug: z.string().min(2, "Slug must be at least 2 characters long.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format: only lowercase letters, numbers, and hyphens are allowed.'),
    parentId: z.string().optional(),
    imageUrl: z.any().optional().nullable(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

type CategoryFormProps = {
    category?: Category;
    categories: Category[]; // For parent category dropdown
    onSubmit: (data: Omit<CategoryFormValues, 'imageUrl'> & { imageUrl: string | null }) => Promise<any>;
};

export function CategoryForm({ category, categories, onSubmit }: CategoryFormProps) {
    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: category?.name || "",
            slug: category?.slug || "",
            parentId: category?.parentId || undefined,
            imageUrl: category?.imageUrl || null,
        },
    });

    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleAction(data: CategoryFormValues) {
        setIsSubmitting(true);
        try {
            let imageUrl: any = data.imageUrl;

            if (imageUrl && imageUrl instanceof File) {
                const formData = new FormData();
                formData.append("file", imageUrl);
                const uploadResult = await uploadImage(formData);

                if (uploadResult.success && uploadResult.url) {
                    imageUrl = uploadResult.url;
                } else {
                    toast({
                        variant: "destructive",
                        title: "Upload Failed",
                        description: uploadResult.message || `Could not upload image.`,
                    });
                    form.setError("imageUrl", { message: uploadResult.message || `Could not upload image.` });
                    setIsSubmitting(false);
                    return;
                }
            }

            const finalData = { ...data, imageUrl, parentId: data.parentId === 'none' ? undefined : data.parentId };
            const result = await onSubmit(finalData);

            if (result && result.success === false) {
                form.setError("name", {
                    type: "server",
                    message: result.message,
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "An error occurred",
                description: "Could not save the category.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    // Filter out the current category from the list of possible parents
    const parentCategoryOptions = categories.filter(c => c.id !== category?.id);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAction)}>
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category Name</FormLabel>
                                    <FormControl><Input placeholder="e.g. Electronics" {...field} disabled={isSubmitting} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <SlugFormField
                            nameFieldName="name"
                        />
                        <FormField
                            control={form.control}
                            name="parentId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Parent Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a parent category (optional)" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">No Parent</SelectItem>
                                            {parentCategoryOptions.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category Image</FormLabel>
                                    <FormControl>
                                        <ImageUploader
                                            value={field.value ? [field.value] : []}
                                            onChange={(images) => field.onChange(images.length > 0 ? images[images.length - 1] : null)}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Recommended size: 200x200 pixels.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <div className="flex justify-end gap-2 w-full">
                            <Button variant="outline" asChild disabled={isSubmitting}>
                                <Link href="/admin/categories">Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save Category"}
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
}
