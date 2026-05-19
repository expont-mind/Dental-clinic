"use server";

import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { quickPayService } from "@/lib/quickpay";
import { createBooking } from "@/lib/itdoctor/client";
import type { PendingBooking } from "@/lib/supabase/types";

export type FulfillResult =
  | { status: "paid"; booking_reference: string; booking_result: Record<string, unknown> }
  | { status: "pending" }
  | { status: "expired" }
  | { status: "failed"; error: string };

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

  // 4. Check expiry
  if (new Date(pb.expires_at) < new Date()) {
    await supabase
      .from("pending_bookings")
      .update({ status: "expired" })
      .eq("id", pb.id)
      .eq("status", "pending");
    return { status: "expired" };
  }

  // 5. Verify payment with QPay
  let paid = false;
  try {
    const result = await quickPayService.checkPayment(pb.invoice_id);
    paid =
      result.payment_status === "PAID" ||
      result.rows?.some((r) => r.payment_status === "PAID");
  } catch (e) {
    console.error("[fulfillPendingBooking] QPay check error:", e);
  }

  if (!paid) return { status: "pending" };

  // 6. Atomic lock: transition pending → processing
  //    Only ONE concurrent caller can succeed at this UPDATE.
  const { data: locked, error: lockErr } = await supabase
    .from("pending_bookings")
    .update({ status: "processing" })
    .eq("id", pb.id)
    .eq("status", "pending")
    .select("id");

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

  // 7. We hold the lock — create IT Doctor booking
  try {
    const bookingResult = await createBooking({
      branch_id: pb.branch_id,
      service_id: pb.service_id,
      dentist_id: pb.dentist_id ?? undefined,
      date: pb.slot_datetime.slice(0, 16),
      customer_name: pb.customer_name,
      customer_phone: pb.customer_phone,
      note: pb.note ?? undefined,
    });

    await supabase
      .from("pending_bookings")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        booking_reference: bookingResult.booking_reference,
        booking_result: bookingResult as unknown as Record<string, unknown>,
      })
      .eq("id", pb.id);

    return {
      status: "paid",
      booking_reference: bookingResult.booking_reference,
      booking_result: bookingResult as unknown as Record<string, unknown>,
    };
  } catch (e) {
    console.error("[fulfillPendingBooking] IT Doctor booking failed:", e);
    // Mark as failed — but keep the data so a cron/admin can retry
    await supabase
      .from("pending_bookings")
      .update({ status: "failed" })
      .eq("id", pb.id);
    return { status: "failed", error: String(e) };
  }
}
