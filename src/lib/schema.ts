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
  version: integer('version').notNull().default(0),
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
  orderSource: varchar('order_source', { length: 20 }).default('online').notNull(),
  paymentId: varchar('payment_id', { length: 256 }),
  trxId: varchar('trx_id', { length: 256 }),
  processingAt: timestamp('processing_at'),
  shippedAt: timestamp('shipped_at'),
  deliveredAt: timestamp('delivered_at'),
  cancelledAt: timestamp('cancelled_at'),
  paidAt: timestamp('paid_at'),
  couponId: text('coupon_id').references(() => coupons.id),
  discountAmount: numeric('discount_amount', { precision: 10, scale: 2 }).default('0').notNull(),
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

export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  coupon: one(coupons, {
    fields: [orders.couponId],
    references: [coupons.id],
  }),
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

export const coupons = pgTable('coupons', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  code: varchar('code', { length: 50 }).notNull().unique(),
  discountType: varchar('discount_type', { length: 20 }).notNull(), // 'percentage', 'fixed'
  discountValue: numeric('discount_value', { precision: 10, scale: 2 }).notNull(),
  minOrderAmount: numeric('min_order_amount', { precision: 10, scale: 2 }).default('0'),
  maxDiscountAmount: numeric('max_discount_amount', { precision: 10, scale: 2 }),
  usageLimit: integer('usage_limit'),
  usedCount: integer('used_count').default(0).notNull(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const couponsRelations = relations(coupons, ({ many }) => ({
  orders: many(orders),
}));

export const reviews = pgTable('reviews', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }), // Made optional in case we allow guest reviews later, but for now enforcing in logic
  userName: varchar('user_name', { length: 256 }).notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  status: varchar('status', { length: 20 }).notNull().default('approved'), // approved, pending, rejected
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
    relationName: 'product_reviews',
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
    relationName: 'user_reviews',
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  reviews: many(reviews, { relationName: 'product_reviews' }),
  orderItems: many(orderItems, { relationName: 'product' }),
}));

export const admins = pgTable('admins', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  password: text('password').notNull(),
  role: varchar('role', { length: 50 }).notNull().default('staff'), // superadmin, staff, manager
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
