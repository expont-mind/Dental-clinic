"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { assertAdmin, isSupabaseConfigured } from "@/lib/auth";
import { translateError } from "@/lib/utils/translate-error";
import { emitSync } from "@/lib/dentexgo/webhook";
import { patchBotPersona, DentexgoError } from "@/lib/dentexgo/client";
import { getFeaturedServiceIds } from "@/lib/queries/catalog";
import type { ServiceContentBlock } from "@/lib/supabase/types";

/** Push the current is_featured truth to Dentexgo's persona so the
 * Messenger bot pins the same services the website features. Best-effort
 * — log and swallow on failure so a Dentexgo outage never blocks an
 * admin save. */
async function syncFeaturedToBotPersona(): Promise<void> {
  try {
    const ids = await getFeaturedServiceIds();
    await patchBotPersona({ featured_services: ids });
  } catch (e) {
    const detail = e instanceof DentexgoError ? `${e.code}: ${e.message}` : e;
    console.error("[services] persona featured sync failed:", detail);
  }
}

export type ServiceFormState = {
  error?: string;
  ok?: boolean;
  values?: {
    slug?: string;
    department_id?: string;
    name_mn?: string;
    name_en?: string;
    description_mn?: string;
    description_en?: string;
    long_description_mn?: string;
    long_description_en?: string;
    price_text_mn?: string;
    price_text_en?: string;
    duration_text_mn?: string;
    duration_text_en?: string;
    price_mnt?: string;
    duration_min?: string;
    sort_order?: string;
    is_active?: string;
    is_featured?: string;
    is_bookable?: string;
    is_multi_visit?: string;
    show_duration?: string;
    parent_id?: string;
    image_url?: string;
    hero_image_url?: string;
    content_mn?: string;
    content_en?: string;
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
      .slice(0, 60) || `svc-${Date.now().toString(36)}`
  );
}

// Form takes price in whole MNT for humans; we store integer cents (× 100).
function priceCentsFromForm(raw: string): number | null {
  const cleaned = raw.replace(/[^\d.-]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

function readBranchIds(formData: FormData): string[] {
  return formData
    .getAll("branch_ids")
    .map((v) => String(v).trim())
    .filter((v) => v.length > 0);
}

async function setServiceBranches(
  supabase: ReturnType<typeof createSupabaseAdmin>,
  serviceId: string,
  branchIds: string[],
): Promise<string | null> {
  const { error: delErr } = await supabase
    .from("service_branches")
    .delete()
    .eq("service_id", serviceId);
  if (delErr) return translateError(delErr);
  if (branchIds.length === 0) return null;
  const rows = branchIds.map((branch_id) => ({ service_id: serviceId, branch_id }));
  const { error: insErr } = await supabase.from("service_branches").insert(rows);
  if (insErr) return translateError(insErr);
  return null;
}

function readFields(formData: FormData): NonNullable<ServiceFormState["values"]> {
  return {
    slug: String(formData.get("slug") || "").trim(),
    department_id: String(formData.get("department_id") || "").trim(),
    name_mn: String(formData.get("name_mn") || "").trim(),
    name_en: String(formData.get("name_en") || "").trim(),
    description_mn: String(formData.get("description_mn") || "").trim(),
    description_en: String(formData.get("description_en") || "").trim(),
    long_description_mn: String(formData.get("long_description_mn") || "").trim(),
    long_description_en: String(formData.get("long_description_en") || "").trim(),
    price_text_mn: String(formData.get("price_text_mn") || "").trim(),
    price_text_en: String(formData.get("price_text_en") || "").trim(),
    duration_text_mn: String(formData.get("duration_text_mn") || "").trim(),
    duration_text_en: String(formData.get("duration_text_en") || "").trim(),
    price_mnt: String(formData.get("price_mnt") || "").trim(),
    duration_min: String(formData.get("duration_min") || "").trim(),
    sort_order: String(formData.get("sort_order") || "").trim(),
    is_active: formData.get("is_active") === "on" ? "on" : "",
    is_featured: formData.get("is_featured") === "on" ? "on" : "",
    is_bookable: formData.get("is_bookable") === "on" ? "on" : "",
    is_multi_visit: formData.get("is_multi_visit") === "on" ? "on" : "",
    // Checkbox sends "on" when checked; hidden sibling sends "off" as default.
    // getAll().includes("on") survives both orderings.
    show_duration: formData.getAll("show_duration").includes("on") ? "on" : "",
    parent_id: String(formData.get("parent_id") || "").trim(),
    image_url: String(formData.get("image_url") || "").trim(),
    hero_image_url: String(formData.get("hero_image_url") || "").trim(),
    content_mn: String(formData.get("content_mn") || "").trim(),
    content_en: String(formData.get("content_en") || "").trim(),
  };
}

// Per-service iDoctor service_id is no longer used. Every booking is now
// routed to one of two configured iDoctor services (Эмчилгээ 1 or Үзлэг 1)
// via env vars + the is_multi_visit flag — see resolveServiceIdForBooking
// in src/lib/itdoctor/client.ts. The `itdoctor_service_id` column on
// services is kept for historical data but is never written to on create/
// update and never read on booking.

function parseContentJson(raw: string | undefined): ServiceContentBlock {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as ServiceContentBlock;
    }
    return {};
  } catch {
    return {};
  }
}

function validate(
  v: NonNullable<ServiceFormState["values"]>,
): string | null {
  if (!v.department_id) return "Тасгаа сонгоно уу.";
  if (!v.name_mn) return "Үйлчилгээний нэр (MN) шаардлагатай.";
  if (!v.name_en) return "Үйлчилгээний нэрийг англиар бичих шаардлагатай.";
  return null;
}

export async function createServiceAction(
  _prev: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const authErr = await assertAdmin();
  if (authErr) return { error: authErr };
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
      .from("services")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${i}`;
  }

  const sortOrder = Number(values.sort_order);
  const duration = Number(values.duration_min);
  const parentId = values.parent_id || null;

  const { data: inserted, error } = await supabase
    .from("services")
    .insert({
      slug,
      department_id: values.department_id,
      parent_id: parentId,
      name_mn: values.name_mn,
      name_en: values.name_en,
      description_mn: values.description_mn || null,
      description_en: values.description_en || null,
      long_description_mn: values.long_description_mn || null,
      long_description_en: values.long_description_en || null,
      price_text_mn: values.price_text_mn || null,
      price_text_en: values.price_text_en || null,
      duration_text_mn: values.duration_text_mn || null,
      duration_text_en: values.duration_text_en || null,
      price_cents: priceCentsFromForm(values.price_mnt!),
      currency: "MNT",
      duration_min: Number.isFinite(duration) && duration > 0 ? duration : null,
      image_url: values.image_url || null,
      hero_image_url: values.hero_image_url || null,
      content_mn: parseContentJson(values.content_mn),
      content_en: parseContentJson(values.content_en),
      is_active: values.is_active === "on",
      is_featured: values.is_featured === "on",
      is_bookable: values.is_bookable === "on",
      show_duration: values.show_duration === "on",
      is_multi_visit: values.is_multi_visit === "on",
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createServiceAction] supabase insert failed:", error);
    return { error: translateError(error), values };
  }

  if (inserted?.id) {
    const branchErr = await setServiceBranches(
      supabase,
      inserted.id,
      readBranchIds(formData),
    );
    if (branchErr) return { error: branchErr, values };
    after(() => emitSync({ kind: "service", id: inserted.id }));
    // Only sync persona when the new service is actually featured.
    if (values.is_featured === "on" && values.is_active === "on") {
      after(syncFeaturedToBotPersona);
    }
  }

  revalidatePath("/admin/services");
  redirect("/admin/services");
}

export async function updateServiceAction(
  _prev: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const authErr = await assertAdmin();
  if (authErr) return { error: authErr };
  if (!isSupabaseConfigured())
    return { error: "Supabase холбогдоогүй байна." };

  const id = String(formData.get("id") || "").trim();
  if (!id) return { error: "ID шаардлагатай." };

  const values = readFields(formData);
  const err = validate(values);
  if (err) return { error: err, values };

  const sortOrder = Number(values.sort_order);
  const duration = Number(values.duration_min);
  const parentId = values.parent_id || null;

  const supabase = createSupabaseAdmin();

  // Categories (services with children) are navigation, not bookable units.
  // Force the booking-only flags off so a stale category row can never leak
  // a phantom duration / multi-visit / bookable state into the booking flow.
  // The form hides these fields for categories, but defense-in-depth here
  // protects against direct API calls or older form versions.
  const { count: childCount } = await supabase
    .from("services")
    .select("id", { count: "exact", head: true })
    .eq("parent_id", id);
  const hasChildren = (childCount ?? 0) > 0;

  const { data: updated, error } = await supabase
    .from("services")
    .update({
      department_id: values.department_id,
      parent_id: parentId,
      name_mn: values.name_mn,
      name_en: values.name_en,
      description_mn: values.description_mn || null,
      description_en: values.description_en || null,
      long_description_mn: values.long_description_mn || null,
      long_description_en: values.long_description_en || null,
      price_text_mn: values.price_text_mn || null,
      price_text_en: values.price_text_en || null,
      duration_text_mn: values.duration_text_mn || null,
      duration_text_en: values.duration_text_en || null,
      price_cents: priceCentsFromForm(values.price_mnt!),
      duration_min: hasChildren
        ? null
        : Number.isFinite(duration) && duration > 0
          ? duration
          : null,
      image_url: values.image_url || null,
      hero_image_url: values.hero_image_url || null,
      content_mn: parseContentJson(values.content_mn),
      content_en: parseContentJson(values.content_en),
      is_active: values.is_active === "on",
      is_featured: values.is_featured === "on",
      is_bookable: hasChildren ? false : values.is_bookable === "on",
      show_duration: values.show_duration === "on",
      is_multi_visit: hasChildren ? false : values.is_multi_visit === "on",
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    })
    .eq("id", id)
    .select("id");

  if (error) {
    console.error("[updateServiceAction] supabase update failed:", error);
    return { error: translateError(error), values };
  }
  if (!updated || updated.length === 0)
    return { error: "Үйлчилгээ олдсонгүй эсвэл хадгалах эрхгүй.", values };

  const branchErr = await setServiceBranches(supabase, id, readBranchIds(formData));
  if (branchErr) return { error: branchErr, values };

  after(() => emitSync({ kind: "service", id }));
  // Update may have flipped is_featured, is_active, or sort_order — any of
  // those can reshape the persona's featured list. Cheap, idempotent.
  after(syncFeaturedToBotPersona);
  revalidatePath("/admin/services");
  revalidatePath(`/admin/services/${id}`);
  return { ok: true, values };
}

export type DeleteServiceState = { ok?: boolean; error?: string };

/**
 * Hard-delete a service. Refuses if the service is a parent for any other
 * service — caller must reassign or delete the children first, otherwise we'd
 * silently orphan them. Junction rows in `service_branches` and
 * `doctor_services` are cleaned up first so the FK constraints don't block.
 */
export async function deleteServiceAction(
  id: string,
): Promise<DeleteServiceState> {
  const authErr = await assertAdmin();
  if (authErr) return { error: authErr };
  if (!isSupabaseConfigured()) return { error: "Supabase холбогдоогүй байна." };
  const serviceId = id.trim();
  if (!serviceId) return { error: "ID шаардлагатай." };

  const supabase = createSupabaseAdmin();

  // Refuse if this service is a parent — don't orphan children silently.
  const { data: children, error: childErr } = await supabase
    .from("services")
    .select("id, name_mn")
    .eq("parent_id", serviceId)
    .limit(5);
  if (childErr) return { error: translateError(childErr) };
  if (children && children.length > 0) {
    const names = children
      .map((c) => (c as { name_mn: string }).name_mn)
      .join(", ");
    return {
      error: `Эхлээд дотоод үйлчилгээг устгана уу: ${names}`,
    };
  }

  await supabase.from("service_branches").delete().eq("service_id", serviceId);
  await supabase.from("doctor_services").delete().eq("service_id", serviceId);

  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", serviceId);
  if (error) return { error: translateError(error) };

  after(() => emitSync({ kind: "service", id: serviceId }));
  after(syncFeaturedToBotPersona);
  revalidatePath("/admin/services");
  return { ok: true };
}

export async function toggleServiceActiveAction(formData: FormData) {
  if (await assertAdmin()) return;
  if (!isSupabaseConfigured()) return;
  const id = String(formData.get("id") || "").trim();
  const next = formData.get("active") === "true";
  if (!id) return;
  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from("services")
    .update({ is_active: next })
    .eq("id", id);
  if (error) return;
  after(() => emitSync({ kind: "service", id }));
  // Deactivating a featured service removes it from the persona list.
  after(syncFeaturedToBotPersona);
  revalidatePath("/admin/services");
}
