"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createFaq,
  deleteFaq,
  updateFaq,
  patchBotPersona,
  DentexgoError,
  type Bilingual,
  type BotPersonaUpdate,
  type BotTone,
  type OffHoursConfig,
  type PhoneInRepliesPolicy,
} from "@/lib/dentexgo/client";
import { getFeaturedServiceIds } from "@/lib/queries/catalog";
import { assertAdmin } from "@/lib/auth";

// ---------- FAQ ----------

export type FaqFormState = {
  ok?: boolean;
  error?: string;
  errorCode?: string;
  values?: { rowId?: string; qMn?: string; aMn?: string; qEn?: string; aEn?: string };
};

function readFaqFields(formData: FormData): FaqFormState["values"] & {
  qMn: string;
  aMn: string;
} {
  return {
    rowId: String(formData.get("rowId") || "").trim() || undefined,
    qMn: String(formData.get("qMn") || "").trim(),
    aMn: String(formData.get("aMn") || "").trim(),
    qEn: String(formData.get("qEn") || "").trim() || undefined,
    aEn: String(formData.get("aEn") || "").trim() || undefined,
  };
}

function friendlyMessage(err: unknown): { error: string; errorCode?: string } {
  if (err instanceof DentexgoError) {
    const msg = (() => {
      switch (err.code) {
        case "INVALID_TOKEN":
        case "UNAUTHENTICATED":
          return "Dentexgo руу нэвтрэх токен буруу байна. .env-ийн DENTEXGO_SHARED_SECRET-г шалгана уу.";
        case "CLINIC_NOT_FOUND":
          return "Энэ эмнэлэг Dentexgo дээр олдсонгүй. CLINIC_SLUG-г шалгана уу.";
        case "CLINIC_NOT_CONFIGURED":
          return "Dentexgo тохиргоо бүрэн ороогүй байна. Платформын баг руу хандана уу.";
        case "NOT_FOUND":
          return "Энэ FAQ Dentexgo дээр олдсонгүй.";
        case "INVALID_BODY":
          return "Талбарын утга буруу. Доорх алдааг засна уу.";
        default:
          return err.message || "Алдаа гарлаа.";
      }
    })();
    return { error: msg, errorCode: err.code };
  }
  return { error: err instanceof Error ? err.message : "Алдаа гарлаа." };
}

export async function createFaqAction(
  _prev: FaqFormState,
  formData: FormData,
): Promise<FaqFormState> {
  const authErr = await assertAdmin();
  if (authErr) return { error: authErr };
  const v = readFaqFields(formData);
  if (!v.qMn || !v.aMn) {
    return {
      error: "Монгол асуулт ба хариулт заавал бөглөнө.",
      values: v,
    };
  }
  try {
    await createFaq({
      rowId: v.rowId,
      qMn: v.qMn,
      aMn: v.aMn,
      qEn: v.qEn,
      aEn: v.aEn,
    });
  } catch (e) {
    return { ...friendlyMessage(e), values: v };
  }
  revalidatePath("/admin/bot/faqs");
  redirect("/admin/bot/faqs");
}

export async function updateFaqAction(
  _prev: FaqFormState,
  formData: FormData,
): Promise<FaqFormState> {
  const authErr = await assertAdmin();
  if (authErr) return { error: authErr };
  const v = readFaqFields(formData);
  if (!v.rowId) return { error: "rowId дутуу байна.", values: v };
  if (!v.qMn || !v.aMn) {
    return {
      error: "Монгол асуулт ба хариулт заавал бөглөнө.",
      values: v,
    };
  }
  try {
    await updateFaq(v.rowId, {
      qMn: v.qMn,
      aMn: v.aMn,
      qEn: v.qEn,
      aEn: v.aEn,
    });
  } catch (e) {
    return { ...friendlyMessage(e), values: v };
  }
  revalidatePath("/admin/bot/faqs");
  redirect("/admin/bot/faqs");
}

export async function deleteFaqAction(formData: FormData): Promise<void> {
  if (await assertAdmin()) return;
  const rowId = String(formData.get("rowId") || "").trim();
  if (!rowId) return;
  try {
    await deleteFaq(rowId);
  } catch (e) {
    console.error("[deleteFaqAction]", e);
    // Swallow; revalidate so the row stays if delete failed
  }
  revalidatePath("/admin/bot/faqs");
}

// ---------- Bot persona ----------

export type BotConfigFormState = {
  ok?: boolean;
  error?: string;
  errorCode?: string;
};

const TONES: BotTone[] = ["formal", "friendly", "casual"];
const PHONE_POLICIES: PhoneInRepliesPolicy[] = ["always", "never", "when_uncertain"];

/**
 * Build a bilingual pair from two FormData fields, omitting empty halves so we
 * never send `{ mn: "x", en: "" }` (Dentexgo's Zod schema rejects empty strings
 * inside bilingual objects). Returns undefined if both halves are empty.
 */
function readBilingual(
  formData: FormData,
  nameMn: string,
  nameEn: string,
): Bilingual | undefined {
  const mn = String(formData.get(nameMn) || "").trim();
  const en = String(formData.get(nameEn) || "").trim();
  if (!mn && !en) return undefined;
  const pair: Bilingual = {};
  if (mn) pair.mn = mn;
  if (en) pair.en = en;
  return pair;
}

export async function patchBotPersonaAction(
  _prev: BotConfigFormState,
  formData: FormData,
): Promise<BotConfigFormState> {
  const authErr = await assertAdmin();
  if (authErr) return { error: authErr };
  const update: BotPersonaUpdate = {};

  const tone = String(formData.get("tone") || "").trim();
  if (tone && (TONES as string[]).includes(tone)) {
    update.tone = tone as BotTone;
  }

  const phonePolicy = String(formData.get("phone_in_replies") || "").trim();
  if (phonePolicy && (PHONE_POLICIES as string[]).includes(phonePolicy)) {
    update.phone_in_replies = phonePolicy as PhoneInRepliesPolicy;
  }

  // Bilingual top-level fields are REPLACED whole by the API, so we always
  // send any pair the user touched. Empty halves are dropped to keep Zod happy.
  const greeting = readBilingual(formData, "greeting_mn", "greeting_en");
  if (greeting) update.greeting = greeting;

  const aiDisclosure = readBilingual(formData, "ai_disclosure_mn", "ai_disclosure_en");
  if (aiDisclosure) update.ai_disclosure = aiDisclosure;

  const fallback = readBilingual(
    formData,
    "fallback_message_mn",
    "fallback_message_en",
  );
  if (fallback) update.fallback_message = fallback;

  // Off-hours block: greeting + closer (both bilingual) + emergency_phone.
  const ohGreeting = readBilingual(formData, "off_hours_greeting_mn", "off_hours_greeting_en");
  const ohCloser = readBilingual(formData, "off_hours_closer_mn", "off_hours_closer_en");
  const ohPhone = String(formData.get("off_hours_emergency_phone") || "").trim();
  if (ohGreeting || ohCloser || ohPhone) {
    const off: OffHoursConfig = {};
    if (ohGreeting) off.greeting = ohGreeting;
    if (ohCloser) off.closer = ohCloser;
    if (ohPhone) off.emergency_phone = ohPhone;
    update.off_hours = off;
  }

  // Carousel-display toggle (hidden default "0" → last-wins so unchecked
  // boxes still send a definite boolean).
  if (formData.has("show_duration_in_cards")) {
    const vals = formData.getAll("show_duration_in_cards").map(String);
    update.show_duration_in_cards = vals[vals.length - 1] === "1";
  }

  // Featured services are derived from `services.is_featured` (the same
  // truth that drives /featured and the services-page highlight card) —
  // not from form input. Capped at 8 per contract inside the helper.
  update.featured_services = await getFeaturedServiceIds();

  const rulesRaw = String(formData.get("custom_rules") || "");
  const rules = rulesRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  if (formData.has("custom_rules")) {
    update.custom_rules = rules;
  }

  try {
    await patchBotPersona(update);
  } catch (e) {
    if (e instanceof DentexgoError) {
      return { error: e.message, errorCode: e.code };
    }
    return { error: e instanceof Error ? e.message : "Алдаа гарлаа." };
  }
  revalidatePath("/admin/bot/config");
  return { ok: true };
}
