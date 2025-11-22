import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export type ScheduledMessage = {
  id: string;
  chatId: string;
  message: string;
  dueAtMs: number;
  createdAtMs: number;
};

const STORAGE_FILE_PATH = "/tmp/schedules.json";

async function ensureStorageFile(): Promise<void> {
  try {
    await fs.access(STORAGE_FILE_PATH);
  } catch {
    const dir = path.dirname(STORAGE_FILE_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(STORAGE_FILE_PATH, JSON.stringify({ items: [] }), "utf-8");
  }
}

async function readAll(): Promise<ScheduledMessage[]> {
  await ensureStorageFile();
  try {
    const raw = await fs.readFile(STORAGE_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as { items: ScheduledMessage[] };
    return Array.isArray(parsed.items) ? parsed.items : [];
  } catch {
    // Reset corrupted file
    await fs.writeFile(STORAGE_FILE_PATH, JSON.stringify({ items: [] }), "utf-8");
    return [];
  }
}

async function writeAll(items: ScheduledMessage[]): Promise<void> {
  await ensureStorageFile();
  await fs.writeFile(STORAGE_FILE_PATH, JSON.stringify({ items }), "utf-8");
}

export async function scheduleMessages(params: {
  chatIds: string[];
  message: string;
  delayMinutes?: number;
}): Promise<ScheduledMessage[]> {
  const { chatIds, message } = params;
  const delayMinutes = params.delayMinutes ?? 10;
  const now = Date.now();
  const dueAtMs = now + delayMinutes * 60 * 1000;
  const existing = await readAll();
  const newItems: ScheduledMessage[] = chatIds.map((chatId) => ({
    id: crypto.randomUUID(),
    chatId,
    message,
    dueAtMs,
    createdAtMs: now,
  }));
  const updated = existing.concat(newItems);
  await writeAll(updated);
  return newItems;
}

export async function popDueMessages(nowMs?: number): Promise<ScheduledMessage[]> {
  const now = nowMs ?? Date.now();
  const all = await readAll();
  const due: ScheduledMessage[] = [];
  const pending: ScheduledMessage[] = [];
  for (const item of all) {
    if (item.dueAtMs <= now) {
      due.push(item);
    } else {
      pending.push(item);
    }
  }
  if (due.length > 0) {
    await writeAll(pending);
  }
  return due;
}

export async function getAllScheduled(): Promise<ScheduledMessage[]> {
  return readAll();
}

