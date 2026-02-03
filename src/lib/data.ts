import type { Product, Brand, Category, HeroSlider } from '@/lib/types';
import { db } from '@/lib/db';
import { products as productsTable, categories as categoriesTable, brands as brandsTable, heroSliders as heroSlidersTable } from '@/lib/schema';
import { eq, desc, asc, isNull, sql, or, ilike, and, ne, count as drizzleCount } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

// Product Functions
export const getProducts = async (options?: { query?: string, limit?: number, page?: number, isTrending?: boolean, isBestSelling?: boolean, isFeatured?: boolean, sortBy?: string, categoryId?: string, brandId?: string, excludeProductId?: string }): Promise<{ products: Product[], totalCount: number }> => {
  const { query, limit, page, isTrending, isBestSelling, isFeatured, sortBy, categoryId, brandId, excludeProductId } = options || {};
  try {
    const conditions = [];
    if (query && query.trim().length > 0) {
      const searchPattern = `%${query.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`;
      conditions.push(or(
        ilike(productsTable.name, searchPattern),
        ilike(productsTable.description, searchPattern),
        ilike(sql`array_to_string(${productsTable.keywords}, ' ')`, searchPattern)
      ));
    }
    if (categoryId) {
      conditions.push(eq(productsTable.categoryId, categoryId));
    }
    if (brandId) {
      conditions.push(eq(productsTable.brandId, brandId));
    }
    if (isTrending) {
      conditions.push(eq(productsTable.isTrending, true));
    }
    if (isBestSelling) {
      conditions.push(eq(productsTable.isBestSelling, true));
    }
    if (isFeatured) {
      conditions.push(eq(productsTable.isFeatured, true));
    }
    if (excludeProductId) {
      conditions.push(ne(productsTable.id, excludeProductId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const countQuery = db.select({ value: drizzleCount() }).from(productsTable);
    const totalCountResult = await (whereClause ? countQuery.where(whereClause) : countQuery);
    const totalCount = totalCountResult[0].value;

    let productQuery: any = db
      .select({
        id: productsTable.id,
        sku: productsTable.sku,
        name: productsTable.name,
        slug: productsTable.slug,
        description: productsTable.description,
        price: productsTable.price,
        originalPrice: productsTable.originalPrice,
        buyPrice: productsTable.buyPrice,
        images: productsTable.images,
        stock: productsTable.stock,
        keywords: productsTable.keywords,
        categoryId: productsTable.categoryId,
        brandId: productsTable.brandId,
        isTrending: productsTable.isTrending,
        isBestSelling: productsTable.isBestSelling,
        isFeatured: productsTable.isFeatured,
        category: categoriesTable.name,
        categorySlug: categoriesTable.slug,
        brand: brandsTable.name,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .leftJoin(brandsTable, eq(productsTable.brandId, brandsTable.id));

    if (whereClause) {
      productQuery = productQuery.where(whereClause);
    }

    switch (sortBy) {
      case 'price-asc':
        productQuery = productQuery.orderBy(asc(sql`${productsTable.price}::numeric`));
        break;
      case 'price-desc':
        productQuery = productQuery.orderBy(desc(sql`${productsTable.price}::numeric`));
        break;
      case 'name-asc':
        productQuery = productQuery.orderBy(asc(productsTable.name));
        break;
      case 'name-desc':
        productQuery = productQuery.orderBy(desc(productsTable.name));
        break;
      case 'newest':
      default:
        productQuery = productQuery.orderBy(desc(productsTable.id));
        break;
    }

    if (limit) {
      productQuery = productQuery.limit(limit);
    }
    if (page && limit) {
      productQuery = productQuery.offset((page - 1) * limit);
    }

    const result = await productQuery;

    const mappedProducts = (result as any[]).map((p: any) => ({
      ...p,
      price: Number(p.price),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
      buyPrice: p.buyPrice ? Number(p.buyPrice) : null,
    })) as Product[];

    return { products: mappedProducts, totalCount };
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return { products: [], totalCount: 0 };
  }
};

export const getProductById = async (
  id: string
): Promise<Product | undefined> => {
  if (!id) return undefined;
  try {
    const result = await db
      .select({
        id: productsTable.id,
        sku: productsTable.sku,
        name: productsTable.name,
        slug: productsTable.slug,
        description: productsTable.description,
        price: productsTable.price,
        originalPrice: productsTable.originalPrice,
        buyPrice: productsTable.buyPrice,
        images: productsTable.images,
        stock: productsTable.stock,
        keywords: productsTable.keywords,
        categoryId: productsTable.categoryId,
        brandId: productsTable.brandId,
        isTrending: productsTable.isTrending,
        isBestSelling: productsTable.isBestSelling,
        isFeatured: productsTable.isFeatured,
        category: categoriesTable.name,
        categorySlug: categoriesTable.slug,
        brand: brandsTable.name,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .leftJoin(brandsTable, eq(productsTable.brandId, brandsTable.id))
      .where(eq(productsTable.id, id));

    if (result.length === 0) {
      return undefined;
    }
    const product = result[0];
    return {
      ...product,
      price: Number(product.price),
      originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
      buyPrice: product.buyPrice ? Number(product.buyPrice) : null,
    } as Product;
  } catch (error) {
    console.error('Failed to fetch product by ID:', error);
    return undefined;
  }
};

export const getProductBySlug = async (
  slug: string
): Promise<Product | undefined> => {
  if (!slug) return undefined;
  try {
    const result = await db
      .select({
        id: productsTable.id,
        sku: productsTable.sku,
        name: productsTable.name,
        slug: productsTable.slug,
        description: productsTable.description,
        price: productsTable.price,
        originalPrice: productsTable.originalPrice,
        buyPrice: productsTable.buyPrice,
        images: productsTable.images,
        stock: productsTable.stock,
        keywords: productsTable.keywords,
        categoryId: productsTable.categoryId,
        brandId: productsTable.brandId,
        isTrending: productsTable.isTrending,
        isBestSelling: productsTable.isBestSelling,
        isFeatured: productsTable.isFeatured,
        category: categoriesTable.name,
        categorySlug: categoriesTable.slug,
        brand: brandsTable.name,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .leftJoin(brandsTable, eq(productsTable.brandId, brandsTable.id))
      .where(eq(productsTable.slug, slug));

    if (result.length === 0) {
      return undefined;
    }
    const product = result[0];
    return {
      ...product,
      price: Number(product.price),
      originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
      buyPrice: product.buyPrice ? Number(product.buyPrice) : null,
    } as Product;
  } catch (error) {
    console.error('Failed to fetch product by slug:', error);
    return undefined;
  }
};


// Brand Functions
export const getBrands = async (): Promise<Brand[]> => {
  try {
    const result = await db.select().from(brandsTable).orderBy(brandsTable.name);
    return result;
  } catch (error) {
    console.error('Failed to fetch brands:', error);
    return [];
  }
}

export const getBrandById = async (id: string): Promise<Brand | undefined> => {
  if (!id) return undefined;
  try {
    const result = await db.select().from(brandsTable).where(eq(brandsTable.id, id));
    return result[0];
  } catch (error) {
    return undefined;
  }
}

export const getBrandBySlug = async (slug: string): Promise<Brand | undefined> => {
  if (!slug) return undefined;
  try {
    const result = await db.select().from(brandsTable).where(eq(brandsTable.slug, slug));
    return result[0];
  } catch (error) {
    console.error('Failed to fetch brand by slug:', error);
    return undefined;
  }
}

// Category Functions
export const getCategories = async (options?: { topLevelOnly?: boolean }): Promise<Category[]> => {
  try {
    const { topLevelOnly } = options || {};
    const parentCategories = alias(categoriesTable, 'parent');

    const baseQuery = db
      .select({
        id: categoriesTable.id,
        name: categoriesTable.name,
        slug: categoriesTable.slug,
        parentId: categoriesTable.parentId,
        parentName: parentCategories.name,
        imageUrl: categoriesTable.imageUrl,
      })
      .from(categoriesTable)
      .leftJoin(parentCategories, eq(categoriesTable.parentId, parentCategories.id));

    const queryWithFilter = topLevelOnly
      ? baseQuery.where(isNull(categoriesTable.parentId))
      : baseQuery;

    const result = await queryWithFilter.orderBy(categoriesTable.name);

    return result;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

export const getCategoryById = async (id: string): Promise<Category | undefined> => {
  if (!id) return undefined;
  try {
    const result = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id));
    return result[0];
  } catch (error) {
    console.error('Failed to fetch category by ID:', error);
    return undefined;
  }
}

export const getCategoryBySlug = async (slug: string): Promise<Category | undefined> => {
  if (!slug) return undefined;
  try {
    const result = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, slug));
    return result[0];
  } catch (error) {
    console.error('Failed to fetch category by slug:', error);
    return undefined;
  }
}


// Hero Slider Functions
export const getHeroSliders = async (options?: { isActive?: boolean; type?: 'carousel' | 'promo-top' | 'promo-bottom'; limit?: number }): Promise<HeroSlider[]> => {
  try {
    const { isActive, type, limit } = options || {};
    const conditions = [];
    if (isActive !== undefined) {
      conditions.push(eq(heroSlidersTable.isActive, isActive));
    }
    if (type) {
      conditions.push(eq(heroSlidersTable.type, type));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    if (limit) {
      return await db.select().from(heroSlidersTable)
        .where(whereClause)
        .orderBy(asc(heroSlidersTable.displayOrder))
        .limit(limit) as HeroSlider[];
    }

    const result = await db.select().from(heroSlidersTable)
      .where(whereClause)
      .orderBy(asc(heroSlidersTable.displayOrder));
    return result as HeroSlider[];
  } catch (error) {
    console.error('Failed to fetch hero sliders:', error);
    return [];
  }
}

export const getHeroSliderById = async (id: string): Promise<HeroSlider | undefined> => {
  if (!id) return undefined;
  try {
    const result = await db.select().from(heroSlidersTable).where(eq(heroSlidersTable.id, id));
    return result[0] as HeroSlider;
  } catch (error) {
    console.error('Failed to fetch hero slider by ID:', error);
    return undefined;
  }
}
