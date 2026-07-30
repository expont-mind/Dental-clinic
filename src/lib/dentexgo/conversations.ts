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
