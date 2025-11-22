"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [chatIds, setChatIds] = useState<string>("");
  const [message, setMessage] = useState<string>("Hello! ?? Welcome.");
  const [delayMinutes, setDelayMinutes] = useState<number>(10);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult("");
    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatIds,
          message,
          delayMinutes,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setResult(`Error: ${json?.error ?? "Request failed"}`);
      } else {
        setResult(`Scheduled ${json?.created?.length ?? 0} message(s). They will send in ${delayMinutes} minutes.`);
        setChatIds("");
      }
    } catch (err: any) {
      setResult(`Error: ${String(err)}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Telegram Greeting Scheduler</h1>
        <p>Enter Telegram chat IDs (comma-separated), a message, and schedule after 10 minutes by default.</p>
        <form onSubmit={onSubmit} className={styles.form}>
          <label>
            Chat IDs
            <input
              type="text"
              placeholder="12345678, -1001234567890"
              value={chatIds}
              onChange={(e) => setChatIds(e.target.value)}
              required
            />
          </label>
          <label>
            Message
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} required />
          </label>
          <label>
            Delay (minutes)
            <input
              type="number"
              min={1}
              value={delayMinutes}
              onChange={(e) => setDelayMinutes(parseInt(e.target.value || "10", 10))}
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? "Scheduling..." : "Schedule Greetings"}
          </button>
        </form>
        {result && <p className={styles.result}>{result}</p>}
        <div className={styles.note}>
          <p>
            Note: The bot can only message users or groups that interacted with it or where it is a member. Ensure
            environment variable <code>TELEGRAM_BOT_TOKEN</code> is configured on the server.
          </p>
        </div>
      </main>
    </div>
  );
}
