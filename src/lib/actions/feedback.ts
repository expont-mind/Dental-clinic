"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/auth";
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
  if (phoneRaw && !isValidMongolianPhone(phoneRaw)) {
    return { status: "error", errorKey: "phone_invalid", values };
  }
  const phone = phoneRaw ? normalizeMongolianPhone(phoneRaw) : null;

  // Try Supabase first; fall back to local file store if unavailable or
  // table is missing so the admin panel still sees submissions in dev/demo.
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServer();
      const { error } = await supabase.from("feedback").insert({
        name: name || null,
        phone,
        message,
        status: "new",
      });
      if (!error) {
        return { status: "success" };
      }
      console.warn("[submit_feedback] Supabase insert failed:", {
        code: error.code,
        message: error.message,
        hint: error.hint,
      });
      if (!isTableMissing(error)) {
        // Persist genuine non-table errors to local store too so submissions
        // aren't lost, but surface a soft error to the user.
        await addLocalFeedback({ name: name || null, phone, message });
        return { status: "success" };
      }
      // Table missing — drop through to local fallback
    } catch (err) {
      console.warn("[submit_feedback] Supabase threw:", err);
    }
  }

  // Local file fallback
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
  const id = String(formData.get("id") || "").trim();
  if (!id) return { ok: false, error: "Санал олдсонгүй" };

  if (id.startsWith("local-")) {
    const ok = await updateLocalFeedbackStatus(id, "resolved");
    revalidatePath("/admin/feedback");
    return { ok };
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServer();
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

