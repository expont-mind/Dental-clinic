"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdminUser } from "@/lib/auth";
import { createTimedBooking, ITDoctorError } from "@/lib/itdoctor/client";
import { cancelBookingRow } from "@/lib/booking/cancel";
import type { PendingBooking } from "@/lib/supabase/types";

export type ConfirmBookingState = { error?: string; ok?: boolean };

/**
 * Manual admin override: confirm a pending booking and push it to IT Doctor
 * regardless of QPay payment state. Used for phone/walk-in bookings or to
 * retry failed pushes. Atomic lock prevents double-pushes if two admins
 * click at the same time.
 */
export async function confirmPendingBookingAction(
  _prev: ConfirmBookingState,
  formData: FormData,
): Promise<ConfirmBookingState> {
  await requireAdminUser();

  const id = String(formData.get("id") || "").trim();
  if (!id) return { error: "ID байхгүй байна." };

  const supabase = createSupabaseAdmin();

  const { data: pending, error: fetchErr } = await supabase
    .from("pending_bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr || !pending) {
    return { error: "Захиалга олдсонгүй." };
  }

  const pb = pending as unknown as PendingBooking;

  if (pb.status === "paid" && pb.booking_reference) {
    return { error: "Энэ захиалга аль хэдийн баталгаажсан байна." };
  }

  // Atomic lock — only one admin click can grab a row at a time.
  const { data: locked, error: lockErr } = await supabase
    .from("pending_bookings")
    .update({ status: "processing" })
    .eq("id", pb.id)
    .in("status", ["pending", "processing", "expired", "failed"])
    .select("id");

  if (lockErr || !locked || locked.length === 0) {
    return { error: "Захиалгыг түгжих үед алдаа гарлаа." };
  }

  try {
    const result = await createTimedBooking(
      {
        branch_id: pb.branch_id,
        service_id: pb.service_id,
        dentist_id: pb.dentist_id ?? undefined,
        date: pb.slot_datetime.slice(0, 16),
        customer_name: pb.customer_name,
        customer_phone: pb.customer_phone,
        note: pb.note ?? undefined,
        // Admin force-confirm — bypass iDoctor's pending-prepayment default.
        is_valid: true,
      },
      { durationMin: pb.duration_min },
    );

    await supabase
      .from("pending_bookings")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        booking_reference: result.booking_reference,
        booking_result: result as unknown as Record<string, unknown>,
      })
      .eq("id", pb.id);

    revalidatePath("/admin/appointments");
    return { ok: true };
  } catch (e) {
    await supabase
      .from("pending_bookings")
      .update({ status: "failed" })
      .eq("id", pb.id);

    const msg =
      e instanceof ITDoctorError
        ? `IT Doctor: ${e.message}`
        : e instanceof Error
          ? e.message
          : "IT Doctor руу илгээх үед алдаа гарлаа.";
    console.error("[confirmPendingBookingAction] failed:", e);
    revalidatePath("/admin/appointments");
    return { error: msg };
  }
}

export type CancelBookingState = { error?: string; ok?: boolean };

/**
 * Cancel a confirmed booking on IT Doctor and mark the row as `cancelled`
 * locally so it drops out of the active list. Only rows that actually have
 * a `booking_reference` (i.e. were already pushed to IT Doctor) can be
 * cancelled — for not-yet-pushed rows there's nothing to cancel upstream.
 */
export async function cancelPendingBookingAction(
  _prev: CancelBookingState,
  formData: FormData,
): Promise<CancelBookingState> {
  await requireAdminUser();

  const id = String(formData.get("id") || "").trim();
  if (!id) return { error: "ID байхгүй байна." };

  const supabase = createSupabaseAdmin();

  const { data: pending, error: fetchErr } = await supabase
    .from("pending_bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr || !pending) return { error: "Захиалга олдсонгүй." };

  const pb = pending as unknown as PendingBooking;

  if (pb.status === "cancelled") {
    return { error: "Энэ захиалга аль хэдийн цуцлагдсан байна." };
  }
  // A `processing` row has a fulfil in flight: cancelling now races the iDoctor
  // push and could leave an appointment upstream with a `cancelled` row here.
  // The stale-lock reclaim in fulfillPendingBooking clears a stuck row within
  // two minutes, after which cancelling is safe.
  if (pb.status === "processing") {
    return {
      error:
        "Захиалга төлбөр боловсруулж байна. 2 минутын дараа дахин оролдоно уу.",
    };
  }

  const result = await cancelBookingRow(supabase, pb);
  revalidatePath("/admin/appointments");
  if (!result.ok) return { error: result.error };
  return { ok: true };
}
