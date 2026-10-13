export default async function handler(req, res) {
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

    // Очищаем токен от возможных пробелов и спецсимволов
    const rawToken = process.env.TG_BOT_TOKEN || '8729653716:AAGqgTYvVTF693QmG_lV-9wu3MzGpnFUXKA';
    const token = rawToken.trim();
    const chatId = (process.env.TG_CHAT_ID || '7903288262').trim();

    const orderNo = body.orderNo || body.order_id || body.order || '—';
    const item = body.item || body.product || body.title || '—';
    const total = body.total || body.price || body.amount || '—';
    const name = body.name || body.username || '—';
    const contact = body.contact || body.phone || body.telegram || '—';

    const text = `🛍️ НОВЫЙ ЗАКАЗ С САЙТА!\n\n` +
                 `Заказ: ${orderNo}\n` +
                 `Товар: ${item}\n` +
                 `Сумма: ${total}\n` +
                 `Имя: ${name}\n` +
                 `Контакты: ${contact}`;

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text
      })
    });

    const tgData = await tgRes.json();

    if (!tgData.ok) {
      console.error('Telegram API rejection:', tgData);
      return res.status(400).json({ error: tgData.description || 'Telegram Error', tg_data: tgData });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Crash error:', err);
    return res.status(500).json({ error: err.message });
  }
}
