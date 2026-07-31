"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  fetchMessagesAction,
  sendMessageAction,
} from "@/lib/actions/dentexgo-conversations";
import type {
  ConversationMessage,
  DentexgoConversation,
  MessagingWindow,
} from "@/lib/dentexgo/conversations";
import { formatTime } from "@/lib/utils/datetime";

/** Slower than the queue's 30s: an open thread is watched, not scanned. */
const POLL_MS = 10_000;
const MAX_LENGTH = 2000;

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c7b6e] focus-visible:ring-offset-2";

/**
 * Images are sent as a URL and come back in `content`, so a message is rendered
 * as an image when its content is nothing but a link to one. Anything else is
 * text — including a message that merely mentions a link.
 */
function imageUrlOf(content: string): string | null {
  const t = content.trim();
  if (!/^https?:\/\/\S+$/.test(t)) return null;
  return /\.(png|jpe?g|gif|webp|avif)(\?|$)/i.test(t) || t.includes("/image/upload/")
    ? t
    : null;
}

function senderLabel(m: ConversationMessage): string {
  if (m.sender === "patient") return "Өвчтөн";
  if (m.sender === "bot") return "Бот";
  return "Ажилтан";
}

export function ConversationChat({
  conversation,
  onClose,
  onSent,
}: {
  conversation: DentexgoConversation;
  onClose: () => void;
  /** Sending pauses the bot upstream, so the queue row has to be refreshed. */
  onSent: (botPausedUntil: string | null) => void;
}) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [window_, setWindow] = useState<MessagingWindow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);

  const listEndRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  /** Set while a send is in flight so a slower poll can't drop the new message. */
  const sendingRef = useRef(false);

  const load = useCallback(
    async () => {
      // No setState before the await: `loading` already starts true, and
      // setting it synchronously here would trip react-hooks/set-state-in-effect.
      const res = await fetchMessagesAction(conversation.id);
      setLoading(false);
      if (sendingRef.current) return;
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setError(null);
      setMessages(res.page.messages);
      setWindow(res.page.messaging_window);
    },
    [conversation.id],
  );

  useEffect(() => {
    // Polling a remote thread is the "subscribe to an external system" case the
    // rule allows: every setState inside `load` runs in the promise
    // continuation after `await`, never synchronously during this effect. The
    // linter can't see across the async boundary, so the check is disabled here
    // rather than delaying the first page by a full poll interval.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    const timer = setInterval(() => void load(), POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  // Keep the newest message in view as the thread grows.
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function send(payload: { text?: string; imageUrl?: string }) {
    sendingRef.current = true;
    setSending(true);
    const res = await sendMessageAction(conversation.id, payload);
    setSending(false);
    sendingRef.current = false;
    if (!res.ok) {
      toast.error(res.error);
      if (res.code === "OUTSIDE_MESSAGING_WINDOW") {
        setWindow({ open: false, expires_at: null });
      }
      return false;
    }
    setWindow(res.result.messaging_window);
    onSent(res.result.bot_paused_until);
    await load();
    return true;
  }

  async function handleSendText() {
    const body = text.trim();
    if (!body) return;
    const ok = await send({ text: body });
    if (ok) {
      setText("");
      composerRef.current?.focus();
    }
  }

  async function handlePickImage(file: File) {
    // Meta fetches the image server-side, so it needs a public URL — upload to
    // Cloudinary through our own admin-gated route first.
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Зураг байршуулж чадсангүй.");
        return;
      }
      await send({ imageUrl: data.url });
    } catch {
      toast.error("Зураг байршуулж чадсангүй.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const canSend = window_?.open !== false;
  const busy = sending || uploading;
  const title = conversation.patient_name || conversation.psid;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop — click to dismiss, hidden from the a11y tree since Escape
          and the close button already expose the same affordance. */}
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[#0f172a]/25"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${title}-тэй харилцах`}
        className="relative flex h-full w-full max-w-110 flex-col bg-white shadow-[0_0_40px_-10px_rgba(15,23,42,0.35)]"
      >
        <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <p className="truncate text-[14px] font-bold text-[#0f172a]">
              {title}
            </p>
            <p className="mt-0.5 text-[11px] text-[#6b7280]">
              {conversation.channel === "instagram" ? "Instagram" : "Messenger"}
              {!conversation.patient_name && " · нэр байхгүй"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Хаах"
            className={`-mr-1 inline-flex min-h-9 min-w-9 cursor-pointer items-center justify-center rounded-full text-[#6b7280] transition-colors hover:bg-[#f3f4f6] hover:text-[#0f172a] ${FOCUS}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && (
            <div className="space-y-3" aria-hidden>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-2xl bg-[#f3f4f6]"
                />
              ))}
            </div>
          )}
          {!loading && error && (
            <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-[12px] text-danger">
              {error}
            </p>
          )}
          {!loading && !error && messages.length === 0 && (
            <p className="text-[12px] text-[#6b7280]">Зурвас байхгүй байна.</p>
          )}

          <ul className="space-y-3">
            {messages.map((m) => {
              const mine = m.direction === "out";
              const img = imageUrlOf(m.content);
              return (
                <li
                  key={m.id}
                  className={mine ? "flex justify-end" : "flex justify-start"}
                >
                  <div className="max-w-[85%]">
                    <p className="mb-1 text-[10px] text-[#6b7280]">
                      {senderLabel(m)} · {formatTime(new Date(m.created_at))}
                    </p>
                    <div
                      className={
                        "rounded-2xl px-3.5 py-2 text-[13px] leading-6 " +
                        (mine
                          ? m.sender === "bot"
                            ? "bg-[#f3f4f6] text-[#374151]"
                            : "bg-[#0f172a] text-white"
                          : "bg-primary-soft text-[#0f172a]")
                      }
                    >
                      {img ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={img}
                          alt="Илгээсэн зураг"
                          className="max-h-60 rounded-xl"
                        />
                      ) : (
                        <span className="whitespace-pre-wrap wrap-break-word">
                          {m.content}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div ref={listEndRef} />
        </div>

        {/* Composer */}
        <div className="border-t border-line px-5 py-4">
          {!canSend ? (
            <p className="rounded-xl bg-warn/10 px-3 py-2.5 text-[11px] leading-5 text-warn">
              Meta-гийн 24 цагийн хугацаа хаагдсан тул зурвас илгээх боломжгүй.
              Өвчтөн дахин бичсэний дараа энэ талбар нээгдэнэ.
            </p>
          ) : (
            <>
              <label htmlFor="chat-message" className="sr-only">
                Зурвас
              </label>
              <textarea
                id="chat-message"
                ref={composerRef}
                rows={3}
                value={text}
                maxLength={MAX_LENGTH}
                disabled={busy}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  // Enter sends; Shift+Enter is a newline.
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSendText();
                  }
                }}
                placeholder="Хариултаа бичнэ үү…"
                className={`w-full resize-none rounded-xl border border-line px-3 py-2 text-[13px] leading-6 text-[#0f172a] placeholder:text-[#6b7280] disabled:opacity-50 ${FOCUS}`}
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <input
                    ref={fileRef}
                    id="chat-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handlePickImage(f);
                    }}
                  />
                  <label
                    htmlFor="chat-image"
                    className={`inline-flex min-h-9 cursor-pointer items-center rounded-full px-3 text-[11px] font-bold text-[#6b7280] transition-colors hover:bg-[#f3f4f6] hover:text-[#0f172a] ${
                      busy ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    {uploading ? "Байршуулж байна…" : "Зураг хавсаргах"}
                  </label>
                  <span className="text-[10px] text-[#6b7280]">
                    {text.length}/{MAX_LENGTH}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => void handleSendText()}
                  disabled={busy || text.trim().length === 0}
                  className={`inline-flex min-h-9 cursor-pointer items-center rounded-full bg-[#0f172a] px-4 text-[11px] font-bold text-white transition-colors hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`}
                >
                  {sending ? "Илгээж байна…" : "Илгээх"}
                </button>
              </div>
              <p className="mt-2 text-[10px] leading-4 text-[#6b7280]">
                Илгээмэгц бот энэ ярианд 12 цаг хариулахаа болино.
              </p>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
