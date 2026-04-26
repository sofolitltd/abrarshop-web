export async function sendTelegramNotification(orderData: {
  orderNumber: string;
  customerName: string;
  phone: string;
  items: string[];
  totalAmount: string;
  address: string;
  orderId?: string;
}) {
  const botToken = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!botToken || !chatId) {
    console.warn('Telegram notification skipped: TG_BOT_TOKEN or TG_CHAT_ID not set');
    return;
  }

  const adminLink = `\n\n🔗 <a href="${baseUrl}/admin/orders/${orderData.orderNumber}">View in Admin Panel</a>`;

  const text = `
🛒 <b>New Order এসেছে!</b> (#${orderData.orderNumber})

👤 <b>Name:</b> ${orderData.customerName}
📞 <b>Phone:</b> ${orderData.phone}
📦 <b>Products:</b>
${orderData.items.map(item => `  • ${item}`).join('\n')}
💰 <b>Total:</b> ${orderData.totalAmount} TK
📍 <b>Address:</b> ${orderData.address}${adminLink}
  `;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text.trim(),
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
    }
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
  }
}

export async function sendContactMessageNotification(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const botToken = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn('Telegram notification skipped: TG_BOT_TOKEN or TG_CHAT_ID not set');
    return;
  }

  const text = `
📩 <b>New Contact Message!</b>

👤 <b>Name:</b> ${data.name}
📧 <b>Email:</b> ${data.email}
📝 <b>Subject:</b> ${data.subject}
💬 <b>Message:</b>
${data.message}
  `;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text.trim(),
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
    }
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
  }
}
