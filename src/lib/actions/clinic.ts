"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { assertAdmin, isSupabaseConfigured } from "@/lib/auth";
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

const SOCIAL_KEYS = ["facebook_url", "instagram_url", "youtube_url"] as const;

export async function updateClinicProfileAction(
  _prev: ClinicProfileState,
  formData: FormData,
): Promise<ClinicProfileState> {
  const authErr = await assertAdmin();
  if (authErr) return { error: authErr };
  if (!isSupabaseConfigured())
    return { error: "Supabase холбогдоогүй байна." };

  // Rendered as footer hrefs, so only http(s) URLs get through.
  const socials = {} as Record<(typeof SOCIAL_KEYS)[number], string | null>;
  for (const key of SOCIAL_KEYS) {
    const v = String(formData.get(key) || "").trim();
    if (v && !/^https?:\/\/\S+$/i.test(v))
      return { error: "Сошиал холбоос https:// -ээр эхэлсэн бүтэн URL байх ёстой." };
    socials[key] = v || null;
  }

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
      email: String(formData.get("email") || "").trim() || null,
      ...socials,
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
  // Footer (in the [lang] layout), hero and contact page all read these fields.
  revalidatePath("/", "layout");
  return { ok: true };
}
