"use server";

import { assertAdmin } from "@/lib/auth";
import { isConfigured } from "@/lib/dentexgo/client";
import { describeDentexgoError } from "@/lib/dentexgo/errors";
import { draftFaqQuestion, type FaqDraft } from "@/lib/dentexgo/insights";

/** The contract caps the draft body at 20 questions, each ≤1000 chars. */
const MAX_QUESTIONS = 20;
const MAX_QUESTION_LENGTH = 1000;

export type FaqDraftResult =
  | { ok: true; draft: FaqDraft }
  | { ok: false; error: string };

/**
 * Draft one clean bilingual FAQ question from a cluster's phrasings.
 *
 * Called from the FAQ-gaps page when staff pick a topic — on demand, because
 * each call is a POST upstream. Trimming and capping happen here rather than in
 * the client so a stale page can't send a body the API would reject.
 */
export async function draftFaqQuestionAction(
  questions: string[],
): Promise<FaqDraftResult> {
  const authErr = await assertAdmin();
  if (authErr) return { ok: false, error: authErr };
  if (!isConfigured()) {
    return { ok: false, error: "Dentexgo тохиргоо ороогүй байна." };
  }

  const cleaned = questions
    .map((q) => String(q).trim().slice(0, MAX_QUESTION_LENGTH))
    .filter((q) => q.length > 0)
    .slice(0, MAX_QUESTIONS);

  if (cleaned.length === 0) {
    return { ok: false, error: "Асуулт хоосон байна." };
  }

  try {
    const draft = await draftFaqQuestion(cleaned);
    return { ok: true, draft };
  } catch (e) {
    console.error("[draftFaqQuestionAction]", e);
    return { ok: false, error: describeDentexgoError(e).message };
  }
}
