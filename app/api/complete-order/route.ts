// app/api/complete-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { orderId, name, address, city, department, whatsappNumber } = await request.json();

    if (!orderId || !name || !address || !city || !department || !whatsappNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update order with shipping details
    await db.update(orders)
      .set({
        customerName: name,
        additionalInfo: JSON.stringify({ address, city, department, whatsappNumber }),
        status: 'shipped', // or whatever status for completed
      })
      .where(eq(orders.id, parseInt(orderId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Complete order error:', error);
    return NextResponse.json({ error: 'Failed to complete order' }, { status: 500 });
  }
}