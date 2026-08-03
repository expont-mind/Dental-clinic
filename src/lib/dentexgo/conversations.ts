import "server-only";
import { apiFetch } from "./client";

// ---------- Types (mirrors the response-field table in
// docs/dentexgo-admin-api-contract.md § Conversation bot controls) ----------

export type ConversationChannel = "messenger" | "instagram";

export interface DentexgoConversation {
  /** Opaque internal conversation id. Accepted by GET/PATCH /conversations/{id}. */
  id: string;
  /** Meta Page-Scoped ID. Also accepted as {id} — resolves to the newest thread. */
  psid: string;
  channel: ConversationChannel;
  /**
   * Recipient's display name, enriched from Meta's Graph participants edge when
   * the bot escalates the thread. `null` if not yet enriched — escalations that
   * predate the feature, or Instagram.
   *
   * This is load-bearing: `messenger_inbox_link` only opens the inbox, so the
   * name is how staff locate the right thread once there.
   */
  patient_name: string | null;
  needs_human: boolean;
  needs_human_at: string | null;
  bot_paused_until: string | null;
  bot_paused_active: boolean;
  last_message_at: string;
  /**
   * Link into the page's Meta Business Suite inbox (web). `null` for Instagram,
   * or when the page id is unknown.
   *
   * It opens the INBOX, not the specific thread — and that is a hard limit, not
   * an oversight. Business Suite selects a thread by the person's real Facebook
   * user id, which the Messenger Platform never exposes to apps: the
   * Conversations, User Profile and ID Matching APIs all return only the
   * page-scoped PSID. An earlier revision of the contract offered
   * `messenger_thread_id` / `messenger_deep_link` for a direct thread link and
   * then retracted both for this reason. Do not try to rebuild it.
   */
  messenger_inbox_link: string | null;
}

/** `"in"` = from the patient, `"out"` = from the bot or clinic staff. */
export type MessageDirection = "in" | "out";

/** `"admin"` is a human staff reply sent through POST …/messages. */
export type MessageSender = "patient" | "bot" | "admin";

export interface ConversationMessage {
  id: string;
  direction: MessageDirection;
  sender: MessageSender;
  content: string;
  created_at: string;
}

/**
 * Meta's 24-hour send window, derived from the patient's last inbound message.
 * Outside it, Meta forbids free-form replies — the patient has to write first.
 */
export interface MessagingWindow {
  open: boolean;
  /** Boundary, or `null` if the patient has never messaged. */
  expires_at: string | null;
}

export interface ConversationMessagesPage {
  messages: ConversationMessage[];
  messaging_window: MessagingWindow;
}

export interface SendMessageInput {
  /** ≤2000 chars. At least one of `text` / `imageUrl` is required. */
  text?: string;
  /**
   * Publicly reachable URL — Meta fetches the image server-side, so a signed or
   * private URL will not work. Our /api/upload returns a Cloudinary secure_url,
   * which is what the contract suggests using.
   */
  imageUrl?: string;
  /** Hours to keep the bot quiet after sending. Upstream default is 12. */
  pause_bot_hours?: number;
}

export interface SendMessageResult {
  sent: { id: string; kind: string; message_id: string }[];
  bot_paused_until: string | null;
  messaging_window: MessagingWindow;
}

export interface ConversationPatch {
  /** `false` hands the thread back to the bot; `true` escalates it. */
  needs_human?: boolean;
  /** Hours to keep the bot quiet, or `null` to resume immediately. */
  pause_bot_hours?: number | null;
}

// ---------- Endpoints ----------

/**
 * The needs-human queue. With `needsHuman: true` the API returns escalated
 * conversations OLDEST ESCALATION FIRST — the longest-waiting patient is at
 * index 0, so callers should preserve this order rather than re-sorting.
 */
export async function listConversations(
  opts: { needsHuman?: boolean; limit?: number } = {},
): Promise<DentexgoConversation[]> {
  const data = await apiFetch<{
    conversations: DentexgoConversation[];
    count: number;
  }>("/conversations", {
    searchParams: {
      needs_human:
        opts.needsHuman === undefined ? undefined : String(opts.needsHuman),
      limit: opts.limit,
    },
  });
  return data.conversations ?? [];
}

/** `idOrPsid` accepts either our conversation UUID or the Messenger PSID. */
export async function getConversation(
  idOrPsid: string,
): Promise<DentexgoConversation> {
  const data = await apiFetch<{ conversation: DentexgoConversation }>(
    `/conversations/${encodeURIComponent(idOrPsid)}`,
  );
  return data.conversation;
}

export async function patchConversation(
  idOrPsid: string,
  patch: ConversationPatch,
): Promise<DentexgoConversation> {
  const data = await apiFetch<{ conversation: DentexgoConversation }>(
    `/conversations/${encodeURIComponent(idOrPsid)}`,
    { method: "PATCH", body: JSON.stringify(patch) },
  );
  return data.conversation;
}

/**
 * A page of message content, newest page first: pass `before` (a message's
 * `created_at`) to walk backwards through history. Within a page the API
 * returns oldest-first, which is already chat render order.
 *
 * `limit` is 1–100 upstream, default 50.
 */
export async function listMessages(
  idOrPsid: string,
  opts: { limit?: number; before?: string } = {},
): Promise<ConversationMessagesPage> {
  const data = await apiFetch<ConversationMessagesPage>(
    `/conversations/${encodeURIComponent(idOrPsid)}/messages`,
    { searchParams: { limit: opts.limit, before: opts.before } },
  );
  // Normalize at the boundary so the chat panel can render without guards.
  return {
    messages: data.messages ?? [],
    messaging_window: data.messaging_window ?? { open: false, expires_at: null },
  };
}

/**
 * Reply as the clinic — a human message, with no AI disclosure prefix.
 *
 * Sending takes the thread over automatically: the API pauses the bot so it
 * can't answer on top of staff. Fails with 409 OUTSIDE_MESSAGING_WINDOW when
 * the patient's last message is more than 24h old.
 */
export async function sendMessage(
  idOrPsid: string,
  input: SendMessageInput,
): Promise<SendMessageResult> {
  return apiFetch<SendMessageResult>(
    `/conversations/${encodeURIComponent(idOrPsid)}/messages`,
    { method: "POST", body: JSON.stringify(input) },
  );
}
