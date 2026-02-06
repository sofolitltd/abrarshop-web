import type { Product, Brand, Category, HeroSlider, Review } from '@/lib/types';
import { db } from '@/lib/db';
import { products as productsTable, categories as categoriesTable, brands as brandsTable, heroSliders as heroSlidersTable, reviews as reviewsTable } from '@/lib/schema';
import { eq, desc, asc, isNull, sql, or, ilike, and, ne, count as drizzleCount } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

// Product Functions
export const getProducts = async (options?: { query?: string, limit?: number, page?: number, isTrending?: boolean, isBestSelling?: boolean, isFeatured?: boolean, sortBy?: string, categoryId?: string, categoryIds?: string[], brandId?: string, brandIds?: string[], excludeProductId?: string }): Promise<{ products: Product[], totalCount: number }> => {
  const { query, limit, page, isTrending, isBestSelling, isFeatured, sortBy, categoryId, categoryIds, brandId, brandIds, excludeProductId } = options || {};
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

    // Handle multiple categories with hierarchical expansion
    if (categoryId || (categoryIds && categoryIds.length > 0)) {
      const allCategories = await db.select().from(categoriesTable);
      const selectedCategoryIds = categoryIds && categoryIds.length > 0 ? categoryIds : [categoryId!];
      const allCategoryIds: string[] = [];

      // For each selected category, get all its descendants
      selectedCategoryIds.forEach(catId => {
        if (catId) {
          allCategoryIds.push(catId);

          const getDescendants = (parentId: string) => {
            const children = allCategories.filter(c => c.parentId === parentId);
            children.forEach(child => {
              allCategoryIds.push(child.id);
              getDescendants(child.id);
            });
          };

          getDescendants(catId);
        }
      });

      // Remove duplicates
      const uniqueCategoryIds = [...new Set(allCategoryIds)];

      // Use IN clause for multiple category IDs
      if (uniqueCategoryIds.length > 0) {
        conditions.push(sql`${productsTable.categoryId} IN (${sql.join(uniqueCategoryIds.map(id => sql`${id}`), sql`, `)})`);
      }
    }

    // Handle multiple brands
    if (brandId || (brandIds && brandIds.length > 0)) {
      const selectedBrandIds = brandIds && brandIds.length > 0 ? brandIds : [brandId!];
      const validBrandIds = selectedBrandIds.filter(Boolean);

      if (validBrandIds.length > 1) {
        conditions.push(sql`${productsTable.brandId} IN (${sql.join(validBrandIds.map(id => sql`${id}`), sql`, `)})`);
      } else if (validBrandIds.length === 1) {
        conditions.push(eq(productsTable.brandId, validBrandIds[0]));
      }
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
    const totalCount = Number(totalCountResult[0].value);

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
        status: productsTable.status,
        discount: productsTable.discount,
        createdAt: productsTable.createdAt,
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
        productQuery = productQuery.orderBy(desc(productsTable.createdAt));
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
      discount: Number(p.discount),
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
        status: productsTable.status,
        discount: productsTable.discount,
        createdAt: productsTable.createdAt,
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
      discount: Number(product.discount),
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
        status: productsTable.status,
        discount: productsTable.discount,
        createdAt: productsTable.createdAt,
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
      discount: Number(product.discount),
    } as Product;
  } catch (error) {
    console.error('Failed to fetch product by slug:', error);
    return undefined;
  }
};



// Brand Functions (Categorized)
export const getBrandsByCategoryId = async (categoryId: string): Promise<Brand[]> => {
  try {
    // 1. Get the category and all its descendants to match the logic in getProducts
    const allCategories = await db.select().from(categoriesTable);
    const allCategoryIds: string[] = [categoryId];

    const getDescendants = (parentId: string) => {
      const children = allCategories.filter(c => c.parentId === parentId);
      children.forEach(child => {
        allCategoryIds.push(child.id);
        getDescendants(child.id);
      });
    };
    getDescendants(categoryId);

    // 2. Fetch distinct brands that have products in these categories
    const result = await db
      .selectDistinct({
        id: brandsTable.id,
        name: brandsTable.name,
        slug: brandsTable.slug,
        imageUrl: brandsTable.imageUrl,
        createdAt: brandsTable.createdAt,
        updatedAt: brandsTable.updatedAt,
      })
      .from(brandsTable)
      .innerJoin(productsTable, eq(productsTable.brandId, brandsTable.id))
      .where(sql`${productsTable.categoryId} IN (${sql.join(allCategoryIds.map(id => sql`${id}`), sql`, `)})`)
      .orderBy(brandsTable.name);

    return result as Brand[];
  } catch (error) {
    console.error('Failed to fetch brands by category:', error);
    return [];
  }
};

export const getBrandsByCategoryIds = async (categoryIds: string[]): Promise<Brand[]> => {
  if (!categoryIds || categoryIds.length === 0) {
    return getBrands();
  }
  try {
    const allCategories = await db.select().from(categoriesTable);
    const allCategoryIds: string[] = [];

    categoryIds.forEach(catId => {
      allCategoryIds.push(catId);
      const getDescendants = (parentId: string) => {
        const children = allCategories.filter(c => c.parentId === parentId);
        children.forEach(child => {
          allCategoryIds.push(child.id);
          getDescendants(child.id);
        });
      };
      getDescendants(catId);
    });

    const uniqueCategoryIds = [...new Set(allCategoryIds)];

    const result = await db
      .selectDistinct({
        id: brandsTable.id,
        name: brandsTable.name,
        slug: brandsTable.slug,
        imageUrl: brandsTable.imageUrl,
        createdAt: brandsTable.createdAt,
        updatedAt: brandsTable.updatedAt,
      })
      .from(brandsTable)
      .innerJoin(productsTable, eq(productsTable.brandId, brandsTable.id))
      .where(sql`${productsTable.categoryId} IN (${sql.join(uniqueCategoryIds.map(id => sql`${id}`), sql`, `)})`)
      .orderBy(brandsTable.name);

    return result as Brand[];
  } catch (error) {
    console.error('Failed to fetch brands by category IDs:', error);
    return [];
  }
};
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
export const getCategories = async (options?: { topLevelOnly?: boolean, isFeatured?: boolean }): Promise<Category[]> => {
  try {
    const { topLevelOnly, isFeatured } = options || {};
    const parentCategories = alias(categoriesTable, 'parent');

    const baseQuery = db
      .select({
        id: categoriesTable.id,
        name: categoriesTable.name,
        slug: categoriesTable.slug,
        parentId: categoriesTable.parentId,
        parentName: parentCategories.name,
        imageUrl: categoriesTable.imageUrl,
        isFeatured: categoriesTable.isFeatured,
        createdAt: categoriesTable.createdAt,
        updatedAt: categoriesTable.updatedAt,
      })
      .from(categoriesTable)
      .leftJoin(parentCategories, eq(categoriesTable.parentId, parentCategories.id));

    const conditions = [];
    if (topLevelOnly) {
      conditions.push(isNull(categoriesTable.parentId));
    }
    if (isFeatured !== undefined) {
      conditions.push(eq(categoriesTable.isFeatured, isFeatured));
    }

    const queryWithFilter = conditions.length > 0
      ? baseQuery.where(and(...conditions))
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

export const getCategoriesByBrandId = async (brandId: string): Promise<Category[]> => {
  try {
    const parentCategories = alias(categoriesTable, 'parent');

    const result = await db
      .selectDistinct({
        id: categoriesTable.id,
        name: categoriesTable.name,
        slug: categoriesTable.slug,
        parentId: categoriesTable.parentId,
        parentName: parentCategories.name,
        imageUrl: categoriesTable.imageUrl,
        isFeatured: categoriesTable.isFeatured,
        createdAt: categoriesTable.createdAt,
        updatedAt: categoriesTable.updatedAt,
      })
      .from(categoriesTable)
      .innerJoin(productsTable, eq(productsTable.categoryId, categoriesTable.id))
      .leftJoin(parentCategories, eq(categoriesTable.parentId, parentCategories.id))
      .where(eq(productsTable.brandId, brandId))
      .orderBy(categoriesTable.name);

    // Also need to include all parent categories of these categories to maintain the hierarchy in the UI
    const categoryIds = result.map(c => c.id);
    const parentIds = result.map(c => c.parentId).filter(Boolean) as string[];

    if (parentIds.length === 0) return result as Category[];

    const allCategories = await db.select().from(categoriesTable);
    const finalCategoryIds = new Set(categoryIds);

    parentIds.forEach(pId => {
      let currentId: string | null = pId;
      while (currentId) {
        finalCategoryIds.add(currentId);
        const parent = allCategories.find(c => c.id === currentId);
        currentId = parent?.parentId || null;
      }
    });

    const finalResult = allCategories
      .filter(c => finalCategoryIds.has(c.id))
      .map(c => {
        const parent = allCategories.find(p => p.id === c.parentId);
        return {
          ...c,
          parentName: parent?.name || null
        };
      });

    return finalResult as Category[];
  } catch (error) {
    console.error('Failed to fetch categories by brand:', error);
    return [];
  }
};

export const getFilteredBrands = async (options?: { categoryIds?: string[], query?: string, isTrending?: boolean, isBestSelling?: boolean, isFeatured?: boolean }): Promise<Brand[]> => {
  const { categoryIds, query, isTrending, isBestSelling, isFeatured } = options || {};
  try {
    const conditions = [];
    if (isTrending) conditions.push(eq(productsTable.isTrending, true));
    if (isBestSelling) conditions.push(eq(productsTable.isBestSelling, true));
    if (isFeatured) conditions.push(eq(productsTable.isFeatured, true));
    if (query && query.trim().length > 0) {
      const searchPattern = `%${query.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`;
      conditions.push(or(
        ilike(productsTable.name, searchPattern),
        ilike(productsTable.description, searchPattern),
        ilike(sql`array_to_string(${productsTable.keywords}, ' ')`, searchPattern)
      ));
    }

    // Handle categories (including descendants)
    if (categoryIds && categoryIds.length > 0) {
      const allCategories = await db.select().from(categoriesTable);
      const allCategoryIds: string[] = [];
      categoryIds.forEach(catId => {
        allCategoryIds.push(catId);
        const getDescendants = (parentId: string) => {
          const children = allCategories.filter(c => c.parentId === parentId);
          children.forEach(child => {
            allCategoryIds.push(child.id);
            getDescendants(child.id);
          });
        };
        getDescendants(catId);
      });
      const uniqueCategoryIds = [...new Set(allCategoryIds)];
      if (uniqueCategoryIds.length > 0) {
        conditions.push(sql`${productsTable.categoryId} IN (${sql.join(uniqueCategoryIds.map(id => sql`${id}`), sql`, `)})`);
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
      .selectDistinct({
        id: brandsTable.id,
        name: brandsTable.name,
        slug: brandsTable.slug,
        imageUrl: brandsTable.imageUrl,
        createdAt: brandsTable.createdAt,
        updatedAt: brandsTable.updatedAt,
      })
      .from(brandsTable)
      .innerJoin(productsTable, eq(productsTable.brandId, brandsTable.id))
      .where(whereClause)
      .orderBy(brandsTable.name);

    return result as Brand[];
  } catch (error) {
    console.error('Failed to fetch filtered brands:', error);
    return [];
  }
};

export const getFilteredCategories = async (options?: { brandIds?: string[], query?: string, isTrending?: boolean, isBestSelling?: boolean, isFeatured?: boolean }): Promise<Category[]> => {
  const { brandIds, query, isTrending, isBestSelling, isFeatured } = options || {};
  try {
    const parentCategories = alias(categoriesTable, 'parent');
    const conditions = [];
    if (isTrending) conditions.push(eq(productsTable.isTrending, true));
    if (isBestSelling) conditions.push(eq(productsTable.isBestSelling, true));
    if (isFeatured) conditions.push(eq(productsTable.isFeatured, true));
    if (query && query.trim().length > 0) {
      const searchPattern = `%${query.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`;
      conditions.push(or(
        ilike(productsTable.name, searchPattern),
        ilike(productsTable.description, searchPattern),
        ilike(sql`array_to_string(${productsTable.keywords}, ' ')`, searchPattern)
      ));
    }

    if (brandIds && brandIds.length > 0) {
      const validBrandIds = brandIds.filter(Boolean);
      if (validBrandIds.length > 0) {
        conditions.push(sql`${productsTable.brandId} IN (${sql.join(validBrandIds.map(id => sql`${id}`), sql`, `)})`);
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
      .selectDistinct({
        id: categoriesTable.id,
        name: categoriesTable.name,
        slug: categoriesTable.slug,
        parentId: categoriesTable.parentId,
        parentName: parentCategories.name,
        imageUrl: categoriesTable.imageUrl,
        isFeatured: categoriesTable.isFeatured,
        createdAt: categoriesTable.createdAt,
        updatedAt: categoriesTable.updatedAt,
      })
      .from(categoriesTable)
      .innerJoin(productsTable, eq(productsTable.categoryId, categoriesTable.id))
      .leftJoin(parentCategories, eq(categoriesTable.parentId, parentCategories.id))
      .where(whereClause)
      .orderBy(categoriesTable.name);

    // Expand to include all parent categories to maintain hierarchy
    const categoryIds = result.map(c => c.id);
    const parentIds = result.map(c => c.parentId).filter(Boolean) as string[];
    if (parentIds.length === 0) return result as Category[];

    const allCategoriesData = await db.select().from(categoriesTable);
    const finalCategoryIds = new Set(categoryIds);
    parentIds.forEach(pId => {
      let currentId: string | null = pId;
      while (currentId) {
        finalCategoryIds.add(currentId);
        const parent = allCategoriesData.find(c => c.id === currentId);
        currentId = parent?.parentId || null;
      }
    });

    const finalResult = allCategoriesData
      .filter(c => finalCategoryIds.has(c.id))
      .map(c => {
        const parent = allCategoriesData.find(p => p.id === c.parentId);
        return {
          ...c,
          parentName: parent?.name || null
        };
      });

    return finalResult as Category[];
  } catch (error) {
    console.error('Failed to fetch filtered categories:', error);
    return [];
  }
};

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

export const getProductReviews = async (productId: string): Promise<Review[]> => {
  if (!productId) return [];
  try {
    const result = await db.query.reviews.findMany({
      where: (reviews, { eq }) => eq(reviews.productId, productId),
      orderBy: (reviews, { desc }) => [desc(reviews.createdAt)],
    });
    return result as Review[];
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return [];
  }
}

