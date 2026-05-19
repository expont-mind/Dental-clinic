"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/auth";
import { translateError } from "@/lib/utils/translate-error";
import { emitSync } from "@/lib/dentexgo/webhook";
import type { ClinicHours } from "@/lib/supabase/types";

export type ClinicProfileState = {
  error?: string;
  ok?: boolean;
};

const DAYS: (keyof ClinicHours)[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

function readHours(formData: FormData): ClinicHours {
  const out = {} as ClinicHours;
  for (const d of DAYS) {
    const closed = formData.get(`hours_${d}_closed`) === "on";
    const open = String(formData.get(`hours_${d}_open`) || "").trim();
    const close = String(formData.get(`hours_${d}_close`) || "").trim();
    out[d] = closed || !open || !close ? null : `${open}-${close}`;
  }
  return out;
}

export async function updateClinicProfileAction(
  _prev: ClinicProfileState,
  formData: FormData,
): Promise<ClinicProfileState> {
  if (!isSupabaseConfigured())
    return { error: "Supabase холбогдоогүй байна." };

  const supabase = createSupabaseAdmin();
  const { data: updated, error } = await supabase
    .from("clinic_profile")
    .update({
      slug: String(formData.get("slug") || "").trim() || "dentaris",
      name_mn: String(formData.get("name_mn") || "").trim(),
      name_en: String(formData.get("name_en") || "").trim(),
      address_mn: String(formData.get("address_mn") || "").trim() || null,
      address_en: String(formData.get("address_en") || "").trim() || null,
      phone: String(formData.get("phone") || "").trim() || null,
      insurance_mn: String(formData.get("insurance_mn") || "").trim() || null,
      insurance_en: String(formData.get("insurance_en") || "").trim() || null,
      timezone:
        String(formData.get("timezone") || "").trim() || "Asia/Ulaanbaatar",
      hours: readHours(formData),
      booking_fee_cents:
        Math.round(Number(formData.get("booking_fee") || "0")) * 100,
    })
    .eq("singleton", true)
    .select("singleton");

  if (error) return { error: translateError(error) };
  if (!updated || updated.length === 0)
    return { error: "Профайл олдсонгүй." };

  after(() => emitSync({ kind: "clinic" }));
  revalidatePath("/admin/clinic");
  return { ok: true };
}
