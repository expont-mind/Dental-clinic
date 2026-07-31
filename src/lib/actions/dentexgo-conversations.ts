"use server";

import { assertAdmin } from "@/lib/auth";
import { isConfigured } from "@/lib/dentexgo/client";
import {
  listConversations,
  listMessages,
  patchConversation,
  sendMessage,
  type ConversationMessagesPage,
  type ConversationPatch,
  type DentexgoConversation,
  type SendMessageResult,
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

/** Upstream caps message text at 2000 characters. */
const MAX_MESSAGE_LENGTH = 2000;

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

export type MessagesResult =
  | { ok: true; page: ConversationMessagesPage }
  | { ok: false; error: string; code?: string };

export type SendResult =
  | { ok: true; result: SendMessageResult }
  | { ok: false; error: string; code?: string };

/** Message history for the chat panel. Polled while the panel is open. */
export async function fetchMessagesAction(
  id: string,
): Promise<MessagesResult> {
  const authErr = await assertAdmin();
  if (authErr) return { ok: false, error: authErr, code: "FORBIDDEN" };
  if (!id) return { ok: false, error: "ID байхгүй байна." };
  try {
    return { ok: true, page: await listMessages(id, { limit: 50 }) };
  } catch (e) {
    console.error("[fetchMessagesAction]", e);
    const { message, code } = describeDentexgoError(e);
    return { ok: false, error: message, code };
  }
}

/**
 * Reply as the clinic. Sending also takes the thread over upstream — the bot is
 * paused so it can't answer on top of staff.
 *
 * `OUTSIDE_MESSAGING_WINDOW` gets its own message because it is not a fault the
 * user can retry away: Meta blocks free-form replies more than 24h after the
 * patient's last message, and only the patient can reopen the window.
 */
export async function sendMessageAction(
  id: string,
  input: { text?: string; imageUrl?: string },
): Promise<SendResult> {
  const authErr = await assertAdmin();
  if (authErr) return { ok: false, error: authErr, code: "FORBIDDEN" };
  if (!id) return { ok: false, error: "ID байхгүй байна." };

  const text = input.text?.trim();
  const imageUrl = input.imageUrl?.trim();
  if (!text && !imageUrl) {
    return { ok: false, error: "Зурвас хоосон байна." };
  }
  if (text && text.length > MAX_MESSAGE_LENGTH) {
    return {
      ok: false,
      error: `Зурвас хэт урт байна (${MAX_MESSAGE_LENGTH} тэмдэгтээс бага).`,
    };
  }

  try {
    const result = await sendMessage(id, {
      ...(text ? { text } : {}),
      ...(imageUrl ? { imageUrl } : {}),
    });
    return { ok: true, result };
  } catch (e) {
    console.error("[sendMessageAction]", e);
    const { message, code } = describeDentexgoError(e);
    if (code === "OUTSIDE_MESSAGING_WINDOW") {
      return {
        ok: false,
        code,
        error:
          "24 цагийн хугацаа хэтэрсэн тул Messenger зурвас илгээх боломжгүй. Өвчтөн дахин бичих хүртэл хүлээнэ үү.",
      };
    }
    return { ok: false, error: message, code };
  }
}
