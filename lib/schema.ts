// lib/schema.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  name: text('name'),
  address: text('address'),
  city: text('city'),
  department: text('department'),
  whatsappNumber: text('whatsapp_number'),
  role: text('role').notNull().default('user'),
  resetToken: text('reset_token'),
  resetTokenExpires: integer('reset_token_expires'),
});

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id), // ✅ nullable
  customerEmail: text('customer_email').notNull(),       // ✅ obligatorio
  customerName: text('customer_name'),                   // ✅ opcional (de PayPal o formulario)
  total: real('total').notNull(),
  status: text('status').notNull(),
  paymentProof: text('payment_proof'),
  paymentMethod: text('payment_method'),
  paypalOrderId: text('paypal_order_id'),
  additionalInfo: text('additional_info'),
});

export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  name: text('name').notNull(),
  price: real('price').notNull(),
});

export const behavior = sqliteTable('behavior', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  scroll: real('scroll').notNull(),
  time: integer('time').notNull(),
  clicks: integer('clicks').notNull(),
  ctaSeen: integer('ctaSeen'),
  converted: integer('converted'),
});

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(),
  image: text('image').notNull(),
  active: integer('active').default(1),
});