"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createSupabaseAdmin, isAdminConfigured } from "@/lib/supabase/admin";
import { assertAdmin } from "@/lib/auth";
import {
  isValidMongolianPhone,
  normalizeMongolianPhone,
} from "@/lib/utils/phone";
import {
  addLocalFeedback,
  updateLocalFeedbackStatus,
} from "@/lib/data/feedback-store";

export type FeedbackFormState = {
  status: "idle" | "error" | "success";
  errorKey?: string;
  values?: { name?: string; phone?: string; message?: string };
};

function isTableMissing(error: { code?: string; message?: string; hint?: string }) {
  const msg = `${error.code ?? ""} ${error.message ?? ""} ${error.hint ?? ""}`.toLowerCase();
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    msg.includes("does not exist") ||
    msg.includes("could not find") ||
    msg.includes("schema cache")
  );
}

/** Hard cap so one submission can't push a novel into the table. */
const MAX_MESSAGE_LENGTH = 2000;

/**
 * Per-instance submission throttle. Serverless means each instance keeps its own
 * counter, so this thins out floods rather than stopping a determined one — real
 * rate limiting would need shared state. Good enough to blunt casual spam.
 */
const RATE_LIMIT = { windowMs: 60_000, max: 3 };
const recentSubmissions = new Map<string, number[]>();

async function isRateLimited(): Promise<boolean> {
  let ip = "unknown";
  try {
    const h = await headers();
    ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      "unknown";
  } catch {
    return false;
  }
  const now = Date.now();
  const cutoff = now - RATE_LIMIT.windowMs;
  const hits = (recentSubmissions.get(ip) ?? []).filter((t) => t > cutoff);
  if (hits.length >= RATE_LIMIT.max) {
    recentSubmissions.set(ip, hits);
    return true;
  }
  hits.push(now);
  recentSubmissions.set(ip, hits);
  // Keep the map from growing without bound on a long-lived instance.
  if (recentSubmissions.size > 5000) {
    for (const [key, times] of recentSubmissions) {
      if (times.every((t) => t <= cutoff)) recentSubmissions.delete(key);
    }
  }
  return false;
}

export async function submitFeedbackAction(
  _prev: FeedbackFormState,
  formData: FormData,
): Promise<FeedbackFormState> {
  const name = String(formData.get("name") || "").trim();
  const phoneRaw = String(formData.get("phone") || "").trim();
  const message = String(formData.get("message") || "").trim();

  const values = { name, phone: phoneRaw, message };

  if (!message) {
    return { status: "error", errorKey: "message_required", values };
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { status: "error", errorKey: "message_too_long", values };
  }
  if (phoneRaw && !isValidMongolianPhone(phoneRaw)) {
    return { status: "error", errorKey: "phone_invalid", values };
  }
  if (await isRateLimited()) {
    return { status: "error", errorKey: "too_many_requests", values };
  }
  const phone = phoneRaw ? normalizeMongolianPhone(phoneRaw) : null;

  // Insert with the service-role client. The anon client is subject to RLS, and
  // a missing INSERT policy would silently reject every submission — which used
  // to fall through to an ephemeral /tmp file and still report success, quietly
  // losing patient messages.
  if (isAdminConfigured()) {
    try {
      const supabase = createSupabaseAdmin();
      const { error } = await supabase.from("feedback").insert({
        name: name || null,
        phone,
        message,
        status: "new",
      });
      if (!error) return { status: "success" };
      console.error("[submit_feedback] Supabase insert failed:", {
        code: error.code,
        message: error.message,
        hint: error.hint,
      });
      if (!isTableMissing(error)) {
        // A real database error. Don't claim success — the message would be
        // stranded in a per-instance temp file the admin panel may never read.
        return { status: "error", errorKey: "save_failed", values };
      }
      // Table missing — drop through to the local fallback below.
    } catch (err) {
      console.error("[submit_feedback] Supabase threw:", err);
      return { status: "error", errorKey: "save_failed", values };
    }
  }

  // Local file fallback — a development convenience only. On Vercel the
  // filesystem is ephemeral and per-instance, so treat this as a failure in
  // production rather than telling the patient their message went through.
  if (process.env.NODE_ENV === "production") {
    console.error(
      "[submit_feedback] no durable store available (feedback table missing?) — " +
        "refusing to accept the submission",
    );
    return { status: "error", errorKey: "save_failed", values };
  }
  await addLocalFeedback({ name: name || null, phone, message });
  return { status: "success" };
}

/**
 * Mark feedback as resolved. Works for both Supabase-stored rows
 * (id is a uuid) and local-store rows (id starts with `local-`).
 */
export async function resolveFeedbackAction(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const authErr = await assertAdmin();
  if (authErr) return { ok: false, error: authErr };

  const id = String(formData.get("id") || "").trim();
  if (!id) return { ok: false, error: "Санал олдсонгүй" };

  if (id.startsWith("local-")) {
    const ok = await updateLocalFeedbackStatus(id, "resolved");
    revalidatePath("/admin/feedback");
    return { ok };
  }

  // Service-role client: migration 31 enables RLS on `feedback` with no
  // policies, so the anon client can no longer see or update these rows.
  // This action is admin-gated above.
  if (isAdminConfigured()) {
    try {
      const supabase = createSupabaseAdmin();
      const { error, count } = await supabase
        .from("feedback")
        .update({ status: "resolved" }, { count: "exact" })
        .eq("id", id);
      if (error) {
        console.error("[resolve_feedback] Supabase update error:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        revalidatePath("/admin/feedback");
        const isRls =
          /permission|policy|rls|denied/i.test(error.message ?? "") ||
          error.code === "42501";
        return {
          ok: false,
          error: isRls
            ? "Хандах эрх олдсонгүй. Supabase RLS UPDATE policy нэмнэ үү."
            : error.message ?? "Шинэчлэхэд алдаа гарлаа.",
        };
      }
      if (count === 0) {
        // Update succeeded with 0 rows — likely RLS silently filtered the row.
        console.warn("[resolve_feedback] 0 rows updated for id:", id);
        revalidatePath("/admin/feedback");
        return {
          ok: false,
          error:
            "Шинэчлэлт амжилтгүй (0 мөр). Supabase RLS UPDATE policy байхгүй байж магадгүй.",
        };
      }
    } catch (err) {
      console.error("[resolve_feedback] Supabase threw:", err);
      revalidatePath("/admin/feedback");
      return { ok: false, error: String(err) };
    }
  }
  revalidatePath("/admin/feedback");
  return { ok: true };
}

