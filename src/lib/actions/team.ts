"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { assertAdmin, isSupabaseConfigured } from "@/lib/auth";
import { translateError } from "@/lib/utils/translate-error";
import { emitSync } from "@/lib/dentexgo/webhook";

export type CreateDoctorState = {
  error?: string;
  values?: {
    department_id?: string;
    name_mn?: string;
    name_en?: string;
    title_mn?: string;
    title_en?: string;
    bio_mn?: string;
    bio_en?: string;
    photo_url?: string;
    years_exp?: string;
    is_active?: string;
  };
};

function readBranchIds(formData: FormData): string[] {
  return formData
    .getAll("branch_ids")
    .map((v) => String(v).trim())
    .filter((v) => v.length > 0);
}

function readServiceIds(formData: FormData): string[] {
  return formData
    .getAll("service_ids")
    .map((v) => String(v).trim())
    .filter((v) => v.length > 0);
}

async function setDoctorServices(
  supabase: ReturnType<typeof createSupabaseAdmin>,
  doctorId: string,
  serviceIds: string[],
): Promise<string | null> {
  const { error: delErr } = await supabase
    .from("doctor_services")
    .delete()
    .eq("doctor_id", doctorId);
  if (delErr) return translateError(delErr);
  if (serviceIds.length === 0) return null;
  const rows = serviceIds.map((service_id) => ({ doctor_id: doctorId, service_id }));
  const { error: insErr } = await supabase.from("doctor_services").insert(rows);
  if (insErr) return translateError(insErr);
  return null;
}

async function setDoctorBranches(
  supabase: ReturnType<typeof createSupabaseAdmin>,
  doctorId: string,
  branchIds: string[],
): Promise<string | null> {
  const { error: delErr } = await supabase
    .from("doctor_branches")
    .delete()
    .eq("doctor_id", doctorId);
  if (delErr) return translateError(delErr);
  if (branchIds.length === 0) return null;
  const rows = branchIds.map((branch_id) => ({ doctor_id: doctorId, branch_id }));
  const { error: insErr } = await supabase.from("doctor_branches").insert(rows);
  if (insErr) return translateError(insErr);
  return null;
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || `doc-${Date.now().toString(36)}`
  );
}

export async function createDoctorAction(
  _prev: CreateDoctorState,
  formData: FormData,
): Promise<CreateDoctorState> {
  const authErr = await assertAdmin();
  if (authErr) return { error: authErr };
  const values: NonNullable<CreateDoctorState["values"]> = {
    department_id: String(formData.get("department_id") || "").trim(),
    name_mn: String(formData.get("name_mn") || "").trim(),
    name_en: String(formData.get("name_en") || "").trim(),
    title_mn: String(formData.get("title_mn") || "").trim(),
    title_en: String(formData.get("title_en") || "").trim(),
    bio_mn: String(formData.get("bio_mn") || "").trim(),
    bio_en: String(formData.get("bio_en") || "").trim(),
    photo_url: String(formData.get("photo_url") || "").trim(),
    years_exp: String(formData.get("years_exp") || "").trim(),
    is_active: formData.get("is_active") === "on" ? "on" : "",
  };

  if (!values.department_id) return { error: "Тасгаа сонгоно уу.", values };
  if (!values.name_mn) return { error: "Овог нэр (MN) шаардлагатай.", values };
  if (!values.name_en)
    return {
      error:
        "Овог нэрийг англиар бичих шаардлагатай. Энэ нь Dentexgo чатботод англи хэрэглэгчдэд хариулахад ашиглагдана.",
      values,
    };

  if (!isSupabaseConfigured()) {
    return {
      error: "Supabase холбогдоогүй байна.",
      values,
    };
  }

  const supabase = createSupabaseAdmin();

  const yearsExp = Number(values.years_exp);
  const validYears = Number.isFinite(yearsExp) && yearsExp >= 0 ? yearsExp : null;

  const baseSlug = slugify(values.name_en || values.name_mn);
  let slug = baseSlug;
  for (let i = 2; i <= 9; i++) {
    const { data: existing } = await supabase
      .from("doctors")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${i}`;
  }

  const { data: inserted, error } = await supabase
    .from("doctors")
    .insert({
      department_id: values.department_id,
      slug,
      name_mn: values.name_mn,
      name_en: values.name_en,
      title_mn: values.title_mn || null,
      title_en: values.title_en || null,
      bio_mn: values.bio_mn || null,
      bio_en: values.bio_en || null,
      photo_url: values.photo_url || null,
      years_exp: validYears,
      is_active: values.is_active === "on",
      sort_order: 1,
    })
    .select("id")
    .single();

  if (error) return { error: translateError(error), values };

  if (inserted?.id) {
    const branchErr = await setDoctorBranches(
      supabase,
      inserted.id,
      readBranchIds(formData),
    );
    if (branchErr) return { error: branchErr, values };
    const svcErr = await setDoctorServices(
      supabase,
      inserted.id,
      readServiceIds(formData),
    );
    if (svcErr) return { error: svcErr, values };
    after(() => emitSync({ kind: "staff", id: inserted.id }));
  }

  revalidatePath("/admin/team");
  redirect("/admin/team");
}

export type DeleteDoctorState = {
  ok?: boolean;
  error?: string;
};

export async function deleteDoctorAction(id: string): Promise<DeleteDoctorState> {
  const authErr = await assertAdmin();
  if (authErr) return { error: authErr };
  if (!isSupabaseConfigured()) return { error: "Supabase холбогдоогүй байна." };
  const doctorId = id.trim();
  if (!doctorId) return { error: "ID шаардлагатай." };

  const supabase = createSupabaseAdmin();

  await supabase.from("doctor_branches").delete().eq("doctor_id", doctorId);
  await supabase.from("doctor_services").delete().eq("doctor_id", doctorId);

  const { error } = await supabase.from("doctors").delete().eq("id", doctorId);
  if (error) return { error: translateError(error) };

  after(() => emitSync({ kind: "staff", id: doctorId }));
  revalidatePath("/admin/team");
  return { ok: true };
}

export type UpdateDoctorState = {
  error?: string;
  ok?: boolean;
};

export async function updateDoctorAction(
  _prev: UpdateDoctorState,
  formData: FormData,
): Promise<UpdateDoctorState> {
  const authErr = await assertAdmin();
  if (authErr) return { error: authErr };
  if (!isSupabaseConfigured())
    return { error: "Supabase холбогдоогүй байна." };

  const id = String(formData.get("id") || "").trim();
  if (!id) return { error: "ID шаардлагатай." };

  const yearsRaw = String(formData.get("years_exp") || "").trim();
  const yearsExp = Number(yearsRaw);
  const validYears = Number.isFinite(yearsExp) && yearsExp >= 0 ? yearsExp : null;

  const supabase = createSupabaseAdmin();
  const { data: updated, error } = await supabase
    .from("doctors")
    .update({
      department_id: String(formData.get("department_id") || ""),
      name_mn: String(formData.get("name_mn") || "").trim(),
      name_en: String(formData.get("name_en") || "").trim(),
      title_mn: String(formData.get("title_mn") || "").trim() || null,
      title_en: String(formData.get("title_en") || "").trim() || null,
      bio_mn: String(formData.get("bio_mn") || "").trim() || null,
      bio_en: String(formData.get("bio_en") || "").trim() || null,
      photo_url: String(formData.get("photo_url") || "").trim() || null,
      years_exp: validYears,
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", id)
    .select("id");

  if (error) return { error: translateError(error) };
  if (!updated || updated.length === 0)
    return { error: "Эмч олдсонгүй." };

  const branchErr = await setDoctorBranches(supabase, id, readBranchIds(formData));
  if (branchErr) return { error: branchErr };
  const svcErr = await setDoctorServices(supabase, id, readServiceIds(formData));
  if (svcErr) return { error: svcErr };

  after(() => emitSync({ kind: "staff", id }));
  revalidatePath("/admin/team");
  return { ok: true };
}
