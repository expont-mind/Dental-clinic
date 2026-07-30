"use server";

import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { quickPayService } from "@/lib/quickpay";
import { createTimedBooking } from "@/lib/itdoctor/client";
import type { PendingBooking } from "@/lib/supabase/types";

export type FulfillResult =
  | { status: "paid"; booking_reference: string; booking_result: Record<string, unknown> }
  | { status: "pending" }
  | { status: "expired" }
  | { status: "failed"; error: string };

/**
 * How long a `processing` row may sit untouched before another caller is
 * allowed to take the lock back. A crash or function timeout between taking
 * the lock and writing the result would otherwise strand the row in
 * `processing` forever — money taken, no appointment, no retry.
 *
 * Two minutes comfortably exceeds a single IT Doctor round-trip, so a live
 * worker is never overtaken mid-flight.
 */
const STALE_LOCK_MS = 2 * 60_000;

/**
 * Single entry point for fulfilling a paid booking.
 * Uses an atomic status transition (pending → processing) as a mutex
 * so that only ONE caller (poll or callback) creates the IT Doctor booking.
 *
 * Rate limit aware: POST /bookings is 10 req/min on IT Doctor.
 */
export async function fulfillPendingBooking(
  idOrInvoice: { id: string } | { invoiceId: string },
): Promise<FulfillResult> {
  const supabase = createSupabaseAdmin();

  // 1. Fetch pending booking
  let query = supabase.from("pending_bookings").select("*");
  if ("id" in idOrInvoice) {
    query = query.eq("id", idOrInvoice.id);
  } else {
    query = query.eq("invoice_id", idOrInvoice.invoiceId);
  }
  const { data: pending, error } = await query.maybeSingle();
  if (error || !pending) return { status: "pending" };

  const pb = pending as unknown as PendingBooking;

  // 2. Already fulfilled — return stored result
  if (pb.status === "paid" && pb.booking_reference) {
    return {
      status: "paid",
      booking_reference: pb.booking_reference,
      booking_result: pb.booking_result ?? {},
    };
  }

  // 3. Already failed or expired
  if (pb.status === "expired" || pb.status === "failed") {
    return { status: pb.status as "expired" | "failed", ...(pb.status === "failed" ? { error: "Booking creation failed" } : {}) } as FulfillResult;
  }

  // 4. Note whether the hold window has lapsed. We do NOT give up yet: a
  //    payment that lands a moment after the deadline still has to be honoured,
  //    otherwise the customer is charged and gets nothing. Expiry is only
  //    settled below, once QPay confirms no payment arrived.
  const isExpired = new Date(pb.expires_at) < new Date();

  // 5. Verify payment with QPay.
  //
  // The proxy returns `{ invoice_status: "PAID" | "NEW" | …, payments: [{
  // payment_status: "SUCCESS" | … }] }`. Either signal counts as paid so we
  // don't miss a transitional case where the invoice flag hasn't flipped yet
  // but a successful payment row already exists.
  let paid = false;
  try {
    const result = await quickPayService.checkPayment(pb.invoice_id);
    const invoiceStatus = String(result.invoice_status ?? "").toUpperCase();
    const successful = (result.payments ?? []).filter(
      (p) => String(p.payment_status ?? "").toUpperCase() === "SUCCESS",
    );
    // Guard against a short payment being treated as settlement. QPay reports
    // amounts in MNT; our column is in cents.
    const expectedMnt = pb.amount_cents / 100;
    const settledMnt = successful.reduce(
      (sum, p) => sum + (Number(p.amount) || 0),
      0,
    );
    const amountCovered = settledMnt + 0.001 >= expectedMnt;

    if (successful.length > 0 && !amountCovered) {
      console.error(
        "[fulfillPendingBooking] underpaid invoice:",
        pb.invoice_id,
        `expected ${expectedMnt} MNT, settled ${settledMnt} MNT`,
      );
      return { status: "pending" };
    }
    paid =
      (invoiceStatus === "PAID" || successful.length > 0) && amountCovered;
  } catch (e) {
    console.error("[fulfillPendingBooking] QPay check error:", e);
  }

  if (!paid) {
    if (isExpired) {
      await supabase
        .from("pending_bookings")
        .update({ status: "expired" })
        .eq("id", pb.id)
        .eq("status", "pending");
      return { status: "expired" };
    }
    return { status: "pending" };
  }

  if (isExpired) {
    // Paid after the hold lapsed. Honour it — the slot may since have been
    // taken by someone else, in which case the IT Doctor push below fails and
    // the row lands in `failed` for an admin to resolve or refund.
    console.warn(
      "[fulfillPendingBooking] payment landed after expiry, honouring:",
      pb.id,
    );
  }

  // 6. Atomic lock: transition pending → processing
  //    Only ONE concurrent caller can succeed at this UPDATE. A `processing`
  //    row whose last write is older than STALE_LOCK_MS is considered
  //    abandoned and may be reclaimed, so a crashed worker doesn't strand a
  //    paid booking.
  const staleBefore = new Date(Date.now() - STALE_LOCK_MS).toISOString();

  let { data: locked, error: lockErr } = await supabase
    .from("pending_bookings")
    .update({ status: "processing" })
    .eq("id", pb.id)
    .eq("status", "pending")
    .select("id");

  // Reclaim an abandoned lock. The `set_updated_at` trigger bumps updated_at on
  // every write, so a `processing` row that hasn't moved in STALE_LOCK_MS has no
  // live worker behind it. Still an atomic compare-and-set: whichever caller
  // wins this UPDATE is the only one that proceeds.
  //
  // `booking_reference is null` is the critical part of that filter. A stale row
  // that DOES carry a reference was already pushed to iDoctor and only failed to
  // record its status — re-pushing it would book the patient twice. Repair the
  // status instead.
  if (!lockErr && (!locked || locked.length === 0)) {
    const reclaim = await supabase
      .from("pending_bookings")
      .update({ status: "processing" })
      .eq("id", pb.id)
      .eq("status", "processing")
      .is("booking_reference", null)
      .lt("updated_at", staleBefore)
      .select("id");
    if (reclaim.data && reclaim.data.length > 0) {
      console.warn(
        "[fulfillPendingBooking] reclaimed stale processing lock:",
        pb.id,
      );
      locked = reclaim.data;
      lockErr = reclaim.error;
    } else {
      // Repair a half-written success: reference present but status never
      // advanced past `processing`.
      const { data: orphan } = await supabase
        .from("pending_bookings")
        .select("booking_reference, booking_result")
        .eq("id", pb.id)
        .eq("status", "processing")
        .not("booking_reference", "is", null)
        .maybeSingle();
      if (orphan?.booking_reference) {
        console.warn(
          "[fulfillPendingBooking] repairing processing row that already has a" +
            ` booking_reference: ${pb.id}`,
        );
        await supabase
          .from("pending_bookings")
          .update({ status: "paid", paid_at: new Date().toISOString() })
          .eq("id", pb.id)
          .eq("status", "processing");
        return {
          status: "paid",
          booking_reference: orphan.booking_reference as string,
          booking_result:
            (orphan.booking_result as Record<string, unknown>) ?? {},
        };
      }
    }
  }

  if (lockErr || !locked || locked.length === 0) {
    // Another caller already grabbed it — wait briefly then re-read
    const { data: fresh } = await supabase
      .from("pending_bookings")
      .select("status, booking_reference, booking_result")
      .eq("id", pb.id)
      .maybeSingle();

    if (fresh?.status === "paid" && fresh.booking_reference) {
      return {
        status: "paid",
        booking_reference: fresh.booking_reference,
        booking_result: (fresh.booking_result as Record<string, unknown>) ?? {},
      };
    }
    // Still processing by the other caller — tell client to keep polling
    return { status: "pending" };
  }

  // 7. We hold the lock — create IT Doctor booking. Long services (longer
  // than branch.slot_duration) are sized via end_date on a single booking.
  try {
    const bookingResult = await createTimedBooking(
      {
        branch_id: pb.branch_id,
        service_id: pb.service_id,
        dentist_id: pb.dentist_id ?? undefined,
        date: pb.slot_datetime.slice(0, 16),
        customer_name: pb.customer_name,
        customer_phone: pb.customer_phone,
        note: pb.note ?? undefined,
        // QPay payment is already confirmed at this point — mark booking valid.
        is_valid: true,
      },
      { durationMin: pb.duration_min },
    );

    const { error: saveErr } = await supabase
      .from("pending_bookings")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        booking_reference: bookingResult.booking_reference,
        booking_result: bookingResult as unknown as Record<string, unknown>,
        last_error: null,
      })
      .eq("id", pb.id);

    // The appointment exists upstream at this point. If we can't record that,
    // the row stays `processing` and will be reclaimed — which would book the
    // patient a SECOND time. Shout loudly enough that the reference can be
    // reconciled by hand.
    if (saveErr) {
      // Retry with the minimum that matters. `booking_result` is jsonb and the
      // most likely thing to have been rejected; the reference alone is enough
      // to stop a reclaim from double-booking.
      const { error: retryErr } = await supabase
        .from("pending_bookings")
        .update({
          status: "paid",
          booking_reference: bookingResult.booking_reference,
        })
        .eq("id", pb.id);
      if (retryErr) {
        console.error(
          "[fulfillPendingBooking] IT DOCTOR BOOKING CREATED BUT NOT RECORDED —" +
            ` reconcile manually. pending_id=${pb.id}` +
            ` booking_reference=${bookingResult.booking_reference}`,
          saveErr,
          retryErr,
        );
      }
    }

    return {
      status: "paid",
      booking_reference: bookingResult.booking_reference,
      booking_result: bookingResult as unknown as Record<string, unknown>,
    };
  } catch (e) {
    console.error("[fulfillPendingBooking] IT Doctor booking failed:", e);
    // Mark as failed — but keep the data (and the reason) so an admin can
    // retry from /admin/appointments. The customer has PAID at this point, so
    // these rows need a human to either push the booking through or refund.
    const reason = e instanceof Error ? e.message : String(e);
    await supabase
      .from("pending_bookings")
      .update({ status: "failed", last_error: reason.slice(0, 1000) })
      .eq("id", pb.id);
    return { status: "failed", error: reason };
  }
}
