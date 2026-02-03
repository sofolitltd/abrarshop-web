import {
  pgTable,
  text,
  varchar,
  numeric,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const brands = pgTable('brands', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar('name', { length: 256 }).notNull(),
  slug: varchar('slug', { length: 256 }).notNull().unique(),
  imageUrl: text('image_url'),
});

export const categories = pgTable('categories', {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    name: varchar('name', { length: 256 }).notNull(),
    slug: varchar('slug', { length: 256 }).notNull().unique(),
    parentId: text('parent_id').references((): any => categories.id, { onDelete: 'set null' }),
    imageUrl: text('image_url'),
});

export const products = pgTable('products', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  sku: varchar('sku', { length: 100 }),
  name: varchar('name', { length: 256 }).notNull(),
  slug: varchar('slug', { length: 256 }).notNull().unique(),
  description: text('description').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  originalPrice: numeric('original_price', { precision: 10, scale: 2 }),
  buyPrice: numeric('buy_price', { precision: 10, scale: 2 }),
  images: text('images').array().notNull(),
  stock: integer('stock').notNull(),
  keywords: text('keywords').array().notNull(),
  categoryId: text('category_id').notNull().references(() => categories.id),
  brandId: text('brand_id').notNull().references(() => brands.id),
  isTrending: boolean('is_trending').notNull().default(false),
  isBestSelling: boolean('is_best_selling').notNull().default(false),
  isFeatured: boolean('is_featured').notNull().default(false),
});

export const heroSliders = pgTable('hero_sliders', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  title: varchar('title', { length: 256 }).notNull(),
  subtitle: text('subtitle'),
  imageUrl: text('image_url').notNull(),
  link: text('link'),
  displayOrder: integer('display_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(false),
  type: varchar('type', { length: 50 }).notNull().default('carousel'), // 'carousel', 'promo-top', 'promo-bottom'
});
