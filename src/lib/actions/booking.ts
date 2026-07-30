"use server";

import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import {
  createTimedBooking,
  resolveServiceIdForBooking,
  ITDoctorError,
} from "@/lib/itdoctor/client";
import { isValidMongolianPhone, normalizeMongolianPhone } from "@/lib/utils/phone";
import { hasLocale } from "@/lib/i18n/dictionaries";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { quickPayService } from "@/lib/quickpay";

export type BookingFormState = {
  status: "idle" | "error";
  errorKey?: string;
  values?: { name?: string; phone?: string; notes?: string };
};

async function getBookingFee(): Promise<number> {
  try {
    const supabase = createSupabaseAdmin();
    const { data } = await supabase
      .from("clinic_profile")
      .select("booking_fee_cents")
      .eq("singleton", true)
      .maybeSingle();
    return data?.booking_fee_cents ?? 0;
  } catch {
    return 0;
  }
}

export async function bookSlotAction(
  _prev: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const lang = String(formData.get("lang") || "mn");
  const slotDatetime = String(formData.get("slot_id") || "").trim();
  const deptSlug = String(formData.get("dept_slug") || "").trim();
  const doctorId = String(formData.get("doctor_id") || "").trim();
  const branchId = Number(formData.get("branch_id") || "1");
  const serviceName = String(formData.get("service_name") || "").trim();
  // Mongolian service name for the iDoctor note — the note is read by clinic
  // reception, so it stays Mongolian regardless of the customer's UI language.
  const serviceNameMn = String(formData.get("service_name_mn") || "").trim();
  const durationMinRaw = String(formData.get("duration_min") || "").trim();
  const isMultiVisit = formData.get("is_multi_visit") === "on";
  const firstVisit = formData.get("first_visit") === "on";
  const name = String(formData.get("name") || "").trim();
  const phoneRaw = String(formData.get("phone") || "").trim();
  const userNotes = String(formData.get("notes") || "").trim();

  const language = hasLocale(lang) ? lang : "mn";
  const values = { name, phone: phoneRaw, notes: userNotes };

  if (!name) {
    return { status: "error", errorKey: "patient_name_required", values };
  }
  if (!phoneRaw) {
    return { status: "error", errorKey: "patient_phone_required", values };
  }
  if (!isValidMongolianPhone(phoneRaw)) {
    return { status: "error", errorKey: "patient_phone_invalid", values };
  }
  const phone = normalizeMongolianPhone(phoneRaw)!;
  const phone8 = phone.replace("+976", "");

  if (!slotDatetime) {
    return { status: "error", errorKey: "slot_not_found", values };
  }

  // Parse duration — the booking's real length. Sent to iDoctor as end_date
  // (a single booking now spans the whole window, no ghost cells), and stored
  // on the row so the slot picker can block the trailing cells it consumes.
  const durationMin = (() => {
    const n = Number(durationMinRaw);
    return Number.isFinite(n) && n > 0 ? n : null;
  })();

  // Build the iDoctor note — always Mongolian, since clinic reception reads it.
  // The duration is no longer written here: end_date already carries the real
  // length, so reception sees the full window on the calendar.
  const noteParts: string[] = [];
  const noteServiceName = serviceNameMn || serviceName;
  if (noteServiceName) noteParts.push(`Үйлчилгээ: ${noteServiceName}`);
  if (firstVisit) noteParts.push("Анхны үзлэг");
  if (userNotes) noteParts.push(userNotes);
  const note = noteParts.join("\n") || undefined;

  // iDoctor only has two configured services on this account — Treatment
  // (Эмчилгээ 1) and Checkup (Үзлэг 1). Route based on the service's
  // is_multi_visit flag so reception's iDoctor calendar shows the correct
  // workflow label.
  const itServiceId = resolveServiceIdForBooking(isMultiVisit);

  const dentistId = Number(doctorId);

  // Check if there's a booking fee
  const feeCents = await getBookingFee();
  const feeConfigured = feeCents > 0 && quickPayService.isConfigured();

  if (feeConfigured) {
    // ── Pay-first flow: create pending booking + QPay invoice ──
    try {
      const supabase = createSupabaseAdmin();
      const feeMNT = feeCents / 100;

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      // Shared token authenticates the webhook — QPay offers no signature.
      const callbackToken = process.env.QPAY_CALLBACK_TOKEN;
      const callbackUrl =
        `${appUrl}/api/qpay/callback` +
        (callbackToken ? `?token=${encodeURIComponent(callbackToken)}` : "");

      // Create QPay invoice
      const invoice = await quickPayService.createPlatformInvoice({
        amount: feeMNT,
        description: `Dentaris цаг захиалга — ${serviceName || deptSlug}`,
        callbackUrl,
        customerName: name,
      });

      // Store pending booking — QR image lives on the row instead of in the
      // redirect URL (a ~6KB base64 PNG in the query string triggers HTTP 431
      // once combined with cookies).
      const { data: pending, error } = await supabase
        .from("pending_bookings")
        .insert({
          invoice_id: invoice.id,
          amount_cents: feeCents,
          branch_id: branchId,
          service_id: itServiceId,
          dentist_id: dentistId > 0 ? dentistId : null,
          slot_datetime: slotDatetime,
          customer_name: name,
          customer_phone: phone8,
          service_name: serviceName || null,
          dept_slug: deptSlug || null,
          note: note || null,
          lang: language,
          qr_image: invoice.qr_image,
          duration_min: durationMin,
        })
        .select("id")
        .single();

      if (error || !pending) {
        console.error("[bookSlotAction] Failed to create pending booking:", error);
        return { status: "error", errorKey: "unknown", values };
      }

      // Redirect to payment page — just the id; QR, amount, and service are
      // loaded server-side from the row.
      redirect(`/${language}/book/payment?id=${pending.id}`);
    } catch (e) {
      if (isRedirectError(e)) throw e;
      console.error("[bookSlotAction] QPay invoice error:", e);
      return { status: "error", errorKey: "unknown", values };
    }
  }

  // ── Free flow: create booking directly ──
  try {
    const result = await createTimedBooking(
      {
        branch_id: branchId,
        service_id: itServiceId,
        dentist_id: dentistId > 0 ? dentistId : undefined,
        date: slotDatetime.slice(0, 16),
        customer_name: name,
        customer_phone: phone8,
        note,
        // Free flow — no prepayment required, but iDoctor still defaults to
        // is_valid=false when the clinic is configured for prepayment. Force
        // true so the slot reads as confirmed in iDoctor's calendar.
        is_valid: true,
      },
      { durationMin },
    );

    // Record the booking locally. This row is what the admin queue and the
    // customer's "my bookings" page read, and what the slot picker subtracts
    // trailing cells from — so it is written for EVERY free booking, not just
    // long ones with a named dentist. Best-effort: a DB error here must not
    // block the customer-facing redirect, since the iDoctor booking already
    // exists.
    {
      try {
        const supabase = createSupabaseAdmin();
        await supabase.from("pending_bookings").insert({
          invoice_id: `free-${result.booking_reference}`,
          amount_cents: 0,
          branch_id: branchId,
          service_id: itServiceId,
          dentist_id: dentistId > 0 ? dentistId : null,
          slot_datetime: slotDatetime,
          customer_name: name,
          customer_phone: phone8,
          service_name: serviceName || null,
          dept_slug: deptSlug || null,
          note: note || null,
          lang: language,
          duration_min: durationMin,
          status: "paid",
          paid_at: new Date().toISOString(),
          booking_reference: result.booking_reference,
          booking_result: result as unknown as Record<string, unknown>,
        });
      } catch (e) {
        console.error("[bookSlotAction] free-flow record insert failed:", e);
      }
    }

    redirect(
      `/${language}/book/success?ref=${encodeURIComponent(result.booking_reference)}` +
        `&dentist=${encodeURIComponent(result.dentist)}` +
        `&service=${encodeURIComponent(serviceName || result.service)}` +
        `&branch=${encodeURIComponent(result.branch)}` +
        `&date=${encodeURIComponent(result.date)}` +
        `&end_date=${encodeURIComponent(result.end_date)}` +
        `&name=${encodeURIComponent(name)}` +
        `&phone=${encodeURIComponent(phoneRaw)}`,
    );
  } catch (e) {
    if (isRedirectError(e)) throw e;
    if (e instanceof ITDoctorError) {
      console.error("[bookSlotAction] IT Doctor error:", e.message, e.body);
      return { status: "error", errorKey: "unknown", values };
    }
    throw e;
  }
}
