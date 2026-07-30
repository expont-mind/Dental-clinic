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
   * Recipient's name from Meta. The contract types this `string`, but Meta does
   * not always supply one, so callers must handle absence.
   */
  patient_name: string | null;
  needs_human: boolean;
  needs_human_at: string | null;
  bot_paused_until: string | null;
  bot_paused_active: boolean;
  last_message_at: string;
  /**
   * Meta Graph thread id (`t_…`). Documented as stable and API-supported.
   * `null` for Instagram, or until the bot first escalates the thread.
   */
  messenger_thread_id: string | null;
  /**
   * One-click Meta Business Suite URL. The contract flags this as an
   * UNOFFICIAL url Meta may reshape without notice — see lib/messenger/link.ts
   * for the override path.
   */
  messenger_deep_link: string | null;
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
