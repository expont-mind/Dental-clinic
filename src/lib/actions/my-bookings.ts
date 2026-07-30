"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdmin, isAdminConfigured } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/actions/auth";
import { cancelBookingRow } from "@/lib/booking/cancel";
import { hasLocale } from "@/lib/i18n/dictionaries";
import type { PendingBooking } from "@/lib/supabase/types";

export type CancelMyBookingState = { error?: string; ok?: boolean };

/**
 * Customer-facing self-cancel. A logged-in customer may cancel their own
 * booking — one whose `customer_phone` matches the session's phone, is still
 * `paid`, and is in the future. Reuses the same iDoctor cancel core as the
 * admin action. No refund (clinic policy).
 *
 * Ownership is derived from the SESSION phone, never from client input, so a
 * customer can't cancel someone else's booking by guessing an id.
 */
export async function cancelMyBookingAction(
  _prev: CancelMyBookingState,
  formData: FormData,
): Promise<CancelMyBookingState> {
  const lang = String(formData.get("lang") || "mn");
  const mn = lang === "mn";

  const user = await getCurrentUser();
  if (!user?.phone8) {
    return { error: mn ? "Нэвтэрч орно уу." : "Please log in." };
  }

  const id = String(formData.get("id") || "").trim();
  if (!id) return { error: mn ? "ID байхгүй байна." : "Missing id." };

  if (!isAdminConfigured()) {
    return {
      error: mn ? "Түр боломжгүй байна." : "Temporarily unavailable.",
    };
  }
  const supabase = createSupabaseAdmin();

  const { data: pending, error: fetchErr } = await supabase
    .from("pending_bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr || !pending) {
    return { error: mn ? "Захиалга олдсонгүй." : "Booking not found." };
  }
  const pb = pending as unknown as PendingBooking;

  // Ownership: the row's phone must match the logged-in customer's phone.
  if (pb.customer_phone !== user.phone8) {
    return { error: mn ? "Энэ захиалга танд хамааралгүй." : "Not your booking." };
  }

  // Only active, confirmed, future bookings are self-cancellable.
  if (pb.status !== "paid") {
    return {
      error: mn
        ? "Зөвхөн баталгаажсан цагийг цуцлах боломжтой."
        : "Only confirmed bookings can be cancelled.",
    };
  }
  // slot_datetime is clinic-local (Ulaanbaatar, +08:00).
  const startsAt = new Date(pb.slot_datetime.replace(" ", "T") + "+08:00");
  if (startsAt.getTime() <= Date.now()) {
    return {
      error: mn
        ? "Өнгөрсөн цагийг цуцлах боломжгүй."
        : "Past bookings can't be cancelled.",
    };
  }

  const result = await cancelBookingRow(supabase, pb);
  if (hasLocale(lang)) revalidatePath(`/${lang}/account`);
  if (!result.ok) return { error: result.error };
  return { ok: true };
}
