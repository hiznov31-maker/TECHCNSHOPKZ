export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderNo, item, total, name, contact } = req.body || {};
  
  // Прямое указание токена и Chat ID (если process.env пуст)
  const token = process.env.TG_BOT_TOKEN || '8729653716:AAGqgTYvVTF693QmG_lV-9wu3MzGpnFUXKA';
  const chatId = process.env.TG_CHAT_ID || '7903288262';

  const message = `🛍️ **НОВЫЙ ЗАКАЗ С САЙТА!**\n\n` +
                  `📋 **№ Заказа:** ${orderNo || '—'}\n` +
                  `📱 **Товар:** ${item || '—'}\n` +
                  `💰 **Сумма:** ${total || '—'}\n` +
                  `👤 **Имя:** ${name || '—'}\n` +
                  `📞 **Контакты:** ${contact || '—'}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    const data = await response.json();
    
    if (!data.ok) {
      // Запасной вариант простым текстом без Markdown
      const fallback = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message.replace(/\*/g, '')
        })
      });
      const fallbackData = await fallback.json();
      if (!fallbackData.ok) {
        return res.status(500).json({ error: fallbackData.description });
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
