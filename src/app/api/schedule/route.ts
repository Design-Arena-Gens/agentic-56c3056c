import { NextRequest, NextResponse } from "next/server";
import { scheduleMessages } from "@/lib/scheduler";

type Body = {
  chatIds?: string[] | string;
  message?: string;
  delayMinutes?: number;
};

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const message = (body.message ?? "").toString().trim();
  const delayMinutesRaw = body.delayMinutes;
  const delayMinutes =
    typeof delayMinutesRaw === "number" && isFinite(delayMinutesRaw) && delayMinutesRaw > 0
      ? Math.floor(delayMinutesRaw)
      : 10;
  const chatIdsRaw =
    Array.isArray(body.chatIds) ? body.chatIds : typeof body.chatIds === "string" ? body.chatIds.split(",") : [];
  const chatIds = chatIdsRaw.map((c) => c.toString().trim()).filter(Boolean);

  if (!message || chatIds.length === 0) {
    return NextResponse.json({ error: "Provide 'message' and at least one 'chatId'." }, { status: 400 });
  }

  const created = await scheduleMessages({ chatIds, message, delayMinutes });
  return NextResponse.json({ ok: true, created });
}

