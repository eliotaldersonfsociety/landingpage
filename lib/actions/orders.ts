// lib/actions/orders.ts
'use server';

import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

const createOrderSchema = z.object({
  total: z.number().positive('El total debe ser mayor a 0'),
  status: z.string().min(1, 'El estado es requerido'),
  customerEmail: z.string().email('Email inválido'),
  customerName: z.string().optional(),
  paymentProof: z.string().optional(),
  paymentMethod: z.string().optional(),
  paypalOrderId: z.string().optional(),
  additionalInfo: z.string().optional(),
});

const createOrderItemsSchema = z.object({
  orderId: z.number().positive('ID de pedido inválido'),
  items: z.array(z.object({
    name: z.string().min(1, 'El nombre del item es requerido'),
    price: z.number().positive('El precio debe ser mayor a 0'),
  })).min(1, 'Debe haber al menos un item')
});

interface OrderResponse {
  success: boolean;
  error?: string;
  data?: any;
}

async function getUserIdFromTokenOptional(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: number };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function createOrderAction(formData: FormData): Promise<OrderResponse> {
  try {
    const total = parseFloat(formData.get('total')?.toString() || '0');
    const status = formData.get('status')?.toString() || '';
    const customerEmail = formData.get('customerEmail')?.toString() || '';
    const customerName = formData.get('customerName')?.toString() || '';
    const file = formData.get('file') as File;
    const paymentMethod = formData.get('paymentMethod')?.toString() || undefined;
    const paypalOrderId = formData.get('paypalOrderId')?.toString() || undefined;
    const additionalInfo = formData.get('additionalInfo')?.toString() || undefined;

    let paymentProof: string | undefined;
    if (file) {
      if (file.size > 1024 * 1024) {
        return { success: false, error: 'File size must be less than 1MB' };
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        return { success: false, error: 'Invalid file type. Only JPG, PNG, PDF allowed' };
      }
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const result = await imagekit.upload({
        file: buffer,
        fileName: file.name,
        folder: '/payment-proofs',
      });
      paymentProof = result.url;
    }

    const validatedData = createOrderSchema.parse({
      total,
      status,
      customerEmail,
      customerName,
      paymentProof,
      paymentMethod,
      paypalOrderId,
      additionalInfo,
    });

    const userId = await getUserIdFromTokenOptional();

    const result = await db.insert(orders).values({
      userId,
      customerEmail: validatedData.customerEmail,
      customerName: validatedData.customerName || null,
      total: validatedData.total,
      status: validatedData.status,
      paymentProof: validatedData.paymentProof,
      paymentMethod: validatedData.paymentMethod,
      paypalOrderId: validatedData.paypalOrderId,
      additionalInfo: validatedData.additionalInfo,
    }).returning({
      id: orders.id,
      userId: orders.userId,
      customerEmail: orders.customerEmail,
      customerName: orders.customerName,
      total: orders.total,
      status: orders.status,
      paymentProof: orders.paymentProof,
      paymentMethod: orders.paymentMethod,
      paypalOrderId: orders.paypalOrderId,
      additionalInfo: orders.additionalInfo,
    });

    return {
      success: true,
      data: { order: result[0] },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Datos inválidos' };
    }
    console.error('Create order error:', error);
    return { success: false, error: 'Error creating order' };
  }
}

export async function createOrderItemsAction(formData: FormData): Promise<OrderResponse> {
  try {
    const orderId = parseInt(formData.get('orderId')?.toString() || '0');
    const itemsJson = formData.get('items')?.toString() || '[]';

    let items: Array<{ name: string; price: number }>;
    try {
      items = JSON.parse(itemsJson);
    } catch {
      return { success: false, error: 'Invalid items format' };
    }

    const validatedData = createOrderItemsSchema.parse({ orderId, items });

    const orderExists = await db.select().from(orders).where(eq(orders.id, validatedData.orderId)).limit(1);
    if (orderExists.length === 0) {
      return { success: false, error: 'Order not found' };
    }

    const itemsToInsert = validatedData.items.map(item => ({
      orderId: validatedData.orderId,
      name: item.name,
      price: item.price,
    }));

    const result = await db.insert(orderItems).values(itemsToInsert).returning({
      id: orderItems.id,
      orderId: orderItems.orderId,
      name: orderItems.name,
      price: orderItems.price,
    });

    return {
      success: true,
      data: { items: result },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Datos inválidos' };
    }
    console.error('Create order items error:', error);
    return { success: false, error: 'Error creating order items' };
  }
}

export async function getAllOrdersAction(): Promise<OrderResponse> {
  try {
    const ordersResult = await db.select({
      id: orders.id,
      userId: orders.userId,
      customerEmail: orders.customerEmail,
      customerName: orders.customerName,
      total: orders.total,
      status: orders.status,
      paymentProof: orders.paymentProof,
      paymentMethod: orders.paymentMethod,
      paypalOrderId: orders.paypalOrderId,
      additionalInfo: orders.additionalInfo,
    }).from(orders);

    // Get items for each order
    const ordersWithItems = await Promise.all(
      ordersResult.map(async (order) => {
        const items = await db.select({
          id: orderItems.id,
          name: orderItems.name,
          price: orderItems.price,
        }).from(orderItems).where(eq(orderItems.orderId, order.id));

        return { ...order, items };
      })
    );

    return {
      success: true,
      data: { orders: ordersWithItems },
    };
  } catch (error) {
    console.error('Get all orders error:', error);
    return { success: false, error: 'Error fetching orders' };
  }
}

export async function updateOrderStatusAction(formData: FormData): Promise<OrderResponse> {
  try {
    const orderId = parseInt(formData.get('orderId')?.toString() || '0');
    const status = formData.get('status')?.toString() || '';

    if (!orderId || !status) {
      return { success: false, error: 'Order ID and status are required' };
    }

    await db.update(orders).set({ status }).where(eq(orders.id, orderId));

    return {
      success: true,
    };
  } catch (error) {
    console.error('Update order status error:', error);
    return { success: false, error: 'Error updating order status' };
  }
}

export async function getUserOrdersAction(): Promise<OrderResponse> {
  try {
    const userId = await getUserIdFromTokenOptional();
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    const ordersResult = await db.select({
      id: orders.id,
      userId: orders.userId,
      customerEmail: orders.customerEmail,
      customerName: orders.customerName,
      total: orders.total,
      status: orders.status,
      paymentProof: orders.paymentProof,
      paymentMethod: orders.paymentMethod,
      paypalOrderId: orders.paypalOrderId,
      additionalInfo: orders.additionalInfo,
    }).from(orders).where(eq(orders.userId, userId));

    // Get items for each order
    const ordersWithItems = await Promise.all(
      ordersResult.map(async (order) => {
        const items = await db.select({
          id: orderItems.id,
          name: orderItems.name,
          price: orderItems.price,
        }).from(orderItems).where(eq(orderItems.orderId, order.id));

        return { ...order, items };
      })
    );

    return {
      success: true,
      data: { orders: ordersWithItems },
    };
  } catch (error) {
    console.error('Get user orders error:', error);
    return { success: false, error: 'Error fetching user orders' };
  }
}