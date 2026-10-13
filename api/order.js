export default async function handler(req, res) {
  // Разрешаем CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    body = body || {};

    const token = process.env.TG_BOT_TOKEN || '8729653716:AAGqgTYvVTF693QmG_lV-9wu3MzGpnFUXKA';
    const chatId = process.env.TG_CHAT_ID || '7903288262';

    // Вытаскиваем любые возможные названия полей с фронтенда
    const orderNo = body.orderNo || body.order_id || body.order || '—';
    const item = body.item || body.product || body.title || '—';
    const total = body.total || body.price || body.amount || '—';
    const name = body.name || body.username || '—';
    const contact = body.contact || body.phone || body.telegram || '—';

    const text = `🛍️ NEW ORDER!\n\n` +
                 `Order: ${orderNo}\n` +
                 `Item: ${item}\n` +
                 `Total: ${total}\n` +
                 `Name: ${name}\n` +
                 `Contact: ${contact}`;

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: String(chatId),
        text: text
      })
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('Telegram API rejected:', data);
      return res.status(400).json({ error: data.description || 'Telegram Error', tg_data: data });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Crash error:', err);
    return res.status(500).json({ error: err.message });
  }
}
