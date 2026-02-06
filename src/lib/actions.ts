'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/lib/db';
import { products, brands, categories, heroSliders, users, orders, orderItems, reviews } from '@/lib/schema';
import { eq, and, ne, desc, inArray, or, sql, asc, count as drizzleCount } from 'drizzle-orm';
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
  sku: z.coerce.number().int("SKU must be a whole number.").min(1, "SKU is required."),
  description: z.string().optional(),
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
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  images: z.array(z.any()).optional(),
  isTrending: z.boolean().default(false),
  isBestSelling: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  discount: z.coerce.number().min(0).default(0),
  status: z.enum(["draft", "published"]).default("published"),
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

  const { slug, sku } = validatedFields.data;

  const existingProduct = await db.query.products.findFirst({ where: eq(products.slug, slug) });
  if (existingProduct) {
    return { success: false, message: 'A product with this name already exists, resulting in a duplicate slug.' };
  }

  const existingProductSku = await db.query.products.findFirst({ where: eq(products.sku, sku) });
  if (existingProductSku) {
    return { success: false, message: `A product with this SKU (${sku}) already exists.` };
  }

  const images = validatedFields.data.images || [];

  try {
    await db.insert(products).values({
      id: createId(),
      ...validatedFields.data,
      description: validatedFields.data.description || null,
      categoryId: validatedFields.data.categoryId || null,
      brandId: validatedFields.data.brandId || null,
      price: String(validatedFields.data.price),
      originalPrice: validatedFields.data.originalPrice != null ? String(validatedFields.data.originalPrice) : null,
      buyPrice: validatedFields.data.buyPrice != null ? String(validatedFields.data.buyPrice) : null,
      discount: String(validatedFields.data.discount),
      images,
      keywords: validatedFields.data.keywords || [],
    });
  } catch (error: any) {
    // Enhanced error logging
    console.error('Create Product Error:', error);
    if (error.cause) console.error('Error Cause:', error.cause);
    // @ts-ignore
    if (error.body) console.error('Error Body:', error.body);

    let details = error.detail || '';
    if (!details && error.cause && (error.cause as any).detail) {
      details = (error.cause as any).detail;
    }

    return {
      success: false,
      message: `Database Error: Failed to Create Product. ${error.message || ''} ${details ? '- ' + details : ''}`,
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

  const { slug, sku } = validatedFields.data;
  const existingProduct = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), ne(products.id, id)),
  });
  if (existingProduct) {
    return { success: false, message: 'A product with this name already exists, resulting in a duplicate slug.' };
  }

  const existingProductSku = await db.query.products.findFirst({
    where: and(eq(products.sku, sku), ne(products.id, id)),
  });
  if (existingProductSku) {
    return { success: false, message: `A product with this SKU (${sku}) already exists.` };
  }

  const images = validatedFields.data.images || [];

  try {
    await db.update(products).set({
      ...validatedFields.data,
      description: validatedFields.data.description || null,
      categoryId: validatedFields.data.categoryId || null,
      brandId: validatedFields.data.brandId || null,
      price: String(validatedFields.data.price),
      originalPrice: validatedFields.data.originalPrice != null ? String(validatedFields.data.originalPrice) : null,
      buyPrice: validatedFields.data.buyPrice != null ? String(validatedFields.data.buyPrice) : null,
      discount: String(validatedFields.data.discount),
      images,
      keywords: validatedFields.data.keywords || [],
      updatedAt: new Date(),
    }).where(eq(products.id, id));
  } catch (error: any) {
    // Enhanced error logging
    console.error('Update Product Error:', error);
    if (error.cause) console.error('Error Cause:', error.cause);
    // @ts-ignore
    if (error.body) console.error('Error Body:', error.body);

    let details = error.detail || '';
    if (!details && error.cause && (error.cause as any).detail) {
      details = (error.cause as any).detail;
    }

    return {
      success: false,
      message: `Database Error: Failed to Update Product. ${error.message || ''} ${details ? '- ' + details : ''}`,
    };
  }

  revalidatePath('/admin/products');
  revalidatePath(`/products/${slug}`);
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
export async function deleteMultipleProducts(ids: string[]) {
  try {
    // 1. Fetch products to get image URLs
    const productsToDelete = await db.query.products.findMany({
      where: inArray(products.id, ids),
    });

    // 2. Collect all public IDs to delete from Cloudinary
    const publicIdsToDelete: string[] = [];
    productsToDelete.forEach((product: any) => {
      if (product.images && product.images.length > 0) {
        product.images.forEach((url: string) => {
          if (url && url.includes('cloudinary')) {
            const match = url.match(/abrar-shop\/([^.]+)/);
            if (match && match[0]) {
              publicIdsToDelete.push(match[0]);
            }
          }
        });
      }
    });

    // 3. Delete images from Cloudinary
    if (publicIdsToDelete.length > 0) {
      const chunkSize = 100;
      for (let i = 0; i < publicIdsToDelete.length; i += chunkSize) {
        const chunk = publicIdsToDelete.slice(i, i + chunkSize);
        try {
          await cloudinary.api.delete_resources(chunk);
        } catch (cError) {
          console.error("Failed to delete some images from cloudinary", cError);
        }
      }
    }

    // 4. Delete products from DB
    await db.delete(products).where(inArray(products.id, ids));

    revalidatePath('/admin/products');
    return { success: true, message: `Deleted ${ids.length} products.` };
  } catch (error) {
    console.error('Delete multiple products error:', error);
    return {
      success: false,
      message: 'Database Error: Failed to Delete Products.',
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
  revalidatePath('/admin/brand');
  redirect('/admin/brand');
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
    await db.update(brands).set({ name, slug, imageUrl, updatedAt: new Date() }).where(eq(brands.id, id));
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message || 'Database Error: Failed to update brand.' };
  }
  revalidatePath('/admin/brand');
  revalidatePath(`/admin/brand/${id}/edit`);
  redirect('/admin/brand');
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
    revalidatePath('/admin/brand');
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
  isFeatured: z.boolean().default(false),
});

export async function createCategory(data: unknown) {
  const validatedFields = categorySchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors, message: 'Failed to create category.' };
  }
  const { name, slug, parentId, imageUrl, isFeatured } = validatedFields.data;

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
      imageUrl,
      isFeatured
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
  const { name, slug, parentId, imageUrl, isFeatured } = validatedFields.data;

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
      isFeatured: isFeatured,
      updatedAt: new Date(),
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

export async function toggleCategoryFeatured(id: string, isFeatured: boolean) {
  try {
    await db.update(categories).set({ isFeatured, updatedAt: new Date() }).where(eq(categories.id, id));
    revalidatePath('/admin/categories');
    return { success: true, message: `Category ${isFeatured ? 'marked as featured' : 'removed from featured'}.` };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Database Error: Failed to toggle featured status.' };
  }
}

// JSON returning actions for use in client components
const quickBrandSchema = z.object({
  name: z.string().min(2, 'Brand name must be at least 2 characters long.'),
  slug: z.string().min(2, 'Slug must be at least 2 characters long.').optional(),
  imageUrl: z.string().optional().nullable(),
});

export async function createBrandJson(data: unknown) {
  const validatedFields = quickBrandSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors, message: 'Failed to create brand.' };
  }

  const { name, slug: providedSlug, imageUrl } = validatedFields.data;
  let slug = providedSlug || generateSlug(name);
  const existing = await db.query.brands.findFirst({ where: eq(brands.slug, slug) });
  if (existing) {
    return { success: false, message: 'A brand with this name already exists.' };
  }

  try {
    const [newBrand] = await db.insert(brands).values({ id: createId(), name, slug, imageUrl }).returning();
    revalidatePath('/admin/brand');
    return { success: true, brand: newBrand };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Database Error: Failed to create brand.' };
  }
}

const quickCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters long.'),
  slug: z.string().min(2, 'Slug must be at least 2 characters long.').optional(),
  parentId: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
});

export async function createCategoryJson(data: unknown) {
  const validatedFields = quickCategorySchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors, message: 'Failed to create category.' };
  }
  const { name, slug: providedSlug, parentId, imageUrl, isFeatured } = validatedFields.data;
  let slug = providedSlug || generateSlug(name);

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
      imageUrl,
      isFeatured
    }).returning();

    revalidatePath('/admin/categories');

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

export async function checkProductSku(val: string | number, id?: string) {
  const sku = typeof val === 'string' ? parseInt(val, 10) : val;
  if (isNaN(sku)) return { isUnique: false, message: 'Invalid SKU.' };

  try {
    const query = db.query.products.findFirst({
      where: id
        ? and(eq(products.sku, sku), ne(products.id, id))
        : eq(products.sku, sku),
    });
    const existing = await query;
    if (existing) {
      return { isUnique: false, message: 'This SKU is already in use.' };
    }
    return { isUnique: true, message: 'SKU is available.' };
  } catch (error) {
    console.error(error);
    return { isUnique: false, message: 'Error checking SKU.' };
  }
}

export async function getLatestSku() {
  try {
    const latestProduct = await db.query.products.findFirst({
      orderBy: desc(products.sku),
      columns: {
        sku: true,
      },
    });

    return latestProduct?.sku ?? null;
  } catch (error) {
    console.error(error);
    return null;
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
      updatedAt: new Date(),
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
  userId: z.string().optional(),
});


export async function processCheckout(data: unknown, totalAmount: number, items: any[]) {
  const validatedFields = checkoutSchema.safeParse(data);

  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten())
    return { success: false, message: 'Invalid checkout data.' };
  }

  const { paymentMethod, email, mobile } = validatedFields.data;

  try {
    // Handle bKash Payment
    if (paymentMethod === 'bkash') {
      // Only attempt to call bKash if credentials exist
      // if (process.env.BKASH_APP_KEY && process.env.BKASH_APP_SECRET) {
      //   const payment = await createBkashPayment(totalAmount, invoice);

      //   if (payment && payment.bkashURL) {
      //     return { success: true, url: payment.bkashURL };
      //   } else {
      //     console.error("bKash payment creation failed:", payment);
      //     return { success: false, message: "Could not create bKash payment session." };
      //   }
      // } else {
      //   console.warn("bKash credentials missing. Mocking success for development.");
      //   return { success: true, url: '/checkout/thank-you' };
      // }
    }

    // Handle Cash on Delivery or fallback
    console.log('Order processed for:', email || mobile, 'Total:', totalAmount);

    // Create Order in DB
    const orderId = createId();
    const orderNumber = `${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;

    const deliveryFee = validatedFields.data.deliveryMethod === 'gaibandha' ? '50.00' : '100.00';

    await db.insert(orders).values({
      id: orderId,
      orderNumber,
      userId: validatedFields.data.userId || null,
      firstName: validatedFields.data.firstName,
      lastName: validatedFields.data.lastName,
      mobile: validatedFields.data.mobile,
      email: validatedFields.data.email || null,
      address: validatedFields.data.address,
      district: validatedFields.data.district,
      deliveryMethod: validatedFields.data.deliveryMethod,
      deliveryFee,
      totalAmount: String(totalAmount),
      paymentMethod: validatedFields.data.paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending',
    });

    // Create Order Items
    const orderItemsValues = items.map((item) => ({
      id: createId(),
      orderId: orderId,
      productId: item.id,
      quantity: item.quantity,
      price: String(item.price), // Assuming price is number
    }));

    if (orderItemsValues.length > 0) {
      await db.insert(orderItems).values(orderItemsValues);
    }

    return { success: true, url: `/order-confirmed/${orderNumber}` };
  } catch (error: any) {
    if (error?.message === 'NEXT_REDIRECT') throw error;
    console.error('Checkout Processing Error:', error);
    return { success: false, message: error.message || 'Failed to process checkout.' };
  }
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
    const buffer = Buffer.from(fileBuffer);

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'abrar-shop' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    }) as any;

    return { success: true, url: result.secure_url };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return { success: false, message: 'Failed to upload image.' };
  }
}

export async function syncUserWithNeon(profile: {
  uid: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber?: string | null;
}) {
  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, profile.uid),
    });

    if (existingUser) {
      // Update existing user
      await db.update(users).set({
        email: profile.email || '',
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber || existingUser.phoneNumber,
        updatedAt: new Date(),
      }).where(eq(users.id, profile.uid));
      return { success: true, user: existingUser };
    } else {
      // Create new user
      const [newUser] = await db.insert(users).values({
        id: profile.uid,
        email: profile.email || '',
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber,
      }).returning();
      return { success: true, user: newUser };
    }
  } catch (error) {
    console.error('Sync User Error:', error);
    return { success: false, message: 'Failed to sync user with database.' };
  }
}

export async function getUserProfile(uid: string) {
  try {
    const profile = await db.query.users.findFirst({
      where: eq(users.id, uid),
    });
    return profile || null;
  } catch (error) {
    console.error('Get User Profile Error:', error);
    return null;
  }
}

export async function updateUserProfile(uid: string, data: {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  district?: string;
}) {
  try {
    await db.update(users).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(users.id, uid));
    revalidatePath('/account/profile');
    return { success: true, message: 'Profile updated successfully.' };
  } catch (error) {
    console.error('Update User Profile Error:', error);
    return { success: false, message: 'Failed to update profile.' };
  }
}

export async function getUserOrders(uid: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, uid),
      columns: { email: true }
    });

    const conditions = [eq(orders.userId, uid)];
    if (user?.email) {
      conditions.push(eq(orders.email, user.email));
    }

    const userOrders = await db.query.orders.findMany({
      where: or(...conditions),
      orderBy: desc(orders.createdAt),
      with: {
        items: {
          with: {
            product: true
          }
        },
      },
    });
    return userOrders;
  } catch (error) {
    console.error('Get User Orders Error:', error);
    return [];
  }
}

export async function getAllOrders() {
  try {
    const allOrders = await db.query.orders.findMany({
      orderBy: desc(orders.createdAt),
      with: {
        items: {
          with: {
            product: true
          }
        },
      },
    });
    return allOrders;
  } catch (error) {
    console.error('Get All Orders Error:', error);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const updateData: any = {
      orderStatus: status,
      updatedAt: new Date(),
    };

    // Set specific timestamps based on status
    if (status === 'processing') updateData.processingAt = new Date();
    if (status === 'shipped') updateData.shippedAt = new Date();
    if (status === 'delivered') {
      updateData.deliveredAt = new Date();
      updateData.paymentStatus = 'paid';
      updateData.paidAt = new Date();
    }
    if (status === 'cancelled') updateData.cancelledAt = new Date();

    await db.update(orders).set(updateData).where(eq(orders.id, orderId));

    revalidatePath('/admin/orders');
    revalidatePath('/account/orders');
    return { success: true, message: `Order status updated to ${status}.` };
  } catch (error) {
    console.error('Update Order Status Error:', error);
    return { success: false, message: 'Failed to update order status.' };
  }
}

export async function updatePaymentStatus(orderId: string, status: string) {
  try {
    const updateData: any = {
      paymentStatus: status,
      updatedAt: new Date(),
    };

    if (status === 'paid') {
      updateData.paidAt = new Date();
    }

    await db.update(orders).set(updateData).where(eq(orders.id, orderId));

    revalidatePath('/admin/orders');
    revalidatePath('/admin/dashboard');
    return { success: true, message: `Payment status updated to ${status}.` };
  } catch (error) {
    console.error('Update Payment Status Error:', error);
    return { success: false, message: 'Failed to update payment status.' };
  }
}

export async function getAllUsers() {
  try {
    const allUsers = await db.query.users.findMany({
      orderBy: desc(users.createdAt),
    });
    return allUsers;
  } catch (error) {
    console.error('Get All Users Error:', error);
    return [];
  }
}

export async function getDashboardStats() {
  try {
    const totalOrdersCount = await db.select({ count: drizzleCount() }).from(orders);
    const totalProductsCount = await db.select({ count: drizzleCount() }).from(products);
    const totalCustomersCount = await db.select({ count: drizzleCount() }).from(users);

    // Calculate total revenue from PAID orders only
    const revenueResult = await db.select({
      total: sql<number>`COALESCE(SUM(CAST(${orders.totalAmount} AS NUMERIC)), 0)`
    }).from(orders).where(eq(orders.paymentStatus, 'paid'));

    const recentOrders = await db.query.orders.findMany({
      limit: 5,
      orderBy: desc(orders.createdAt),
      with: {
        items: true
      }
    });

    // Get sales data for the last 7 days (PAID only)
    const salesDataRaw = await db.select({
      date: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`,
      total: sql<number>`SUM(CAST(${orders.totalAmount} AS NUMERIC))`
    })
      .from(orders)
      .where(eq(orders.paymentStatus, 'paid'))
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(asc(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`));

    return {
      stats: {
        totalRevenue: Number(revenueResult[0]?.total || 0),
        totalSales: Number(totalOrdersCount[0]?.count || 0),
        totalProducts: Number(totalProductsCount[0]?.count || 0),
        totalCustomers: Number(totalCustomersCount[0]?.count || 0),
      },
      recentOrders,
      salesData: salesDataRaw.map(item => ({
        ...item,
        total: Number(item.total)
      })),
    };
  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    return {
      stats: { totalRevenue: 0, totalSales: 0, totalProducts: 0, totalCustomers: 0 },
      recentOrders: [],
      salesData: [],
    };
  }
}

export async function getOrderByNumber(orderNumber: string) {
  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.orderNumber, orderNumber),
      with: {
        items: {
          with: {
            product: true
          }
        },
      },
    });
    return order || null;
  } catch (error) {
    console.error('Get Order By Number Error:', error);
    return null;
  }
}


// Review Actions
const reviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required.'),
  userName: z.string().min(1, 'Name is required.'),
  rating: z.coerce.number().min(1, 'Rating must be at least 1.').max(5, 'Rating must be at most 5.'),
  comment: z.string().optional(),
  userId: z.string().optional(),
});

export async function submitReview(data: unknown) {
  const validatedFields = reviewSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid review data.',
    };
  }

  const { productId, userName, rating, comment, userId } = validatedFields.data;

  try {
    await db.insert(reviews).values({
      id: createId(),
      productId,
      userId: userId || null,
      userName,
      rating,
      comment: comment || null,
      status: 'approved',
    });

    revalidatePath(`/product/[slug]`); // Only generic path revalidation works reliably without dynamic params
    return { success: true, message: 'Review submitted successfully.' };
  } catch (error: any) {
    console.error('Submit Review Error:', error);
    return { success: false, message: 'Failed to submit review.' };
  }
}
