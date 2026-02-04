
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
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { createCategoryJson, createBrandJson, uploadImage, getLatestSku, checkProductSku, checkProductSlug } from "@/lib/actions";
import { SlugFormField } from "./slug-form-field";
import { Switch } from "@/components/ui/switch";
import { ImageUploader } from "./image-uploader";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CategoryForm } from "./category-form";
import { BrandForm } from "./brand-form";

interface ProductFormValues {
    name: string;
    slug: string;
    sku: number | null;
    description: string;
    price: number;
    originalPrice: number | null;
    buyPrice: number | null;
    stock: number;
    discount: number;
    categoryId: string;
    brandId: string;
    keywords: string[];
    images: any[];
    isTrending: boolean;
    isBestSelling: boolean;
    isFeatured: boolean;
    status: "draft" | "published";
}
const productFormSchema = z.object({
    name: z.string().min(3, "Product name must be at least 3 characters long."),
    slug: z.string().min(3, "Slug must be at least 3 characters long."),
    sku: z.preprocess((val) => (val === "" || val === null ? null : Number(val)), z.number().int("SKU must be a whole number.").min(1, "SKU is required.")),
    // Description is no longer required
    description: z.string().optional(),
    price: z.preprocess((val) => Number(val), z.number().min(0)),
    // Regular price is optional
    originalPrice: z.preprocess((val) => (val === "" || val === null ? null : Number(val)), z.number().min(0).nullable().optional()),
    buyPrice: z.preprocess((val) => (val === null || val === "" ? null : Number(val)), z.number().min(0).nullable()),
    // Stock is required
    stock: z.preprocess((val) => Number(val), z.number().int().min(0, "Stock cannot be negative")),
    discount: z.preprocess((val) => (val === null || val === "" ? 0 : Number(val)), z.number().min(0)).default(0),
    // Category and Brand are optional
    categoryId: z.string().optional(),
    brandId: z.string().optional(),
    keywords: z.array(z.string()).default([]),
    images: z.array(z.any()).default([]),
    isTrending: z.boolean().default(false),
    isBestSelling: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
    status: z.enum(["draft", "published"]).default("published"),
}).superRefine((data, ctx) => {
    // Validating that Regular Price > Sale Price (assuming Sale Price is 'price')
    if (data.originalPrice != null && data.originalPrice < data.price) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Must be higher/equal than the special price.",
            path: ["originalPrice"],
        });
    }
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
            sku: product?.sku ?? null,
            description: product?.description || "",
            price: product?.price || 0,
            originalPrice: product?.originalPrice ?? null,
            buyPrice: product?.buyPrice ?? null,
            stock: product?.stock || 0,
            discount: (product as any)?.discount || 0,
            categoryId: product?.categoryId || "",
            brandId: product?.brandId || "",
            keywords: product?.keywords || [],
            images: product?.images || [],
            isTrending: product?.isTrending || false,
            isBestSelling: product?.isBestSelling || false,
            isFeatured: product?.isFeatured || false,
            status: (product as any)?.status || "published",
        },
    });

    // Auto-generate SKU for new products
    useEffect(() => {
        if (!product?.sku) {
            getLatestSku().then((latestSku) => {
                let nextSku = 1;
                if (latestSku) {
                    nextSku = Number(latestSku) + 1;
                }
                form.setValue("sku", nextSku);
            });
        }
    }, [product?.sku, form]);

    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [currentUploadIndex, setCurrentUploadIndex] = useState<number>(0);
    const [totalFilesToUpload, setTotalFilesToUpload] = useState<number>(0);
    const [localBrands, setLocalBrands] = useState<Brand[]>(initialBrands);
    const [localCategories, setLocalCategories] = useState<Category[]>(initialCategories);

    // Sort categories hierarchically
    const sortedCategories = useMemo(() => {
        const categoryMap = new Map<string, Category & { children: any[], level: number }>();
        localCategories.forEach(c => categoryMap.set(c.id, { ...c, children: [], level: 0 }));

        const roots: any[] = [];

        // Build Tree
        localCategories.forEach(c => {
            const node = categoryMap.get(c.id);
            if (c.parentId && categoryMap.has(c.parentId)) {
                categoryMap.get(c.parentId)!.children.push(node);
            } else {
                roots.push(node);
            }
        });

        // Flatten Tree
        const flatList: (Category & { level: number })[] = [];

        function traverse(nodes: any[], level: number) {
            nodes.sort((a, b) => a.name.localeCompare(b.name));
            nodes.forEach(node => {
                node.level = level;
                flatList.push(node);
                if (node.children.length > 0) {
                    traverse(node.children, level + 1);
                }
            });
        }

        traverse(roots, 0);
        return flatList;
    }, [localCategories]);
    const [isBrandDialogOpen, setBrandDialogOpen] = useState(false);
    const [isCategoryDialogOpen, setCategoryDialogOpen] = useState(false);
    const { toast } = useToast();

    const watchedName = useWatch({ control: form.control, name: "name" });
    const watchedDescription = useWatch({ control: form.control, name: "description" });
    const isSubmitting = form.formState.isSubmitting || uploadProgress !== null;

    async function handleAction(data: ProductFormValues) {
        // Validate Slug and SKU uniqueness before uploading
        const isNewProduct = !product;

        if (data.sku && (isNewProduct || data.sku !== product?.sku)) {
            const skuCheck = await checkProductSku(data.sku, product?.id);
            if (!skuCheck.isUnique) {
                form.setError("sku", { type: "manual", message: skuCheck.message });
                toast({
                    variant: "destructive",
                    title: "Invalid SKU",
                    description: skuCheck.message,
                });
                return;
            }
        }

        if (data.slug && (isNewProduct || data.slug !== product?.slug)) {
            const slugCheck = await checkProductSlug(data.slug, product?.id);
            if (!slugCheck.isUnique) {
                form.setError("slug", { type: "manual", message: slugCheck.message });
                toast({
                    variant: "destructive",
                    title: "Invalid Slug",
                    description: slugCheck.message,
                });
                return;
            }
        }

        const filesToUpload: File[] = data.images?.filter((img): img is File => img instanceof File) || [];

        if (filesToUpload.length > 0) {
            setTotalFilesToUpload(filesToUpload.length);
            setCurrentUploadIndex(0);
            setUploadProgress(0);
        } else {
            // Show "Finalizing..." immediately if there are no images to specific upload
            setTotalFilesToUpload(0);
            setCurrentUploadIndex(0);
            setUploadProgress(100);
        }

        try {
            const uploadedUrls = new Map<File, string>();
            if (filesToUpload.length > 0) {
                for (let i = 0; i < filesToUpload.length; i++) {
                    const file = filesToUpload[i];
                    setCurrentUploadIndex(i + 1);
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

            const finalProductData = {
                name: data.name,
                slug: data.slug,
                sku: Number(data.sku),
                description: data.description || "",
                price: Number(data.price),
                originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
                buyPrice: data.buyPrice ? Number(data.buyPrice) : null,
                stock: Number(data.stock),
                discount: Number(data.discount),
                categoryId: data.categoryId,
                brandId: data.brandId,
                keywords: data.keywords,
                images: finalImageUrls,
                isTrending: !!data.isTrending,
                isBestSelling: !!data.isBestSelling,
                isFeatured: !!data.isFeatured,
                status: data.status,
            };

            const result = await onSubmit(finalProductData as any);

            if (result && result.success === false) {
                setUploadProgress(null); // Close dialog on error
                if (result.errors) {
                    // Start checking for specific field errors
                    if (result.errors.name) {
                        form.setError("name", { type: "server", message: result.errors.name[0] });
                    }
                    if (result.errors.sku) {
                        form.setError("sku", { type: "server", message: result.errors.sku[0] });
                    }
                    if (result.errors.slug) {
                        form.setError("slug", { type: "server", message: result.errors.slug[0] });
                    }
                    // Add generic error toast if needed or rely on field errors
                    toast({
                        variant: "destructive",
                        title: "Submission Failed",
                        description: result.message || "Please check the form for errors.",
                    });
                } else {
                    toast({
                        variant: "destructive",
                        title: "Submission Failed",
                        description: result.message || "An error occurred while saving the product.",
                    });
                }
            } else {
                // Success! Close the dialog and navigate back
                setUploadProgress(null);
                toast({
                    title: "Success",
                    description: result?.message || "Product saved successfully.",
                });
                // The server action will handle the redirect
            }
        } catch (error: any) {
            // Ignore NEXT_REDIRECT errors - these are intentional navigation triggers
            if (error?.message?.includes('NEXT_REDIRECT') || error?.message === 'NEXT_REDIRECT') {
                setUploadProgress(null);
                throw error; // Re-throw to allow Next.js to handle the redirect
            }

            console.error("Submission error:", error);
            toast({
                variant: "destructive",
                title: "An error occurred",
                description: error.message || "Could not save the product.",
            });
            setUploadProgress(null);
        }
    }


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

    const onCategorySuccess = () => {
        setCategoryDialogOpen(false);
        toast({ title: "Category created", description: "The new category has been added." });
    };

    const onBrandSuccess = () => {
        setBrandDialogOpen(false);
        toast({ title: "Brand created", description: "The new brand has been added." });
    };


    return (
        <>
            <Dialog open={uploadProgress !== null}>
                <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Saving Product</DialogTitle>
                        <DialogDescription>
                            {uploadProgress !== null && uploadProgress < 100
                                ? `Uploading images (${uploadProgress.toFixed(1)}%) ${currentUploadIndex}/${totalFilesToUpload} images, please wait...`
                                : 'Finalizing product details...'}
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
                                                <FormLabel>Product Name <span className="text-red-500">*</span></FormLabel>
                                                <div className="relative group/field">
                                                    <FormControl>
                                                        <Input
                                                            placeholder="e.g. Winter Jacket"
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
                                        label={<span>Slug <span className="text-red-500">*</span></span>}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center justify-between">
                                                    <FormLabel>Description</FormLabel>
                                                </div>
                                                <FormControl><Textarea rows={5} placeholder="Describe the product..." {...field} disabled={isSubmitting} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Pricing </CardTitle></CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="price"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Special Price <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl><Input type="number" step="any" min="0" placeholder="***" {...field} disabled={isSubmitting} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="originalPrice"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Regular Price</FormLabel>
                                                    <FormControl><Input type="number" step="any" min="0" placeholder="***" {...field} value={field.value ?? ""} disabled={isSubmitting} /></FormControl>
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
                                                    <FormControl><Input type="number" step="any" min="0" placeholder="***" {...field} value={field.value ?? ""} disabled={isSubmitting} /></FormControl>
                                                    <FormDescription>Internal use only.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="discount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Discount (%)</FormLabel>
                                                    <FormControl><Input type="number" min="0" placeholder="*" {...field} disabled={isSubmitting} /></FormControl>
                                                    <FormDescription>Discount percentage for the product.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Inventory</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="sku"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>SKU (Unique Identifier)  <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="1"
                                                            {...field}
                                                            value={field.value ?? ""}
                                                            disabled={isSubmitting}
                                                            onChange={(e) => {
                                                                const value = e.target.value.replace(/[^0-9]/g, '');
                                                                field.onChange(value === "" ? null : Number(value));
                                                                if (form.formState.errors.sku) form.clearErrors("sku");
                                                            }}
                                                            onBlur={async (e) => {
                                                                field.onBlur();
                                                                const val = e.target.value;
                                                                if (val && Number(val) !== product?.sku) {
                                                                    const check = await checkProductSku(Number(val), product?.id);
                                                                    if (!check.isUnique) {
                                                                        form.setError("sku", { type: "manual", message: check.message });
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="stock"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Stock Quantity <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl><Input type="number" min="0" placeholder="0" {...field} disabled={isSubmitting} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
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
                                <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="categoryId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center justify-between">
                                                    <FormLabel>Category</FormLabel>
                                                </div>
                                                <div className="flex items-center gap-2 w-full">
                                                    <div className="relative flex-1 group/select">
                                                        <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                                                            <FormControl>
                                                                <SelectTrigger className="w-full pr-14 relative [&>svg:last-child]:absolute [&>svg:last-child]:right-3">
                                                                    <SelectValue placeholder="Select a category" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {sortedCategories.map((cat) => (
                                                                    <SelectItem key={cat.id} value={cat.id}>
                                                                        <span
                                                                            className={cat.level === 0 ? "font-bold" : ""}
                                                                            dangerouslySetInnerHTML={{ __html: '&nbsp;'.repeat(cat.level * 4) + cat.name }}
                                                                        />
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {field.value && !isSubmitting && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    form.setValue("categoryId", "");
                                                                }}
                                                                className="absolute right-9 top-1/2 -translate-y-1/2 z-10 text-muted-foreground hover:text-foreground p-0.5 rounded-md hover:bg-muted opacity-0 group-hover/select:opacity-100 transition-opacity"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <Dialog open={isCategoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                                                        <DialogTrigger asChild>
                                                            <Button type="button" variant="outline" size="icon" aria-label="Add new category" disabled={isSubmitting}><Plus className="h-4 w-4" /></Button>
                                                        </DialogTrigger>
                                                        <DialogContent
                                                            className="max-h-[90vh] overflow-y-auto"
                                                            onInteractOutside={(e) => e.preventDefault()}
                                                            onEscapeKeyDown={(e) => e.preventDefault()}
                                                        >
                                                            <DialogHeader><DialogTitle>New Category</DialogTitle></DialogHeader>
                                                            <div className="pt-4">
                                                                <CategoryForm
                                                                    categories={localCategories}
                                                                    onSubmit={async (data) => {
                                                                        const result = await createCategoryJson(data);
                                                                        if (result.success && result.category) {
                                                                            setLocalCategories((prev) => [...prev, result.category!]);
                                                                            form.setValue("categoryId", result.category!.id, { shouldValidate: true });
                                                                            setCategoryDialogOpen(false);
                                                                        }
                                                                        return result;
                                                                    }}
                                                                    hideCard
                                                                />
                                                            </div>
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
                                                <div className="flex items-center justify-between">
                                                    <FormLabel>Brand</FormLabel>
                                                </div>
                                                <div className="flex items-center gap-2 w-full">
                                                    <div className="relative flex-1 group/select">
                                                        <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                                                            <FormControl>
                                                                <SelectTrigger className="w-full pr-14 relative [&>svg:last-child]:absolute [&>svg:last-child]:right-3">
                                                                    <SelectValue placeholder="Select a brand" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {localBrands.map((brand) => (
                                                                    <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {field.value && !isSubmitting && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    form.setValue("brandId", "");
                                                                }}
                                                                className="absolute right-9 top-1/2 -translate-y-1/2 z-10 text-muted-foreground hover:text-foreground p-0.5 rounded-md hover:bg-muted opacity-0 group-hover/select:opacity-100 transition-opacity"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <Dialog open={isBrandDialogOpen} onOpenChange={setBrandDialogOpen}>
                                                        <DialogTrigger asChild>
                                                            <Button type="button" variant="outline" size="icon" aria-label="Add new brand" disabled={isSubmitting}><Plus className="h-4 w-4" /></Button>
                                                        </DialogTrigger>
                                                        <DialogContent
                                                            className="max-h-[90vh] overflow-y-auto"
                                                            onInteractOutside={(e) => e.preventDefault()}
                                                            onEscapeKeyDown={(e) => e.preventDefault()}
                                                        >
                                                            <DialogHeader><DialogTitle>New Brand</DialogTitle></DialogHeader>
                                                            <div className="pt-4">
                                                                <BrandForm
                                                                    onSubmit={async (data) => {
                                                                        const result = await createBrandJson(data);
                                                                        if (result.success && result.brand) {
                                                                            setLocalBrands((prev) => [...prev, result.brand!]);
                                                                            form.setValue("brandId", result.brand!.id, { shouldValidate: true });
                                                                            setBrandDialogOpen(false);
                                                                        }
                                                                        return result;
                                                                    }}
                                                                    hideCard
                                                                />
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
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
                                <CardHeader><CardTitle>Publish Status</CardTitle></CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        className="flex flex-col space-y-1"
                                                        disabled={isSubmitting}
                                                    >
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="draft" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">
                                                                Draft
                                                            </FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="published" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">
                                                                Published
                                                            </FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormDescription>
                                                    Setting to draft will hide the product from the store.
                                                </FormDescription>
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
