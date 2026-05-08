"use server";

import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { isValidMongolianPhone, normalizeMongolianPhone } from "@/lib/utils/phone";
import { hasLocale } from "@/lib/i18n/dictionaries";

export type BookingFormState = {
  status: "idle" | "error";
  errorKey?: string;
  values?: { name?: string; phone?: string; notes?: string };
};

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && !url.includes("YOUR_PROJECT_REF"));
}

export async function bookSlotAction(
  _prev: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const lang = String(formData.get("lang") || "mn");
  const slotId = String(formData.get("slot_id") || "").trim();
  const deptSlug = String(formData.get("dept_slug") || "").trim();
  const doctorId = String(formData.get("doctor_id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const phoneRaw = String(formData.get("phone") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  const language = hasLocale(lang) ? lang : "mn";
  const values = { name, phone: phoneRaw, notes };

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
  if (!slotId) {
    return { status: "error", errorKey: "slot_not_found", values };
  }

  // Demo / fallback path — no Supabase configured yet
  if (!isSupabaseConfigured()) {
    const demoId = `demo-${Date.now().toString(36)}`;
    redirect(
      `/${language}/book/success?id=${encodeURIComponent(demoId)}` +
        `&slot=${encodeURIComponent(slotId)}` +
        `&dept=${encodeURIComponent(deptSlug)}` +
        `&doctor=${encodeURIComponent(doctorId)}` +
        `&name=${encodeURIComponent(name)}` +
        `&phone=${encodeURIComponent(phone)}` +
        `&demo=1`,
    );
  }

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.rpc("book_slot", {
    p_time_slot_id: slotId,
    p_patient_name: name,
    p_patient_phone: phone,
    p_patient_notes: notes || null,
  });

  if (error) {
    // Surface the real Postgres error in the dev console so we can debug
    // without poking at the Supabase dashboard.
    console.error("[book_slot] Supabase error:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    const haystack = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`;
    const knownKeys = [
      "slot_already_booked",
      "slot_in_the_past",
      "slot_not_found",
      "patient_name_required",
      "patient_phone_required",
    ];
    const matched = knownKeys.find((k) => haystack.includes(k));
    return {
      status: "error",
      errorKey: matched ?? "unknown",
      values,
    };
  }

  const row = Array.isArray(data) ? data[0] : data;
  // Function declares OUT params prefixed with `out_` to dodge name collisions
  // with the time_slots columns inside the PL/pgSQL body.
  const appointmentId = row?.out_appointment_id ?? row?.appointment_id;
  if (!appointmentId) {
    console.error("[book_slot] RPC returned no appointment_id:", { data });
    return { status: "error", errorKey: "unknown", values };
  }

  redirect(
    `/${language}/book/success?id=${encodeURIComponent(appointmentId)}` +
      `&slot=${encodeURIComponent(slotId)}` +
      `&dept=${encodeURIComponent(deptSlug)}` +
      `&doctor=${encodeURIComponent(doctorId)}` +
      `&name=${encodeURIComponent(name)}` +
      `&phone=${encodeURIComponent(phone)}`,
  );
}
