"use server";

import { assertAdmin } from "@/lib/auth";
import { DentexgoError, isConfigured } from "@/lib/dentexgo/client";
import {
  listConversations,
  patchConversation,
  type DentexgoConversation,
} from "@/lib/dentexgo/conversations";
import { threadUrl } from "@/lib/messenger/link";

/**
 * Hours to silence the bot when staff take a conversation over. Matches the
 * "take over" example in the API contract.
 *
 * NOT exported: a "use server" module may only export async functions. The
 * value reaches the UI via takeOverAction's `pausedHours`.
 */
const TAKE_OVER_HOURS = 12;

export type QueueResult =
  | {
      ok: true;
      conversations: DentexgoConversation[];
      /**
       * Resolved thread URLs by conversation id. Built here because threadUrl()
       * reads env vars the browser can't see — otherwise a poll would replace
       * env-templated links with the raw server-provided ones.
       */
      threadUrls: Record<string, string>;
    }
  | { ok: false; error: string; code?: string };

export type ConversationActionResult =
  | { ok: true; conversation: DentexgoConversation; pausedHours?: number }
  | { ok: false; error: string };

/** Turn any thrown value into a Mongolian message plus the machine code, so
 * callers can branch on `code` without parsing prose. */
function describe(e: unknown): { error: string; code?: string } {
  if (e instanceof DentexgoError) {
    if (e.code === "CLINIC_NOT_CONFIGURED") {
      return { error: "Dentexgo тохиргоо ороогүй байна.", code: e.code };
    }
    if (e.code === "NO_AI_MODULE") {
      return { error: "AI модуль активгүй байна.", code: e.code };
    }
    return { error: `${e.code}: ${e.message}`, code: e.code };
  }
  return {
    error: "Dentexgo-той холбогдож чадсангүй.",
    code: "NETWORK_ERROR",
  };
}

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
    const threadUrls: Record<string, string> = {};
    for (const c of conversations) {
      const url = threadUrl(c);
      if (url) threadUrls[c.id] = url;
    }
    return { ok: true, conversations, threadUrls };
  } catch (e) {
    console.error("[fetchNeedsHumanAction]", e);
    return { ok: false, ...describe(e) };
  }
}

/** Staff will reply themselves — keep the bot quiet for TAKE_OVER_HOURS. */
export async function takeOverAction(
  id: string,
): Promise<ConversationActionResult> {
  const authErr = await assertAdmin();
  if (authErr) return { ok: false, error: authErr };
  if (!id) return { ok: false, error: "ID байхгүй байна." };
  try {
    const conversation = await patchConversation(id, {
      pause_bot_hours: TAKE_OVER_HOURS,
    });
    return { ok: true, conversation, pausedHours: TAKE_OVER_HOURS };
  } catch (e) {
    console.error("[takeOverAction]", e);
    return { ok: false, error: describe(e).error };
  }
}

/** Hand the thread back to the bot, clearing BOTH guards in one PATCH as the
 * contract prescribes. */
export async function handBackAction(
  id: string,
): Promise<ConversationActionResult> {
  const authErr = await assertAdmin();
  if (authErr) return { ok: false, error: authErr };
  if (!id) return { ok: false, error: "ID байхгүй байна." };
  try {
    const conversation = await patchConversation(id, {
      needs_human: false,
      pause_bot_hours: null,
    });
    return { ok: true, conversation };
  } catch (e) {
    console.error("[handBackAction]", e);
    return { ok: false, error: describe(e).error };
  }
}
