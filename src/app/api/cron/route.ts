import { NextResponse } from "next/server";
import { popDueMessages } from "@/lib/scheduler";
import { sendTelegramMessage } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function GET() {
  const due = await popDueMessages();
  let sent = 0;
  const failures: Array<{ id: string; chatId: string; error: unknown }> = [];
  for (const item of due) {
    const res = await sendTelegramMessage({ chatId: item.chatId, text: item.message });
    if (res.ok) {
      sent += 1;
    } else {
      failures.push({ id: item.id, chatId: item.chatId, error: res.error });
    }
  }
  return NextResponse.json({
    ok: true,
    processed: due.length,
    sent,
    failed: failures.length,
    failures,
  });
}

