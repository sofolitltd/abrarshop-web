"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Brand } from "@/lib/types";
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
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { SlugFormField } from "./slug-form-field";
import { ImageUploader } from "./image-uploader";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/lib/actions";

const brandSchema = z.object({
    name: z.string().min(2, "Brand name must be at least 2 characters long."),
    slug: z.string().min(2, "Slug must be at least 2 characters long.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format: only lowercase letters, numbers, and hyphens are allowed.'),
    imageUrl: z.any().optional().nullable(),
});

type BrandFormValues = z.infer<typeof brandSchema>;

type BrandFormProps = {
    brand?: Brand;
    onSubmit: (data: Omit<BrandFormValues, 'imageUrl'> & { imageUrl: string | null }) => Promise<any>;
};

export function BrandForm({ brand, onSubmit }: BrandFormProps) {
    const form = useForm<BrandFormValues>({
        resolver: zodResolver(brandSchema),
        defaultValues: {
            name: brand?.name || "",
            slug: brand?.slug || "",
            imageUrl: brand?.imageUrl || null,
        },
    });

    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleAction(data: BrandFormValues) {
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

            const finalData = { ...data, imageUrl };
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
                description: "Could not save the brand.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

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
                                    <FormLabel>Brand Name</FormLabel>
                                    <FormControl><Input placeholder="e.g. Nike" {...field} disabled={isSubmitting} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <SlugFormField
                            nameFieldName="name"
                        />
                        <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Brand Image</FormLabel>
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
                                <Link href="/admin/brands">Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save Brand"}
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
}
