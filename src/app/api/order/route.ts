import { db } from '@/lib/db';
import { orders } from '@/lib/schema';
import { createId } from '@paralleldrive/cuid2';
import { sendTelegramNotification } from '@/lib/telegram';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 👉 1. Save order to Neon DB here
    const orderNumber = `QO-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;
    const nameParts = (body.name || 'Guest User').split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || 'User';

    // Note: The orders table has several required fields. 
    // We're using defaults here to match the simple body provided in the snippet.
    const [newOrder] = await db.insert(orders).values({
      id: createId(),
      orderNumber,
      firstName,
      lastName,
      mobile: body.phone || '00000000000',
      address: body.address || 'Address not provided',
      district: body.district || 'District not provided',
      deliveryMethod: 'full_country',
      deliveryFee: '100',
      totalAmount: String(body.price || '0'),
      paymentMethod: 'cod',
      orderSource: 'quick_order',
    }).returning();

    // 👉 2. Send Telegram notification
    await sendTelegramNotification({
      orderNumber: orderNumber,
      customerName: body.name,
      phone: body.phone,
      items: [`${body.product || 'Product'} (Quick Order)`],
      totalAmount: String(body.price || '0'),
      address: body.address || 'Not provided',
      orderId: newOrder.id,
    });

    return Response.json({ 
      success: true, 
      orderId: newOrder.id,
      orderNumber: orderNumber 
    });
  } catch (error) {
    console.error('API Order Error:', error);
    return Response.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Internal Server Error' 
    }, { status: 500 });
  }
}
