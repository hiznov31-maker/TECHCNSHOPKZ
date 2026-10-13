export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderNo, item, total, name, contact } = req.body || {};
  const token = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ error: 'Telegram environment variables missing' });
  }

  const message = `🛍️ **Новый заказ!**\n\n` +
                  `📦 **Заказ:** ${orderNo || '—'}\n` +
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
      throw new Error(data.description || 'Telegram API Error');
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
