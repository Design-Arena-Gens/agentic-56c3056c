export async function sendTelegramMessage(params: {
  chatId: string;
  text: string;
  parseMode?: "Markdown" | "HTML";
}): Promise<{ ok: boolean; response?: unknown; error?: unknown }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return { ok: false, error: "Missing TELEGRAM_BOT_TOKEN" };
  }
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: params.chatId,
        text: params.text,
        parse_mode: params.parseMode ?? "Markdown",
        disable_web_page_preview: true,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      return { ok: false, error: json };
    }
    return { ok: true, response: json };
  } catch (err) {
    return { ok: false, error: err };
  }
}

