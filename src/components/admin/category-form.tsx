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
import { X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const categorySchema = z.object({
    name: z.string().min(2, "Category name must be at least 2 characters long."),
    slug: z.string().min(2, "Slug must be at least 2 characters long.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format: only lowercase letters, numbers, and hyphens are allowed.'),
    parentId: z.string().optional(),
    imageUrl: z.any().optional().nullable(),
    isFeatured: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

type CategoryFormProps = {
    category?: Category;
    categories: Category[]; // For parent category dropdown
    onSubmit: (data: any) => Promise<any>;
    hideCard?: boolean;
    onSuccess?: () => void;
};

export function CategoryForm({ category, categories, onSubmit, hideCard = false, onSuccess }: CategoryFormProps) {
    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: category?.name || "",
            slug: category?.slug || "",
            parentId: category?.parentId || undefined,
            imageUrl: category?.imageUrl || null,
            isFeatured: !!category?.isFeatured,
        },
    });

    const { toast } = useToast();
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const isSubmitting = form.formState.isSubmitting || uploadProgress !== null;

    async function handleAction(data: CategoryFormValues) {
        setUploadProgress(0);
        try {
            let imageUrl: any = data.imageUrl;

            if (imageUrl && imageUrl instanceof File) {
                const formData = new FormData();
                formData.append("file", imageUrl);
                setUploadProgress(50);
                const uploadResult = await uploadImage(formData);
                setUploadProgress(100);

                if (uploadResult.success && uploadResult.url) {
                    imageUrl = uploadResult.url;
                } else {
                    toast({
                        variant: "destructive",
                        title: "Upload Failed",
                        description: uploadResult.message || `Could not upload image.`,
                    });
                    form.setError("imageUrl", { message: uploadResult.message || `Could not upload image.` });
                    setUploadProgress(null);
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
            } else {
                onSuccess?.();
            }
        } catch (error: any) {
            if (error.message === 'NEXT_REDIRECT' || error.message?.includes('NEXT_REDIRECT')) {
                setUploadProgress(null);
                onSuccess?.();
                throw error;
            }
            toast({
                variant: "destructive",
                title: "An error occurred",
                description: "Could not save the category.",
            });
        } finally {
            setUploadProgress(null);
        }
    }

    // Filter out the current category from the list of possible parents
    const parentCategoryOptions = categories.filter(c => c.id !== category?.id);

    const formContent = (
        <div className="space-y-4">
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Category Name</FormLabel>
                        <div className="relative group/field">
                            <FormControl>
                                <Input
                                    placeholder="e.g. Electronics"
                                    {...field}
                                    disabled={isSubmitting}
                                    className="pr-8"
                                />
                            </FormControl>
                            {field.value && !isSubmitting && (
                                <button
                                    type="button"
                                    onClick={() => form.setValue("name", "")}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-md hover:bg-muted opacity-0 group-hover/field:opacity-100 transition-opacity"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
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
                                <SelectTrigger className="w-full">
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
                                maxImages={1}
                            />
                        </FormControl>
                        <FormDescription>
                            Recommended size: 250x250 pixels.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isSubmitting}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>
                                Featured Category
                            </FormLabel>
                            <FormDescription>
                                Mark this category as featured to show it on the homepage or special sections.
                            </FormDescription>
                        </div>
                    </FormItem>
                )}
            />
            {hideCard && (
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                        {uploadProgress !== null ? (
                            uploadProgress < 100 ? `Uploading ${Math.round(uploadProgress)}%` : "Saving..."
                        ) : "Save Category"}
                    </Button>
                </div>
            )}
        </div>
    );

    return (
        <Form {...form}>
            <form onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit(handleAction)(e);
            }}>
                {hideCard ? (
                    formContent
                ) : (
                    <Card>
                        <CardContent className="pt-6">
                            {formContent}
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <div className="flex justify-end gap-2 w-full">
                                <Button variant="outline" asChild disabled={isSubmitting}>
                                    <Link href="/admin/categories">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {uploadProgress !== null ? (
                                        uploadProgress < 100 ? `Uploading ${Math.round(uploadProgress)}%` : "Saving..."
                                    ) : "Save Category"}
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                )}
            </form>
        </Form>
    );
}
