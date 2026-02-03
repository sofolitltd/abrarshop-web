
"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Product, Brand, Category } from "@/lib/types";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { X, Plus } from "lucide-react";
import { DescriptionEnhancer } from "./description-enhancer";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { createCategoryJson, createBrandJson, uploadImage } from "@/lib/actions";
import { SlugFormField } from "./slug-form-field";
import { Switch } from "@/components/ui/switch";
import { ImageUploader } from "./image-uploader";
import { Progress } from "@/components/ui/progress";

interface ProductFormValues {
    name: string;
    slug: string;
    sku: string | null;
    description: string;
    price: number;
    originalPrice: number | null;
    buyPrice: number | null;
    stock: number;
    categoryId: string;
    brandId: string;
    keywords: string[];
    images: any[];
    isTrending: boolean;
    isBestSelling: boolean;
    isFeatured: boolean;
}
const productFormSchema = z.object({
    name: z.string().min(3, "Product name must be at least 3 characters long."),
    slug: z.string().min(3, "Slug must be at least 3 characters long."),
    sku: z.string().nullable().optional(),
    description: z.string().min(10, "Description must be at least 10 characters long."),
    price: z.preprocess((val) => Number(val), z.number().min(0)),
    originalPrice: z.preprocess((val) => (val === null || val === "" ? null : Number(val)), z.number().min(0).nullable()),
    buyPrice: z.preprocess((val) => (val === null || val === "" ? null : Number(val)), z.number().min(0).nullable()),
    stock: z.preprocess((val) => Number(val), z.number().int().min(0)),
    categoryId: z.string().min(1, "Category is required."),
    brandId: z.string().min(1, "Brand is required."),
    keywords: z.array(z.string()).default([]),
    images: z.array(z.any()).default([]),
    isTrending: z.boolean().default(false),
    isBestSelling: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
});

const quickBrandSchema = z.object({
    name: z.string().min(2, "Brand name must be at least 2 characters long."),
});

const quickCategorySchema = z.object({
    name: z.string().min(2, "Category name must be at least 2 characters long."),
    parentId: z.string().optional(),
});


type ProductFormProps = {
    product?: Product;
    brands: Brand[];
    categories: Category[];
    onSubmit: (data: Omit<ProductFormValues, 'images'> & { images: string[] }) => Promise<any>;
};

export function ProductForm({ product, brands: initialBrands, categories: initialCategories, onSubmit }: ProductFormProps) {
    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema) as any,
        defaultValues: {
            name: product?.name || "",
            slug: product?.slug ?? "",
            sku: product?.sku || "",
            description: product?.description || "",
            price: product?.price || 0,
            originalPrice: product?.originalPrice ?? null,
            buyPrice: product?.buyPrice ?? null,
            stock: product?.stock || 0,
            categoryId: product?.categoryId || "",
            brandId: product?.brandId || "",
            keywords: product?.keywords || [],
            images: product?.images || [],
            isTrending: product?.isTrending || false,
            isBestSelling: product?.isBestSelling || false,
            isFeatured: product?.isFeatured || false,
        },
    });

    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [localBrands, setLocalBrands] = useState<Brand[]>(initialBrands);
    const [localCategories, setLocalCategories] = useState<Category[]>(initialCategories);
    const [isBrandDialogOpen, setBrandDialogOpen] = useState(false);
    const [isCategoryDialogOpen, setCategoryDialogOpen] = useState(false);
    const { toast } = useToast();

    const watchedName = useWatch({ control: form.control, name: "name" });
    const watchedDescription = useWatch({ control: form.control, name: "description" });
    const isSubmitting = form.formState.isSubmitting || uploadProgress !== null;

    async function handleAction(data: ProductFormValues) {
        const filesToUpload: File[] = data.images?.filter((img): img is File => img instanceof File) || [];

        setUploadProgress(0);

        try {
            const uploadedUrls = new Map<File, string>();
            if (filesToUpload.length > 0) {
                for (let i = 0; i < filesToUpload.length; i++) {
                    const file = filesToUpload[i];
                    const formData = new FormData();
                    formData.append("file", file);
                    const result = await uploadImage(formData);

                    if (result.success && result.url) {
                        uploadedUrls.set(file, result.url);
                        setUploadProgress(((i + 1) / filesToUpload.length) * 100);
                    } else {
                        toast({
                            variant: "destructive",
                            title: "Upload Failed",
                            description: result.message || `Could not upload image: ${file.name}.`,
                        });
                        setUploadProgress(null);
                        return;
                    }
                }
            }

            const finalImageUrls = (data.images || []).map(img => {
                if (typeof img === 'string') return img;
                return uploadedUrls.get(img as File) || '';
            }).filter(Boolean);

            if (finalImageUrls.length === 0) {
                finalImageUrls.push('https://placehold.co/600x400?text=No+Image');
            }

            const finalProductData = {
                ...data,
                images: finalImageUrls,
            };

            const result = await onSubmit(finalProductData);

            if (result && result.success === false) {
                form.setError("name", {
                    type: "server",
                    message: result.message,
                });
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast({
                variant: "destructive",
                title: "An error occurred",
                description: "Could not save the product.",
            });
        } finally {
            setUploadProgress(null);
        }
    }

    const handleApplyAiData = ({ description, keywords }: { description: string; keywords: string[] }) => {
        form.setValue("description", description, { shouldValidate: true });
        form.setValue("keywords", keywords, { shouldValidate: true });
    };

    const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newKeyword = e.currentTarget.value.trim();
            if (newKeyword && !form.getValues('keywords')?.includes(newKeyword)) {
                form.setValue('keywords', [...(form.getValues('keywords') || []), newKeyword]);
            }
            e.currentTarget.value = '';
        }
    };

    const removeKeyword = (keywordToRemove: string) => {
        form.setValue('keywords', form.getValues('keywords')?.filter(k => k !== keywordToRemove));
    };

    const brandForm = useForm<z.infer<typeof quickBrandSchema>>({
        resolver: zodResolver(quickBrandSchema),
        defaultValues: { name: "" },
    });

    const onBrandSubmit = brandForm.handleSubmit(async (data) => {
        const result = await createBrandJson(data);
        if (result.success && result.brand) {
            setLocalBrands((prev) => [...prev, result.brand!]);
            form.setValue("brandId", result.brand!.id, { shouldValidate: true });
            setBrandDialogOpen(false);
            brandForm.reset();
            toast({ title: "Brand created", description: `"${result.brand.name}" has been added.` });
        } else {
            brandForm.setError("name", { type: "server", message: result.message || "Failed to create brand." });
        }
    });

    const categoryForm = useForm<z.infer<typeof quickCategorySchema>>({
        resolver: zodResolver(quickCategorySchema),
        defaultValues: { name: "", parentId: "none" },
    });

    const onCategorySubmit = categoryForm.handleSubmit(async (data) => {
        const result = await createCategoryJson(data);
        if (result.success && result.category) {
            setLocalCategories((prev) => [...prev, result.category!]);
            form.setValue("categoryId", result.category!.id, { shouldValidate: true });
            setCategoryDialogOpen(false);
            categoryForm.reset();
            toast({ title: "Category created", description: `"${result.category.name}" has been added.` });
        } else {
            categoryForm.setError("name", { type: "server", message: result.message || "Failed to create category." });
        }
    });


    return (
        <>
            <Dialog open={uploadProgress !== null}>
                <DialogContent onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Saving Product</DialogTitle>
                        <DialogDescription>
                            {uploadProgress !== null && uploadProgress < 100 ? 'Uploading images, please wait...' : 'Finalizing product details...'}
                        </DialogDescription>
                    </DialogHeader>
                    <Progress value={uploadProgress} className="w-full" />
                </DialogContent>
            </Dialog>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAction)} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <Card>
                                <CardHeader><CardTitle>Product Details</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Product Name</FormLabel>
                                                <FormControl><Input placeholder="e.g. Wireless Headphones" {...field} disabled={isSubmitting} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <SlugFormField
                                        nameFieldName="name"
                                    />
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center justify-between">
                                                    <FormLabel>Description</FormLabel>
                                                    <DescriptionEnhancer
                                                        productName={watchedName}
                                                        currentDescription={watchedDescription}
                                                        onApply={handleApplyAiData}
                                                    />
                                                </div>
                                                <FormControl><Textarea rows={5} placeholder="Describe the product..." {...field} disabled={isSubmitting} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Images</CardTitle></CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="images"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <ImageUploader
                                                        value={field.value || []}
                                                        onChange={field.onChange}
                                                        disabled={isSubmitting}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                        <div className="space-y-8">
                            <Card>
                                <CardHeader><CardTitle>Status</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="isFeatured"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel>Featured Product</FormLabel>
                                                    <FormDescription>
                                                        Show on the main "Featured" grid on the homepage.
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
                                        name="isTrending"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel>New Trend</FormLabel>
                                                    <FormDescription>
                                                        Feature this product in the "New Trends" section.
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
                                        name="isBestSelling"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel>Best Seller</FormLabel>
                                                    <FormDescription>
                                                        Feature this product in the "Best Selling" section.
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
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Pricing & Inventory</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="price"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Selling Price</FormLabel>
                                                    <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} disabled={isSubmitting} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="originalPrice"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Compare-at Price</FormLabel>
                                                    <FormControl><Input type="number" step="0.01" placeholder="e.g. 120.00" {...field} value={field.value ?? ""} disabled={isSubmitting} /></FormControl>
                                                    <FormDescription>Optional. Shows a strikethrough.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="buyPrice"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Buy Price</FormLabel>
                                                    <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value ?? ""} disabled={isSubmitting} /></FormControl>
                                                    <FormDescription>Internal use only.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="stock"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Stock</FormLabel>
                                                    <FormControl><Input type="number" placeholder="0" {...field} disabled={isSubmitting} /></FormControl>
                                                    <FormDescription>&nbsp;</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="categoryId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category</FormLabel>
                                                <div className="flex items-center gap-2">
                                                    <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a category" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {localCategories.map((cat) => (
                                                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Dialog open={isCategoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                                                        <DialogTrigger asChild>
                                                            <Button type="button" variant="outline" size="icon" aria-label="Add new category" disabled={isSubmitting}><Plus className="h-4 w-4" /></Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader><DialogTitle>New Category</DialogTitle></DialogHeader>
                                                            <Form {...categoryForm}>
                                                                <form onSubmit={onCategorySubmit} className="space-y-4 pt-4">
                                                                    <FormField control={categoryForm.control} name="name" render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel>Category Name</FormLabel>
                                                                            <FormControl><Input placeholder="e.g. Electronics" {...field} /></FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )} />
                                                                    <FormField control={categoryForm.control} name="parentId" render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel>Parent Category</FormLabel>
                                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                                <FormControl>
                                                                                    <SelectTrigger>
                                                                                        <SelectValue placeholder="Select a parent category (optional)" />
                                                                                    </SelectTrigger>
                                                                                </FormControl>
                                                                                <SelectContent>
                                                                                    <SelectItem value="none">No Parent</SelectItem>
                                                                                    {localCategories.map((cat) => (
                                                                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                                                                    ))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )} />
                                                                    <CardFooter className="px-0 pt-4">
                                                                        <div className="flex justify-end gap-2 w-full">
                                                                            <Button type="button" variant="ghost" onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
                                                                            <Button type="submit" disabled={categoryForm.formState.isSubmitting}>
                                                                                {categoryForm.formState.isSubmitting ? "Creating..." : "Create Category"}
                                                                            </Button>
                                                                        </div>
                                                                    </CardFooter>
                                                                </form>
                                                            </Form>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="brandId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Brand</FormLabel>
                                                <div className="flex items-center gap-2">
                                                    <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a brand" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {localBrands.map((brand) => (
                                                                <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Dialog open={isBrandDialogOpen} onOpenChange={setBrandDialogOpen}>
                                                        <DialogTrigger asChild>
                                                            <Button type="button" variant="outline" size="icon" aria-label="Add new brand" disabled={isSubmitting}><Plus className="h-4 w-4" /></Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader><DialogTitle>New Brand</DialogTitle></DialogHeader>
                                                            <Form {...brandForm}>
                                                                <form onSubmit={onBrandSubmit} className="space-y-4 pt-4">
                                                                    <FormField control={brandForm.control} name="name" render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel>Brand Name</FormLabel>
                                                                            <FormControl><Input placeholder="e.g. Nike" {...field} /></FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )} />
                                                                    <CardFooter className="px-0 pt-4">
                                                                        <div className="flex justify-end gap-2 w-full">
                                                                            <Button type="button" variant="ghost" onClick={() => setBrandDialogOpen(false)}>Cancel</Button>
                                                                            <Button type="submit" disabled={brandForm.formState.isSubmitting}>
                                                                                {brandForm.formState.isSubmitting ? "Creating..." : "Create Brand"}
                                                                            </Button>
                                                                        </div>
                                                                    </CardFooter>
                                                                </form>
                                                            </Form>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="sku"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>SKU (Stock Keeping Unit)</FormLabel>
                                                <FormControl><Input placeholder="e.g. PROD-12345" {...field} value={field.value ?? ""} disabled={isSubmitting} /></FormControl>
                                                <FormDescription>Optional unique product identifier.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="keywords"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Keywords / Tags</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Add a keyword and press Enter"
                                                        onKeyDown={handleKeywordKeyDown}
                                                        disabled={isSubmitting}
                                                    />
                                                </FormControl>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {field.value?.map((keyword) => (
                                                        <Badge key={keyword} variant="secondary">
                                                            {keyword}
                                                            <button type="button" onClick={() => removeKeyword(keyword)} className="ml-1 rounded-full p-0.5 hover:bg-destructive/20" disabled={isSubmitting}>
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" asChild type="button">
                            <Link href="/admin/products">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Product"}
                        </Button>
                    </div>
                </form>
            </Form>
        </>
    );
}
