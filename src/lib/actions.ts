'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/lib/db';
import { products, brands, categories, heroSliders } from '@/lib/schema';
import { eq, and, ne } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { getProducts, getProductById, getBrandById, getCategoryById, getHeroSliderById } from './data';
import { generateSlug } from '@/lib/utils';
import { v2 as cloudinary } from 'cloudinary';

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}


const productFormSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters long."),
  slug: z.string().min(3, "Slug must be at least 3 characters long.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format: only lowercase letters, numbers, and hyphens are allowed.'),
  sku: z.string().optional().nullable(),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  price: z.coerce.number().min(0, "Price cannot be negative."),
  originalPrice: z.preprocess(
    (val) => (val === "" ? null : val),
    z.coerce.number().min(0, "Original price cannot be negative.").nullable().optional()
  ),
  buyPrice: z.preprocess(
    (val) => (val === "" ? null : val),
    z.coerce.number().min(0, "Buy price cannot be negative.").nullable().optional()
  ),
  stock: z.coerce.number().int("Stock must be a whole number.").min(0, "Stock cannot be negative."),
  categoryId: z.string().min(1, "Category is required."),
  brandId: z.string().min(1, "Brand is required."),
  keywords: z.array(z.string()).optional(),
  images: z.array(z.any()).optional(),
  isTrending: z.boolean().default(false),
  isBestSelling: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

export async function createProduct(data: unknown) {
    const validatedFields = productFormSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Product.',
        };
    }
    
    const { slug } = validatedFields.data;
    const existingProduct = await db.query.products.findFirst({ where: eq(products.slug, slug) });
    if (existingProduct) {
        return { success: false, message: 'A product with this name already exists, resulting in a duplicate slug.' };
    }

    const images = validatedFields.data.images?.length ? validatedFields.data.images : ['https://placehold.co/600x400?text=No+Image'];

    try {
        await db.insert(products).values({
            id: createId(),
            ...validatedFields.data,
            price: String(validatedFields.data.price),
            originalPrice: validatedFields.data.originalPrice ? String(validatedFields.data.originalPrice) : null,
            buyPrice: validatedFields.data.buyPrice ? String(validatedFields.data.buyPrice) : null,
            images,
            keywords: validatedFields.data.keywords || [],
        });
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'Database Error: Failed to Create Product.',
        };
    }

    revalidatePath('/admin/products');
    redirect('/admin/products');
}

export async function updateProduct(id: string, data: unknown) {
    const validatedFields = productFormSchema.safeParse(data);

     if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Update Product.',
        };
    }
    
    const { slug } = validatedFields.data;
    const existingProduct = await db.query.products.findFirst({
        where: and(eq(products.slug, slug), ne(products.id, id)),
    });
    if (existingProduct) {
        return { success: false, message: 'A product with this name already exists, resulting in a duplicate slug.' };
    }

    const images = validatedFields.data.images?.length ? validatedFields.data.images : ['https://placehold.co/600x400?text=No+Image'];

    try {
        await db.update(products).set({
            ...validatedFields.data,
            price: String(validatedFields.data.price),
            originalPrice: validatedFields.data.originalPrice ? String(validatedFields.data.originalPrice) : null,
            buyPrice: validatedFields.data.buyPrice ? String(validatedFields.data.buyPrice) : null,
            images,
            keywords: validatedFields.data.keywords || [],
        }).where(eq(products.id, id));
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: 'Database Error: Failed to Update Product.',
        };
    }

    revalidatePath('/admin/products');
    revalidatePath(`/products/${slug}`);
    revalidatePath(`/admin/products/${id}/edit`);
    redirect('/admin/products');
}

export async function deleteProduct(id: string) {
    try {
        const productToDelete = await getProductById(id);

        // Delete images from Cloudinary
        if (productToDelete && productToDelete.images.length > 0) {
            const imagesToDelete = productToDelete.images.filter(img => img && img.includes('cloudinary'));
            if (imagesToDelete.length > 0) {
                const publicIds = imagesToDelete.map(url => {
                    const match = url.match(/abrar-shop\/([^.]+)/);
                    return match ? match[0] : null;
                }).filter((id): id is string => id !== null);

                if (publicIds.length > 0) {
                    await cloudinary.api.delete_resources(publicIds);
                }
            }
        }
        
        await db.delete(products).where(eq(products.id, id));
        revalidatePath('/admin/products');
        return { message: 'Deleted Product.' };
    } catch (error) {
        console.error(error);
        return {
            message: 'Database Error: Failed to Delete Product.',
        };
    }
}

// Brand Actions
const brandSchema = z.object({
  name: z.string().min(2, 'Brand name must be at least 2 characters long.'),
  slug: z.string().min(2, 'Slug must be at least 2 characters long.'),
  imageUrl: z.string().optional().nullable(),
});

export async function createBrand(data: unknown) {
  const validatedFields = brandSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors, message: 'Failed to create brand.' };
  }
  const { name, slug, imageUrl } = validatedFields.data;

  const existing = await db.query.brands.findFirst({ where: eq(brands.slug, slug) });
  if (existing) {
    return { success: false, message: 'A brand with this name already exists, resulting in a duplicate slug.' };
  }
  
  try {
    await db.insert(brands).values({ id: createId(), name, slug, imageUrl });
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message || 'Database Error: Failed to create brand.' };
  }
  revalidatePath('/admin/brands');
  redirect('/admin/brands');
}

export async function updateBrand(id: string, data: unknown) {
  const validatedFields = brandSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors, message: 'Failed to update brand.' };
  }
  const { name, slug, imageUrl } = validatedFields.data;

  const existing = await db.query.brands.findFirst({ where: and(eq(brands.slug, slug), ne(brands.id, id)) });
  if (existing) {
    return { success: false, message: 'A brand with this name already exists, resulting in a duplicate slug.' };
  }

  try {
    await db.update(brands).set({ name, slug, imageUrl }).where(eq(brands.id, id));
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message || 'Database Error: Failed to update brand.' };
  }
  revalidatePath('/admin/brands');
  revalidatePath(`/admin/brands/${id}/edit`);
  redirect('/admin/brands');
}

export async function deleteBrand(id: string) {
    try {
        const brandToDelete = await getBrandById(id);
        if (brandToDelete && brandToDelete.imageUrl && brandToDelete.imageUrl.includes('cloudinary')) {
            const publicIdMatch = brandToDelete.imageUrl.match(/abrar-shop\/([^.]+)/);
            if (publicIdMatch && publicIdMatch[0]) {
                await cloudinary.uploader.destroy(publicIdMatch[0]);
            }
        }

        await db.delete(brands).where(eq(brands.id, id));
        revalidatePath('/admin/brands');
        return { message: 'Deleted brand.' };
    } catch (error: any) {
        if (error && error.code === '23503') {
            return { message: 'Failed to delete brand. It is currently being used by one or more products.' };
        }
        console.error('Delete brand error:', error);
        return { message: 'Database Error: Failed to delete brand.' };
    }
}

// Category Actions
const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters long.'),
  slug: z.string().min(2, 'Slug must be at least 2 characters long.'),
  parentId: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
});

export async function createCategory(data: unknown) {
  const validatedFields = categorySchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors, message: 'Failed to create category.' };
  }
  const { name, slug, parentId, imageUrl } = validatedFields.data;

  const existing = await db.query.categories.findFirst({ where: eq(categories.slug, slug) });
  if (existing) {
    return { success: false, message: 'A category with this name already exists, resulting in a duplicate slug.' };
  }

  try {
    await db.insert(categories).values({ 
        id: createId(), 
        name,
        slug,
        parentId: (parentId && parentId !== 'none') ? parentId : null,
        imageUrl
    });
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message || 'Database Error: Failed to create category.' };
  }
  revalidatePath('/admin/categories');
  redirect('/admin/categories');
}

export async function updateCategory(id: string, data: unknown) {
  const validatedFields = categorySchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors, message: 'Failed to update category.' };
  }
  const { name, slug, parentId, imageUrl } = validatedFields.data;

  const existing = await db.query.categories.findFirst({ where: and(eq(categories.slug, slug), ne(categories.id, id)) });
  if (existing) {
     return { success: false, message: 'A category with this name already exists, resulting in a duplicate slug.' };
  }
  
  try {
    await db.update(categories).set({
        name,
        slug,
        parentId: (parentId && parentId !== 'none') ? parentId : null,
        imageUrl,
    }).where(eq(categories.id, id));
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message || 'Database Error: Failed to update category.' };
  }
  revalidatePath('/admin/categories');
  revalidatePath(`/admin/categories/${id}/edit`);
  redirect('/admin/categories');
}

export async function deleteCategory(id: string) {
    try {
        const children = await db.query.categories.findFirst({ where: eq(categories.parentId, id) });
        if (children) {
            return { message: 'Failed to delete category. It has one or more sub-categories.' };
        }
        
        const categoryToDelete = await getCategoryById(id);
        if (categoryToDelete && categoryToDelete.imageUrl && categoryToDelete.imageUrl.includes('cloudinary')) {
            const publicIdMatch = categoryToDelete.imageUrl.match(/abrar-shop\/([^.]+)/);
            if (publicIdMatch && publicIdMatch[0]) {
                await cloudinary.uploader.destroy(publicIdMatch[0]);
            }
        }

        await db.delete(categories).where(eq(categories.id, id));
        revalidatePath('/admin/categories');
        return { message: 'Deleted category.' };
    } catch (error: any) {
        if (error && error.code === '23503') {
            return { message: 'Failed to delete category. It is currently being used by one or more products.' };
        }
        console.error(error);
        return { message: 'Database Error: Failed to delete category.' };
    }
}

// JSON returning actions for use in client components
const quickBrandSchema = z.object({
  name: z.string().min(2, 'Brand name must be at least 2 characters long.'),
});

export async function createBrandJson(data: unknown) {
  const validatedFields = quickBrandSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors, message: 'Failed to create brand.' };
  }
  
  const { name } = validatedFields.data;
  let slug = generateSlug(name);
  const existing = await db.query.brands.findFirst({ where: eq(brands.slug, slug) });
  if (existing) {
    return { success: false, message: 'A brand with this name already exists.' };
  }

  try {
    const [newBrand] = await db.insert(brands).values({ id: createId(), name, slug }).returning();
    revalidatePath('/admin/brands');
    revalidatePath('/admin/products');
    return { success: true, brand: newBrand };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Database Error: Failed to create brand.' };
  }
}

const quickCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters long.'),
  parentId: z.string().optional(),
});

export async function createCategoryJson(data: unknown) {
  const validatedFields = quickCategorySchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors, message: 'Failed to create category.' };
  }
  const { name, parentId } = validatedFields.data;
  let slug = generateSlug(name);

  const existing = await db.query.categories.findFirst({ where: eq(categories.slug, slug) });
  if (existing) {
    return { success: false, message: 'A category with this name already exists.' };
  }

  try {
    const [newCategory] = await db.insert(categories).values({
      id: createId(),
      name,
      slug,
      parentId: (parentId && parentId !== 'none') ? parentId : null,
    }).returning();
    
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');

    let parentName: string | null = null;
    if (newCategory.parentId) {
        const parent = await db.query.categories.findFirst({ where: eq(categories.id, newCategory.parentId) });
        parentName = parent?.name || null;
    }

    return { success: true, category: { ...newCategory, parentName } };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Database Error: Failed to create category.' };
  }
}

// Slug checking actions (kept for potential future client-side validation)
export async function checkProductSlug(slug: string, id?: string) {
    if (!slug) return { isUnique: false, message: 'Slug cannot be empty.' };
    try {
        const query = db.query.products.findFirst({
            where: id
                ? and(eq(products.slug, slug), ne(products.id, id))
                : eq(products.slug, slug),
        });
        const existing = await query;
        if (existing) {
            return { isUnique: false, message: 'This slug is already in use.' };
        }
        return { isUnique: true, message: 'Slug is available.' };
    } catch (error) {
        console.error(error);
        return { isUnique: false, message: 'Error checking slug.' };
    }
}

export async function checkBrandSlug(slug: string, id?: string) {
    if (!slug) return { isUnique: false, message: 'Slug cannot be empty.' };
    try {
        const query = db.query.brands.findFirst({
            where: id
                ? and(eq(brands.slug, slug), ne(brands.id, id))
                : eq(brands.slug, slug),
        });
        const existing = await query;
        if (existing) {
            return { isUnique: false, message: 'This slug is already in use.' };
        }
        return { isUnique: true, message: 'Slug is available.' };
    } catch (error) {
        console.error(error);
        return { isUnique: false, message: 'Error checking slug.' };
    }
}

export async function checkCategorySlug(slug: string, id?: string) {
    if (!slug) return { isUnique: false, message: 'Slug cannot be empty.' };
    try {
        const query = db.query.categories.findFirst({
            where: id
                ? and(eq(categories.slug, slug), ne(categories.id, id))
                : eq(categories.slug, slug),
        });
        const existing = await query;
        if (existing) {
            return { isUnique: false, message: 'This slug is already in use.' };
        }
        return { isUnique: true, message: 'Slug is available.' };
    } catch (error) {
        console.error(error);
        return { isUnique: false, message: 'Error checking slug.' };
    }
}


// Hero Slider Actions
const heroSliderSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters long.'),
  subtitle: z.string().optional(),
  imageUrl: z.string().min(1, "Image is required."),
  link: z.string().optional(),
  displayOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(false),
  type: z.enum(['carousel', 'promo-top', 'promo-bottom']).default('carousel'),
});

export async function createHeroSlider(data: unknown) {
  const validatedFields = heroSliderSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors, message: 'Failed to create hero slider.' };
  }
  const { title, subtitle, imageUrl, link, displayOrder, isActive, type } = validatedFields.data;
  
  try {
    await db.insert(heroSliders).values({ 
        id: createId(), 
        title,
        subtitle: subtitle || null,
        imageUrl: imageUrl,
        link: link || null,
        displayOrder,
        isActive,
        type,
    });
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message || 'Database Error: Failed to create hero slider.' };
  }
  revalidatePath('/admin/hero-sliders');
  redirect('/admin/hero-sliders');
}

export async function updateHeroSlider(id: string, data: unknown) {
  const validatedFields = heroSliderSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors, message: 'Failed to update hero slider.' };
  }
  const { title, subtitle, imageUrl, link, displayOrder, isActive, type } = validatedFields.data;
  
  try {
    await db.update(heroSliders).set({
        title,
        subtitle: subtitle || null,
        imageUrl: imageUrl,
        link: link || null,
        displayOrder,
        isActive,
        type,
    }).where(eq(heroSliders.id, id));
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message || 'Database Error: Failed to update hero slider.' };
  }
  revalidatePath('/admin/hero-sliders');
  revalidatePath(`/admin/hero-sliders/${id}/edit`);
  revalidatePath('/');
  redirect('/admin/hero-sliders');
}

export async function deleteHeroSlider(id: string) {
    try {
        const sliderToDelete = await getHeroSliderById(id);
        
        if (sliderToDelete && sliderToDelete.imageUrl && sliderToDelete.imageUrl.includes('cloudinary')) {
            // Extract public ID from URL and delete from Cloudinary
            const publicIdMatch = sliderToDelete.imageUrl.match(/abrar-shop\/([^.]+)/);
            if (publicIdMatch && publicIdMatch[0]) {
                await cloudinary.uploader.destroy(publicIdMatch[0]);
            }
        }

        await db.delete(heroSliders).where(eq(heroSliders.id, id));
        revalidatePath('/admin/hero-sliders');
        revalidatePath('/');
        return { message: 'Deleted hero slider.' };
    } catch (error) {
        console.error('Delete hero slider error:', error);
        return { message: 'Database Error: Failed to delete hero slider.' };
    }
}


// Checkout Action
const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  mobile: z.string().min(11, "A valid 11-digit mobile number is required.").max(11, "A valid 11-digit mobile number is required."),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
  address: z.string().min(1, "Address is required."),
  district: z.string().min(1, "District is required."),
  deliveryMethod: z.enum(['gaibandha', 'full_country']),
  paymentMethod: z.enum(['bkash', 'cod']),
});


export async function processCheckout(data: unknown) {
  const validatedFields = checkoutSchema.safeParse(data);

  if (!validatedFields.success) {
    // In a real app, you'd want to return these errors to the form.
    // For now, we'll throw an error.
    console.log(validatedFields.error.flatten())
    throw new Error('Invalid checkout data.');
  }

  // In a real application, this is where you would:
  // 1. Process the payment with a service like Stripe.
  // 2. Save the order details to your database.
  // 3. Send a confirmation email.

  // For this demo, we'll just log the data.
  console.log('Order processed for:', validatedFields.data.email || validatedFields.data.mobile);

  // After successful processing, redirect to a thank you page.
  redirect('/checkout/thank-you');
}

export async function searchProducts(query: string, limit: number) {
    if (!query) {
        return [];
    }
    const { products } = await getProducts({ query, limit });
    return products;
}

export async function uploadImage(formData: FormData): Promise<{ success: boolean; url?: string; message?: string; }> {
    const file = formData.get('file') as File | null;

    if (!file) {
        return { success: false, message: 'No file provided.' };
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
         return { success: false, message: 'Cloudinary environment variables are not configured.' };
    }

    try {
        const fileBuffer = await file.arrayBuffer();
        const mime = file.type;
        const encoding = 'base64';
        const base64Data = Buffer.from(fileBuffer).toString('base64');
        const fileUri = `data:${mime};${encoding},${base64Data}`;

        const result = await cloudinary.uploader.upload(fileUri, {
            folder: 'abrar-shop',
        });

        return { success: true, url: result.secure_url };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return { success: false, message: 'Failed to upload image.' };
    }
}
