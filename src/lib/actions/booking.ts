"use server";

import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { createBooking, getServices, ITDoctorError } from "@/lib/itdoctor/client";
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

  // Build structured note
  const noteParts: string[] = [];
  if (serviceName) noteParts.push(`Үйлчилгээ: ${serviceName}`);
  if (firstVisit) noteParts.push("Анхны үзлэг");
  if (userNotes) noteParts.push(userNotes);
  const note = noteParts.join("\n") || undefined;

  // Get IT Doctor service_id
  let itServiceId = 35;
  try {
    const services = await getServices();
    if (services.length > 0) itServiceId = services[0].id;
  } catch {
    // Use fallback
  }

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
      const callbackUrl = `${appUrl}/api/qpay/callback`;

      // Create QPay invoice
      const invoice = await quickPayService.createPlatformInvoice({
        amount: feeMNT,
        description: `Dentaris цаг захиалга — ${serviceName || deptSlug}`,
        callbackUrl,
        customerName: name,
      });

      // Store pending booking
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
        })
        .select("id")
        .single();

      if (error || !pending) {
        console.error("[bookSlotAction] Failed to create pending booking:", error);
        return { status: "error", errorKey: "unknown", values };
      }

      // Redirect to payment page
      redirect(
        `/${language}/book/payment?id=${pending.id}` +
          `&qr=${encodeURIComponent(invoice.qr_image)}` +
          `&amount=${feeMNT}` +
          `&service=${encodeURIComponent(serviceName)}`,
      );
    } catch (e) {
      if (isRedirectError(e)) throw e;
      console.error("[bookSlotAction] QPay invoice error:", e);
      return { status: "error", errorKey: "unknown", values };
    }
  }

  // ── Free flow: create booking directly ──
  try {
    const result = await createBooking({
      branch_id: branchId,
      service_id: itServiceId,
      dentist_id: dentistId > 0 ? dentistId : undefined,
      date: slotDatetime.slice(0, 16),
      customer_name: name,
      customer_phone: phone8,
      note,
    });

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
