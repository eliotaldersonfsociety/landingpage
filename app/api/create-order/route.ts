// app/api/create-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/schema';

export async function POST(request: NextRequest) {
  try {
    const { productId, productName, price, paypalOrderId, payerEmail, payerName } = await request.json();

    // Validate required fields
    if (!productId || !productName || !price || !paypalOrderId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create order
    const orderResult = await db.insert(orders).values({
      customerEmail: payerEmail || null,
      customerName: payerName || null,
      total: price,
      status: 'completed',
      paymentMethod: 'paypal',
      paypalOrderId,
    }).returning({ id: orders.id });

    const orderId = orderResult[0].id;

    // Create order item
    await db.insert(orderItems).values({
      orderId,
      name: productName,
      price,
    });

    return NextResponse.json({ success: true, orderId });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}