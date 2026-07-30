"use server";

import { assertAdmin } from "@/lib/auth";
import { isConfigured } from "@/lib/dentexgo/client";
import {
  listConversations,
  patchConversation,
  type ConversationPatch,
  type DentexgoConversation,
} from "@/lib/dentexgo/conversations";
import { describeDentexgoError } from "@/lib/dentexgo/errors";

/**
 * Hours to silence the bot when staff take a conversation over. Matches the
 * "take over" example in the API contract.
 *
 * NOT exported: a "use server" module may only export async functions. The
 * value reaches the UI via takeOverAction's `pausedHours`.
 */
const TAKE_OVER_HOURS = 12;

export type QueueResult =
  | { ok: true; conversations: DentexgoConversation[] }
  | { ok: false; error: string; code?: string };

export type ConversationActionResult =
  | { ok: true; conversation: DentexgoConversation; pausedHours?: number }
  | { ok: false; error: string };

/**
 * The needs-human queue. Polled every 30s by NeedsHumanQueue — a server action
 * rather than a route handler so the Bearer secret stays server-side and no new
 * endpoint needs its own auth gate.
 *
 * Rows come back oldest-escalation-first from the API; the order is preserved.
 */
export async function fetchNeedsHumanAction(): Promise<QueueResult> {
  const authErr = await assertAdmin();
  if (authErr) return { ok: false, error: authErr, code: "FORBIDDEN" };
  if (!isConfigured()) {
    return {
      ok: false,
      error: "Dentexgo тохиргоо ороогүй байна.",
      code: "CLINIC_NOT_CONFIGURED",
    };
  }
  try {
    const conversations = await listConversations({
      needsHuman: true,
      limit: 100,
    });
    return { ok: true, conversations };
  } catch (e) {
    console.error("[fetchNeedsHumanAction]", e);
    const { message, code } = describeDentexgoError(e);
    return { ok: false, error: message, code };
  }
}

/**
 * Shared by takeOverAction and handBackAction: validates the id, sends the
 * PATCH, and classifies any failure. `logTag` keeps server logs attributable
 * to the action that triggered them even though the wrapper is shared.
 */
async function runPatch(
  id: string,
  patch: ConversationPatch,
  logTag: string,
): Promise<ConversationActionResult> {
  if (!id) return { ok: false, error: "ID байхгүй байна." };
  try {
    const conversation = await patchConversation(id, patch);
    return { ok: true, conversation };
  } catch (e) {
    console.error(logTag, e);
    return { ok: false, error: describeDentexgoError(e).message };
  }
}

/** Staff will reply themselves — keep the bot quiet for TAKE_OVER_HOURS. */
export async function takeOverAction(
  id: string,
): Promise<ConversationActionResult> {
  const authErr = await assertAdmin();
  if (authErr) return { ok: false, error: authErr };
  const res = await runPatch(
    id,
    { pause_bot_hours: TAKE_OVER_HOURS },
    "[takeOverAction]",
  );
  if (!res.ok) return res;
  return { ...res, pausedHours: TAKE_OVER_HOURS };
}

/** Hand the thread back to the bot, clearing BOTH guards in one PATCH as the
 * contract prescribes. */
export async function handBackAction(
  id: string,
): Promise<ConversationActionResult> {
  const authErr = await assertAdmin();
  if (authErr) return { ok: false, error: authErr };
  return runPatch(
    id,
    { needs_human: false, pause_bot_hours: null },
    "[handBackAction]",
  );
}
