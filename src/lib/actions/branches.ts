"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/auth";
import { translateError } from "@/lib/utils/translate-error";
import { emitSync } from "@/lib/dentexgo/webhook";
import type { ClinicHours } from "@/lib/supabase/types";

export type BranchFormState = {
  error?: string;
  ok?: boolean;
  values?: {
    slug?: string;
    name_mn?: string;
    name_en?: string;
    address_mn?: string;
    address_en?: string;
    phone?: string;
    timezone?: string;
    sort_order?: string;
    is_active?: string;
  };
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

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || `br-${Date.now().toString(36)}`
  );
}

function readFields(formData: FormData): NonNullable<BranchFormState["values"]> {
  return {
    slug: String(formData.get("slug") || "").trim(),
    name_mn: String(formData.get("name_mn") || "").trim(),
    name_en: String(formData.get("name_en") || "").trim(),
    address_mn: String(formData.get("address_mn") || "").trim(),
    address_en: String(formData.get("address_en") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    timezone: String(formData.get("timezone") || "").trim(),
    sort_order: String(formData.get("sort_order") || "").trim(),
    is_active: formData.get("is_active") === "on" ? "on" : "",
  };
}

function validate(v: NonNullable<BranchFormState["values"]>): string | null {
  if (!v.name_mn) return "Салбарын нэр (MN) шаардлагатай.";
  if (!v.name_en) return "Салбарын нэрийг англиар бичих шаардлагатай.";
  return null;
}

export async function createBranchAction(
  _prev: BranchFormState,
  formData: FormData,
): Promise<BranchFormState> {
  if (!isSupabaseConfigured())
    return { error: "Supabase холбогдоогүй байна." };
  const values = readFields(formData);
  const err = validate(values);
  if (err) return { error: err, values };

  const supabase = createSupabaseAdmin();

  const baseSlug = values.slug || slugify(values.name_en!);
  let slug = baseSlug;
  for (let i = 2; i <= 9; i++) {
    const { data: existing } = await supabase
      .from("branches")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${i}`;
  }

  const sortOrder = Number(values.sort_order);

  const { data: inserted, error } = await supabase
    .from("branches")
    .insert({
      slug,
      name_mn: values.name_mn,
      name_en: values.name_en,
      address_mn: values.address_mn || null,
      address_en: values.address_en || null,
      phone: values.phone || null,
      timezone: values.timezone || "Asia/Ulaanbaatar",
      hours: readHours(formData),
      is_active: values.is_active === "on",
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    })
    .select("id")
    .single();

  if (error) return { error: translateError(error), values };

  if (inserted?.id) {
    after(() => emitSync({ kind: "branch", id: inserted.id }));
  }

  revalidatePath("/admin/branches");
  redirect("/admin/branches");
}

export async function updateBranchAction(
  _prev: BranchFormState,
  formData: FormData,
): Promise<BranchFormState> {
  if (!isSupabaseConfigured())
    return { error: "Supabase холбогдоогүй байна." };

  const id = String(formData.get("id") || "").trim();
  if (!id) return { error: "ID шаардлагатай." };

  const values = readFields(formData);
  const err = validate(values);
  if (err) return { error: err, values };

  const sortOrder = Number(values.sort_order);

  const supabase = createSupabaseAdmin();
  const { data: updated, error } = await supabase
    .from("branches")
    .update({
      slug: values.slug || undefined,
      name_mn: values.name_mn,
      name_en: values.name_en,
      address_mn: values.address_mn || null,
      address_en: values.address_en || null,
      phone: values.phone || null,
      timezone: values.timezone || "Asia/Ulaanbaatar",
      hours: readHours(formData),
      is_active: values.is_active === "on",
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    })
    .eq("id", id)
    .select("id");

  if (error) return { error: translateError(error), values };
  if (!updated || updated.length === 0)
    return { error: "Салбар олдсонгүй.", values };

  after(() => emitSync({ kind: "branch", id }));
  revalidatePath("/admin/branches");
  revalidatePath(`/admin/branches/${id}`);
  return { ok: true, values };
}

export async function toggleBranchActiveAction(formData: FormData) {
  if (!isSupabaseConfigured()) return;
  const id = String(formData.get("id") || "").trim();
  const next = formData.get("active") === "true";
  if (!id) return;
  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from("branches")
    .update({ is_active: next })
    .eq("id", id);
  if (error) return;
  after(() => emitSync({ kind: "branch", id }));
  revalidatePath("/admin/branches");
}
