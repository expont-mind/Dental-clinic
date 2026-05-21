"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/auth";
import { translateError } from "@/lib/utils/translate-error";

export type DepartmentFormState = {
  error?: string;
  ok?: boolean;
  values?: {
    slug?: string;
    name_mn?: string;
    name_en?: string;
    description_mn?: string;
    description_en?: string;
    icon_key?: string;
    sort_order?: string;
    is_active?: string;
  };
};

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || `dept-${Date.now().toString(36)}`
  );
}

function readFields(formData: FormData): NonNullable<DepartmentFormState["values"]> {
  return {
    slug: String(formData.get("slug") || "").trim(),
    name_mn: String(formData.get("name_mn") || "").trim(),
    name_en: String(formData.get("name_en") || "").trim(),
    description_mn: String(formData.get("description_mn") || "").trim(),
    description_en: String(formData.get("description_en") || "").trim(),
    icon_key: String(formData.get("icon_key") || "").trim(),
    sort_order: String(formData.get("sort_order") || "").trim(),
    is_active: formData.get("is_active") === "on" ? "on" : "",
  };
}

function validate(v: NonNullable<DepartmentFormState["values"]>): string | null {
  if (!v.name_mn) return "Тасгийн нэр (MN) шаардлагатай.";
  if (!v.name_en) return "Тасгийн нэрийг англиар бичих шаардлагатай.";
  return null;
}

export async function createDepartmentAction(
  _prev: DepartmentFormState,
  formData: FormData,
): Promise<DepartmentFormState> {
  if (!isSupabaseConfigured()) return { error: "Supabase холбогдоогүй байна." };
  const values = readFields(formData);
  const err = validate(values);
  if (err) return { error: err, values };

  const supabase = createSupabaseAdmin();
  const baseSlug = values.slug || slugify(values.name_en!);
  let slug = baseSlug;
  for (let i = 2; i <= 9; i++) {
    const { data: existing } = await supabase
      .from("departments")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${i}`;
  }

  const sortOrder = Number(values.sort_order);
  const { error } = await supabase.from("departments").insert({
    slug,
    name_mn: values.name_mn,
    name_en: values.name_en,
    description_mn: values.description_mn || null,
    description_en: values.description_en || null,
    icon_key: values.icon_key || null,
    is_active: values.is_active === "on",
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
  });

  if (error) return { error: translateError(error), values };

  revalidatePath("/admin/departments");
  revalidatePath("/admin/team");
  revalidatePath("/admin/services");
  redirect("/admin/departments");
}

export async function updateDepartmentAction(
  _prev: DepartmentFormState,
  formData: FormData,
): Promise<DepartmentFormState> {
  if (!isSupabaseConfigured()) return { error: "Supabase холбогдоогүй байна." };

  const id = String(formData.get("id") || "").trim();
  if (!id) return { error: "ID шаардлагатай." };

  const values = readFields(formData);
  const err = validate(values);
  if (err) return { error: err, values };

  const sortOrder = Number(values.sort_order);
  const supabase = createSupabaseAdmin();
  const { data: updated, error } = await supabase
    .from("departments")
    .update({
      name_mn: values.name_mn,
      name_en: values.name_en,
      description_mn: values.description_mn || null,
      description_en: values.description_en || null,
      icon_key: values.icon_key || null,
      is_active: values.is_active === "on",
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    })
    .eq("id", id)
    .select("id");

  if (error) return { error: translateError(error), values };
  if (!updated || updated.length === 0)
    return { error: "Тасаг олдсонгүй эсвэл хадгалах эрхгүй.", values };

  revalidatePath("/admin/departments");
  revalidatePath(`/admin/departments/${id}`);
  revalidatePath("/admin/team");
  revalidatePath("/admin/services");
  return { ok: true, values };
}

export async function toggleDepartmentActiveAction(formData: FormData) {
  if (!isSupabaseConfigured()) return;
  const id = String(formData.get("id") || "").trim();
  const next = formData.get("active") === "true";
  if (!id) return;
  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from("departments")
    .update({ is_active: next })
    .eq("id", id);
  if (error) return;
  revalidatePath("/admin/departments");
}

export async function deleteDepartmentAction(
  formData: FormData,
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured()) return { error: "Supabase холбогдоогүй байна." };
  const id = String(formData.get("id") || "").trim();
  if (!id) return { error: "ID шаардлагатай." };

  const supabase = createSupabaseAdmin();

  // FK guard: block delete when doctors or services reference this department.
  const [{ count: doctorCount }, { count: serviceCount }] = await Promise.all([
    supabase
      .from("doctors")
      .select("id", { count: "exact", head: true })
      .eq("department_id", id),
    supabase
      .from("services")
      .select("id", { count: "exact", head: true })
      .eq("department_id", id),
  ]);

  if ((doctorCount ?? 0) + (serviceCount ?? 0) > 0) {
    return {
      error: `Энэ тасагт ${doctorCount ?? 0} эмч, ${serviceCount ?? 0} үйлчилгээ холбогдсон байна. Эхлээд тэдгээрийг өөр тасаг руу шилжүүлэх эсвэл идэвхгүй болгоно уу.`,
    };
  }

  const { error } = await supabase.from("departments").delete().eq("id", id);
  if (error) return { error: translateError(error) };

  revalidatePath("/admin/departments");
  return {};
}
