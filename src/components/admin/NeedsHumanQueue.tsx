"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  fetchNeedsHumanAction,
  handBackAction,
  takeOverAction,
  type ConversationActionResult,
} from "@/lib/actions/dentexgo-conversations";
import type { DentexgoConversation } from "@/lib/dentexgo/conversations";
import { formatTime } from "@/lib/utils/datetime";
import { ConversationChat } from "./ConversationChat";

const POLL_MS = 30_000;

/**
 * How long this patient has been waiting. An escalation auto-returns to the bot
 * after 30 minutes unhandled, so the elapsed time is the whole point of the row.
 */
function waitingLabel(since: string | null, now: number): string {
  if (!since) return "";
  const mins = Math.max(0, Math.floor((now - new Date(since).getTime()) / 60_000));
  if (mins < 1) return "дөнгөж сая";
  if (mins < 60) return `${mins} минут хүлээж байна`;
  const hours = Math.floor(mins / 60);
  return `${hours} цаг ${mins % 60} минут хүлээж байна`;
}

/**
 * Clinic-local (Ulaanbaatar) wall clock, via the shared formatter.
 *
 * `lastSync` starts as the server's timestamp and is rendered during SSR, then
 * again on the client — so this string has to be identical in both. A bare
 * `toLocaleTimeString` is not: the server resolved `mn-MN` to a 24-hour clock
 * and the browser to a 12-hour one ("17:38" vs "05:38 PM"), and the server runs
 * in UTC while staff are at +08. `formatTime` pins both `timeZone` and
 * `hour12: false`, which is why it exists.
 */
function timeLabel(ts: number): string {
  return formatTime(new Date(ts));
}

async function copyToClipboard(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} хуулагдлаа`);
  } catch {
    toast.error("Хуулж чадсангүй");
  }
}

export function NeedsHumanQueue({
  initialConversations,
  initialError,
  /**
   * The server's clock at render time. Passed in rather than read with
   * Date.now() during render, which the repo's react-hooks/purity rule rejects.
   */
  serverNow,
}: {
  initialConversations: DentexgoConversation[];
  initialError: string | null;
  serverNow: number;
}) {
  const [rows, setRows] = useState(initialConversations);
  const [error, setError] = useState(initialError);
  const [now, setNow] = useState(serverNow);
  // The rows came straight from the server at render time, so the queue is
  // already fresh as of serverNow — not "never synced" until the first poll.
  const [lastSync, setLastSync] = useState<number | null>(serverNow);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  /** Conversation whose chat panel is open, by id. */
  const [chatId, setChatId] = useState<string | null>(null);
  /**
   * Bumped by every successful action. A poll that began before a mutation
   * landed is already stale — applying it would resurrect a row the admin just
   * resolved, so its result is dropped and the next poll reflects the server.
   */
  const mutationRef = useRef(0);

  const refresh = useCallback(async () => {
    const seenMutations = mutationRef.current;
    setRefreshing(true);
    const res = await fetchNeedsHumanAction();
    setRefreshing(false);
    // Inside a callback, not render — Date.now() is fine here.
    setNow(Date.now());
    // A mutation (take-over/hand-back) that landed after this poll started
    // makes the response stale — on both the success and failure paths, since
    // an in-flight poll's error is just as stale as its data would be.
    if (mutationRef.current !== seenMutations) return;
    if (!res.ok) {
      // Keep whatever is on screen — a failed poll must never blank the queue.
      setError(res.error);
      return;
    }
    setError(null);
    setRows(res.conversations);
    setLastSync(Date.now());
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      void refresh();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  async function run(
    id: string,
    fn: (id: string) => Promise<ConversationActionResult>,
  ): Promise<ConversationActionResult> {
    setBusyId(id);
    try {
      const res = await fn(id);
      if (res.ok) mutationRef.current += 1;
      else toast.error(res.error);
      return res;
    } catch (e) {
      // A Server Action transport failure, not a Dentexgo error — the actions
      // handle those themselves and return { ok: false }.
      console.error("[NeedsHumanQueue] action failed:", e);
      const error = "Үйлдэл гүйцэтгэж чадсангүй. Дахин оролдоно уу.";
      toast.error(error);
      return { ok: false, error };
    } finally {
      setBusyId(null);
    }
  }

  function handleTakeOver(id: string) {
    void run(id, takeOverAction).then((res) => {
      if (!res.ok) return;
      setRows((prev) => prev.map((r) => (r.id === id ? res.conversation : r)));
      toast.success(`Бот ${res.pausedHours ?? 12} цаг чимээгүй болно.`);
    });
  }

  function handleHandBack(id: string) {
    void run(id, handBackAction).then((res) => {
      if (!res.ok) return;
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast.success("Бот руу буцаагдлаа.");
    });
  }

  const chatConversation = chatId
    ? (rows.find((r) => r.id === chatId) ?? null)
    : null;

  return (
    <section className="rounded-[16px] bg-white p-5 shadow-[0_8px_20px_-14px_rgba(15,23,42,0.15)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="font-display text-[15px] font-extrabold text-[#0f172a]">
            Хүн шаардсан яриа
          </h2>
          {rows.length > 0 && (
            <span className="inline-flex min-w-[22px] justify-center rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-bold text-danger">
              {rows.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {lastSync && (
            <span className="text-[10px] text-[#6b7280]">
              {timeLabel(lastSync)}-д шинэчилсэн
            </span>
          )}
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={refreshing}
            className="cursor-pointer rounded text-[11px] font-bold text-[#0c7b6e] hover:underline disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c7b6e] focus-visible:ring-offset-2"
          >
            {refreshing ? "Шинэчилж байна…" : "Шинэчлэх"}
          </button>
        </div>
      </div>

      {/* The list refreshes itself every 30s. Without a live region a screen
          reader user gets no signal that a patient just joined the queue. */}
      <p className="sr-only" role="status" aria-live="polite">
        {rows.length === 0
          ? "Хүлээгдэж байгаа яриа байхгүй."
          : `${rows.length} яриа хүн шаардаж байна.`}
      </p>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-xl bg-danger/10 px-3 py-2 text-[11px] text-danger"
        >
          {error}
        </p>
      )}

      {rows.length === 0 && !error && (
        <p className="mt-4 text-[12px] text-[#6b7280]">
          Хүлээгдэж байгаа яриа байхгүй.
        </p>
      )}

      <ul className="mt-3 space-y-2.5">
        {rows.map((c) => {
          const busy = busyId === c.id;
          return (
            <li
              key={c.id}
              className="rounded-[14px] border border-line px-4 py-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-[13px] font-bold text-[#0f172a]">
                      {c.patient_name || c.psid}
                    </p>
                    <span className="rounded-full bg-[#f3f4f6] px-2 py-0.5 text-[10px] font-semibold text-[#6b7280]">
                      {c.channel === "instagram" ? "Instagram" : "Messenger"}
                    </span>
                    {c.bot_paused_active && (
                      <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
                        Ажилтан хариулж байна
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-[#6b7280]">
                    {waitingLabel(c.needs_human_at, now)}
                  </p>
                  {!c.patient_name && (
                    <p className="mt-1 text-[10px] text-[#6b7280]">
                      Нэр байхгүй — inbox дотор хамгийн сүүлийн зурвасын цагаар
                      таарууна.
                    </p>
                  )}
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {/* The name is the lookup key: the inbox link opens the
                        inbox, not the thread, so staff paste this into Business
                        Suite's search to find the right conversation. */}
                    {c.patient_name && (
                      <button
                        type="button"
                        onClick={() =>
                          void copyToClipboard(c.patient_name!, "Нэр")
                        }
                        className="-my-1 cursor-pointer rounded py-1 text-[10px] text-[#6b7280] hover:text-[#0f172a] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c7b6e] focus-visible:ring-offset-2"
                      >
                        Нэр хуулах
                      </button>
                    )}
                    {/* Secondary since replies happen in the panel now. It
                        opens the INBOX, not this thread — Meta exposes no
                        thread link for a PSID — so staff search by name. */}
                    {c.messenger_inbox_link && (
                      <a
                        href={c.messenger_inbox_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Meta Business Suite-ийн inbox нээгдэнэ. Ярианыг өвчтөний нэрээр хайж олно уу."
                        className="-my-1 rounded py-1 text-[10px] text-[#6b7280] hover:text-[#0f172a] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c7b6e] focus-visible:ring-offset-2"
                      >
                        Inbox нээх ↗
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => void copyToClipboard(c.psid, "PSID")}
                      className="-my-1 cursor-pointer rounded py-1 text-[10px] text-[#6b7280] hover:text-[#0f172a] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c7b6e] focus-visible:ring-offset-2"
                    >
                      PSID хуулах
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setChatId(c.id)}
                    className="inline-flex min-h-9 cursor-pointer items-center rounded-full bg-[#0f172a] px-3.5 py-2 text-[11px] font-bold text-white transition-colors hover:bg-[#1e293b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c7b6e] focus-visible:ring-offset-2"
                  >
                    Харилцах
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTakeOver(c.id)}
                    disabled={busy || c.bot_paused_active}
                    className="inline-flex min-h-9 cursor-pointer items-center rounded-full bg-[#f3f4f6] px-3.5 py-2 text-[11px] font-bold text-[#0f172a] transition-colors hover:bg-[#e5e7eb] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c7b6e] focus-visible:ring-offset-2"
                  >
                    Би хариулна
                  </button>
                  <button
                    type="button"
                    onClick={() => handleHandBack(c.id)}
                    disabled={busy}
                    className="inline-flex min-h-9 cursor-pointer items-center rounded-full px-3.5 py-2 text-[11px] font-bold text-[#6b7280] transition-colors hover:bg-[#f3f4f6] hover:text-[#0f172a] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c7b6e] focus-visible:ring-offset-2"
                  >
                    Бот руу буцаах
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {chatConversation && (
        <ConversationChat
          conversation={chatConversation}
          onClose={() => setChatId(null)}
          onSent={(botPausedUntil) => {
            // Sending pauses the bot upstream; mirror that on the row so
            // "Би хариулна" doesn't offer to do what already happened.
            setRows((prev) =>
              prev.map((r) =>
                r.id === chatConversation.id
                  ? {
                      ...r,
                      bot_paused_until: botPausedUntil,
                      bot_paused_active: Boolean(botPausedUntil),
                    }
                  : r,
              ),
            );
            mutationRef.current += 1;
          }}
        />
      )}
    </section>
  );
}
