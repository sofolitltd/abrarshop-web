import {
  pgTable,
  text,
  varchar,
  numeric,
  integer,
  boolean,
  timestamp,
  unique,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const brands = pgTable('brands', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar('name', { length: 256 }).notNull(),
  slug: varchar('slug', { length: 256 }).notNull().unique(),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const categories = pgTable('categories', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar('name', { length: 256 }).notNull(),
  slug: varchar('slug', { length: 256 }).notNull().unique(),
  parentId: text('parent_id').references((): any => categories.id, { onDelete: 'set null' }),
  imageUrl: text('image_url'),
  isFeatured: boolean('is_featured').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const products = pgTable('products', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  sku: integer('sku'),
  name: varchar('name', { length: 256 }).notNull(),
  slug: varchar('slug', { length: 256 }).notNull().unique(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  originalPrice: numeric('original_price', { precision: 10, scale: 2 }),
  buyPrice: numeric('buy_price', { precision: 10, scale: 2 }),
  images: text('images').array().notNull(),
  stock: integer('stock').notNull(),
  keywords: text('keywords').array().notNull(),
  categoryId: text('category_id').references(() => categories.id),
  brandId: text('brand_id').references(() => brands.id),
  isTrending: boolean('is_trending').notNull().default(false),
  isBestSelling: boolean('is_best_selling').notNull().default(false),
  isFeatured: boolean('is_featured').notNull().default(false),
  discount: numeric('discount', { precision: 5, scale: 2 }).notNull().default('0'),
  status: varchar('status', { length: 20 }).notNull().default('published'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
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
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Firebase UID
  email: varchar('email', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  phoneNumber: varchar('phone_number', { length: 20 }),
  address: text('address'),
  district: varchar('district', { length: 100 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const orders = pgTable('orders', {
  id: text('id').primaryKey().notNull(),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
  userId: text('user_id').references(() => users.id), // Added link to user
  firstName: varchar('first_name', { length: 256 }).notNull(),
  lastName: varchar('last_name', { length: 256 }).notNull(),
  mobile: varchar('mobile', { length: 20 }).notNull(),
  email: varchar('email', { length: 256 }),
  address: text('address').notNull(),
  district: varchar('district', { length: 256 }).notNull(),
  deliveryMethod: varchar('delivery_method', { length: 50 }).notNull(),
  deliveryFee: numeric('delivery_fee', { precision: 10, scale: 2 }).notNull(),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
  paymentStatus: varchar('payment_status', { length: 50 }).default('pending').notNull(),
  orderStatus: varchar('order_status', { length: 50 }).default('pending').notNull(),
  paymentId: varchar('payment_id', { length: 256 }),
  trxId: varchar('trx_id', { length: 256 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: text('id').primaryKey().notNull(),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

import { relations } from 'drizzle-orm';

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
    relationName: 'order',
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
    relationName: 'product',
  }),
}));
