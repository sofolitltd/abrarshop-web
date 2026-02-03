
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { HeroSlider } from "@/lib/types";
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ImageUploader } from "./image-uploader";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/lib/actions";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface HeroSliderFormValues {
    title: string;
    subtitle?: string;
    imageUrl: any;
    link?: string;
    displayOrder: number;
    isActive: boolean;
    type: 'carousel' | 'promo-top' | 'promo-bottom';
}

const heroSliderSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters long."),
    subtitle: z.string().optional(),
    imageUrl: z.any().refine(val => val, { message: "Image is required." }),
    link: z.string().optional(),
    displayOrder: z.preprocess((val) => Number(val), z.number().int().default(0)),
    isActive: z.boolean().default(false),
    type: z.enum(['carousel', 'promo-top', 'promo-bottom']).default('carousel'),
});

type HeroSliderFormProps = {
    slider?: HeroSlider;
    onSubmit: (data: Omit<HeroSliderFormValues, 'imageUrl'> & { imageUrl: string }) => Promise<any>;
};

export function HeroSliderForm({ slider, onSubmit }: HeroSliderFormProps) {
    const form = useForm<HeroSliderFormValues>({
        resolver: zodResolver(heroSliderSchema) as any,
        defaultValues: {
            title: slider?.title || "",
            subtitle: slider?.subtitle || "",
            imageUrl: slider?.imageUrl || null,
            link: slider?.link || "",
            displayOrder: slider?.displayOrder || 0,
            isActive: slider?.isActive || false,
            type: slider?.type || "carousel",
        },
    });

    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const { toast } = useToast();
    const isSubmitting = form.formState.isSubmitting || uploadProgress !== null;

    async function handleAction(data: HeroSliderFormValues) {
        setUploadProgress(0);
        try {
            let imageUrl: string | null | File = data.imageUrl;

            if (imageUrl && imageUrl instanceof File) {
                const formData = new FormData();
                formData.append("file", imageUrl);

                // Note: The progress is faked for single file upload for now
                // A more complex implementation would involve a library that supports upload progress
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
            } else if (!imageUrl || typeof imageUrl !== 'string') {
                toast({
                    variant: "destructive",
                    title: "No Image",
                    description: "Please select an image to upload.",
                });
                form.setError("imageUrl", { message: "Image is required." });
                setUploadProgress(null);
                return;
            }

            const finalData = { ...data, imageUrl: imageUrl as string };
            const result = await onSubmit(finalData);

            if (result && result.success === false) {
                form.setError("title", {
                    type: "server",
                    message: result.message,
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "An error occurred",
                description: "Could not save the slider.",
            });
        } finally {
            setUploadProgress(null);
        }
    }

    return (
        <>
            <Dialog open={uploadProgress !== null}>
                <DialogContent onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Saving Slider</DialogTitle>
                        <DialogDescription>
                            {uploadProgress !== null && uploadProgress < 100 ? `Uploading image... ${Math.round(uploadProgress)}%` : 'Finalizing details...'}
                        </DialogDescription>
                    </DialogHeader>
                    <Progress value={uploadProgress} className="w-full" />
                </DialogContent>
            </Dialog>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAction)}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <Card>
                                <CardHeader><CardTitle>Slider Details</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title</FormLabel>
                                                <FormControl><Input placeholder="e.g. New Collection" {...field} disabled={isSubmitting} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="subtitle"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Subtitle</FormLabel>
                                                <FormControl><Textarea placeholder="e.g. Shop the latest trends" {...field} value={field.value ?? ""} disabled={isSubmitting} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="link"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Link URL</FormLabel>
                                                <FormControl><Input placeholder="/products/some-product" {...field} value={field.value ?? ""} disabled={isSubmitting} /></FormControl>
                                                <FormDescription>Where the user should go when they click the slider. e.g., /products</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                        <div className="space-y-8">
                            <Card>
                                <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Banner Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a banner type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="carousel">Carousel Slide</SelectItem>
                                                        <SelectItem value="promo-top">Promo Banner (Top Right)</SelectItem>
                                                        <SelectItem value="promo-bottom">Promo Banner (Bottom Right)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>Select where this banner will be displayed.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="isActive"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel>Active</FormLabel>
                                                    <FormDescription>
                                                        Show this banner on the homepage.
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        disabled={isSubmitting}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="displayOrder"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Display Order</FormLabel>
                                                <FormControl><Input type="number" {...field} disabled={isSubmitting} /></FormControl>
                                                <FormDescription>A lower number will be shown first.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Slider Image</CardTitle></CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="imageUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <ImageUploader
                                                        value={field.value ? [field.value] : []}
                                                        onChange={(images) => field.onChange(images.length > 0 ? images[images.length - 1] : null)}
                                                        disabled={isSubmitting}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Recommended aspect ratio: 16:9 for Carousel, flexible for Promo.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    <CardFooter className="border-t px-0 pt-6 mt-8">
                        <div className="flex justify-end gap-2 w-full">
                            <Button variant="outline" asChild disabled={isSubmitting}>
                                <Link href="/admin/hero-sliders">Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save Slider"}
                            </Button>
                        </div>
                    </CardFooter>
                </form>
            </Form>
        </>
    );
}

