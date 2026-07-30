import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cancelBooking, ITDoctorError } from "@/lib/itdoctor/client";
import type { PendingBooking } from "@/lib/supabase/types";

/**
 * True when an iDoctor cancel failed because the booking is no longer active
 * upstream: a 404 (route-model binding "No query results for model
 * [App\Models\Appointment]") or a 422 (already cancelled/completed). In both
 * cases the appointment is effectively gone, so callers can treat the cancel
 * as succeeded. Some deployments return this as HTTP 200 with success:false,
 * which surfaces as status 422 — the message check covers that path too.
 */
export function isAlreadyGone(e: unknown): boolean {
  if (!(e instanceof ITDoctorError)) return false;
  if (e.status === 404 || e.status === 422) return true;
  return /No query results for model/i.test(e.message);
}

/**
 * Cancel a booking on iDoctor (tolerant of an already-gone appointment),
 * cascade-cancel any legacy ghost bookings, and flip the local row to
 * `cancelled`. The caller MUST have already verified authorization (admin, or
 * customer owning the row). Returns a Mongolian error string on hard failure.
 */
export async function cancelBookingRow(
  supabase: SupabaseClient,
  pb: Pick<PendingBooking, "id" | "booking_reference" | "ghost_booking_refs">,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!pb.booking_reference) {
    // Never pushed to iDoctor — just mark locally as cancelled.
    await supabase
      .from("pending_bookings")
      .update({ status: "cancelled" })
      .eq("id", pb.id);
    return { ok: true };
  }

  try {
    await cancelBooking(pb.booking_reference);
  } catch (e) {
    if (!isAlreadyGone(e)) {
      const msg =
        e instanceof ITDoctorError
          ? `IT Doctor: ${e.message}`
          : e instanceof Error
            ? e.message
            : "IT Doctor дээр цуцлах үед алдаа гарлаа.";
      console.error("[cancelBookingRow] failed:", e);
      return { ok: false, error: msg };
    }
    console.warn(
      "[cancelBookingRow] booking already gone upstream:",
      pb.booking_reference,
      e instanceof Error ? e.message : e,
    );
  }

  // Cascade cancel to legacy ghost bookings. Best-effort: an individual ghost
  // failure shouldn't block the status flip — the main booking is already gone.
  const ghostRefs = pb.ghost_booking_refs ?? [];
  if (ghostRefs.length > 0) {
    const results = await Promise.allSettled(
      ghostRefs.map((ref) => cancelBooking(ref)),
    );
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        console.error(
          "[cancelBookingRow] ghost cancel failed",
          ghostRefs[i],
          r.reason,
        );
      }
    });
  }

  await supabase
    .from("pending_bookings")
    .update({ status: "cancelled" })
    .eq("id", pb.id);
  return { ok: true };
}
