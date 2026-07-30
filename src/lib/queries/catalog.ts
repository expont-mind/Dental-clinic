import { createSupabaseServer } from "@/lib/supabase/server";
import type {
  Department,
  Doctor,
  DoctorWithDepartment,
  Service,
  ServiceWithDepartment,
  TimeSlot,
} from "@/lib/supabase/types";
import {
  FALLBACK_DEPARTMENTS,
  FALLBACK_DOCTORS,
  fallbackDoctorsWithDepartment,
  generateFallbackSlots,
} from "./seed-fallback";

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && !url.includes("YOUR_PROJECT_REF"));
}

export async function listDepartments(): Promise<Department[]> {
  if (!isSupabaseConfigured()) {
    return [...FALLBACK_DEPARTMENTS].sort(
      (a, b) => a.sort_order - b.sort_order,
    );
  }
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).filter(isDentalDepartment);
}

function isDentalDepartment(d: Pick<Department, "slug" | "name_mn" | "name_en">): boolean {
  const slug = d.slug?.toLowerCase();
  if (slug && DENTAL_DEPT_SLUGS.has(slug)) return true;
  const haystack = [d.name_mn, d.name_en]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return DENTAL_KEYWORDS.some((k) => haystack.includes(k));
}

export async function getDepartmentBySlug(
  slug: string,
): Promise<Department | null> {
  if (!isSupabaseConfigured()) {
    return FALLBACK_DEPARTMENTS.find((d) => d.slug === slug) ?? null;
  }
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

function withLocalPhotos<T extends { photo_url: string | null }>(
  docs: T[],
): T[] {
  return docs;
}

/**
 * Dental-only filter. The Supabase database may still contain legacy
 * general-hospital department rows (Дотрын/Зүрх судас/Арьс гэх мэт);
 * only doctors whose department slug matches one of these dental slugs
 * are surfaced on the public site.
 */
const DENTAL_DEPT_SLUGS = new Set([
  "general",
  "cosmetic",
  "orthodontics",
  "pediatric",
  "restorative",
  "hygiene",
  "endodontics",
  "prosthodontics",
  "oral-surgery",
  "dental",
]);

const DENTAL_KEYWORDS = [
  // Mongolian
  "шүд",
  "шүдн",
  "ерөнхий эмч",
  "гажиг засал",
  "имплант",
  "ортодонт",
  "эрүүл ахуй",
  "сувгийн",
  "согог засал",
  "мэс заслын эмч",
  "hollywood smile",
  // English
  "dental",
  "dentist",
  "implant",
  "ortho",
  "hygienist",
  "endodont",
  "prosthod",
  "oral surg",
];

function isDentalDoctor(d: DoctorWithDepartment): boolean {
  const slug = d.department?.slug?.toLowerCase();
  if (slug && DENTAL_DEPT_SLUGS.has(slug)) return true;
  // Fallback — check title / department name for dental keywords
  const haystack = [
    d.department?.name_mn,
    d.department?.name_en,
    d.title_mn,
    d.title_en,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return DENTAL_KEYWORDS.some((k) => haystack.includes(k));
}

export async function listDoctors(opts?: {
  departmentSlug?: string;
}): Promise<DoctorWithDepartment[]> {
  if (!isSupabaseConfigured()) {
    let docs = fallbackDoctorsWithDepartment();
    if (opts?.departmentSlug) {
      docs = docs.filter((d) => d.department.slug === opts.departmentSlug);
    }
    docs = docs.filter(isDentalDoctor);
    return withLocalPhotos(docs.sort((a, b) => a.sort_order - b.sort_order));
  }
  const supabase = await createSupabaseServer();
  let query = supabase
    .from("doctors")
    .select(
      "*, department:departments!doctors_department_id_fkey(id,slug,name_mn,name_en)",
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (opts?.departmentSlug) {
    const dept = await getDepartmentBySlug(opts.departmentSlug);
    if (!dept) return [];
    query = query.eq("department_id", dept.id);
  }
  const { data, error } = await query;
  if (error) throw error;
  const docs = ((data ?? []) as unknown as DoctorWithDepartment[]).filter(
    isDentalDoctor,
  );
  return withLocalPhotos(docs);
}

export async function listDoctorsPreview(
  limit = 3,
): Promise<DoctorWithDepartment[]> {
  const all = await listDoctors();
  return all.slice(0, limit);
}

export async function getDoctorBySlug(
  slug: string,
): Promise<DoctorWithDepartment | null> {
  // Resolve the index of this doctor in the full list so the photo cycle
  // stays stable when navigating between list and detail pages.
  const all = await listDoctors();
  return all.find((d) => d.slug === slug) ?? null;
}

export async function getDoctorById(
  id: string,
): Promise<Doctor | null> {
  if (!isSupabaseConfigured()) {
    return FALLBACK_DOCTORS.find((d) => d.id === id) ?? null;
  }
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("doctors")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listAvailableSlots(
  doctorId: string,
): Promise<TimeSlot[]> {
  if (!isSupabaseConfigured()) {
    return generateFallbackSlots(doctorId);
  }
  const supabase = await createSupabaseServer();
  const nowIso = new Date().toISOString();
  const inTwoWeeks = new Date(
    Date.now() + 14 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const { data, error } = await supabase
    .from("time_slots")
    .select("*")
    .eq("doctor_id", doctorId)
    .eq("is_booked", false)
    .gte("slot_start", nowIso)
    .lte("slot_start", inTwoWeeks)
    .order("slot_start", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getSlotById(id: string): Promise<TimeSlot | null> {
  if (!isSupabaseConfigured()) {
    // The fallback slot ids encode the doctor + datetime; reconstruct.
    // id format: slot-<doctorId>-<YYYY-MM-DD>-<HHMM>
    const m = id.match(/^slot-(.+)-(\d{4}-\d{2}-\d{2})-(\d{2})(\d{2})$/);
    if (!m) return null;
    const [, doctorId, day, hh, mm] = m;
    const startDate = new Date(`${day}T${hh}:${mm}:00+08:00`);
    return {
      id,
      doctor_id: doctorId,
      slot_start: startDate.toISOString(),
      slot_end: new Date(startDate.getTime() + 30 * 60 * 1000).toISOString(),
      is_booked: false,
      created_at: new Date().toISOString(),
    };
  }
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("time_slots")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ---------- Public service queries ----------

/** Fetch a single service by ID (used by child pages to get parent info) */
export async function getServiceById(id: string): Promise<Service | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Service | null;
}

/** Sibling services: same parent, excluding current slug */
export async function getSiblingServices(
  parentId: string,
  excludeSlug: string,
): Promise<Service[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("parent_id", parentId)
    .neq("slug", excludeSlug)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Service[];
}

/** Top-level parent categories only (parent_id IS NULL).
 * Bookable vs. non-bookable services both appear here — the
 * `itdoctor_service_id` value now distinguishes "can book online" from
 * "info-only" rather than "managed externally". */
export async function listActiveServicesPublic(): Promise<Service[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .is("parent_id", null)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Service[];
}

/** Active services flagged is_featured = true. Used by /[lang]/featured.
 *  Includes both parents and children — whatever has been pinned. */
export async function listFeaturedServicesPublic(): Promise<Service[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Service[];
}

/** IDs of active featured services, capped at 8 to match the Dentexgo
 *  persona.featured_services contract. Used to keep the bot's pinned-list
 *  in sync with the website's is_featured truth. */
export async function getFeaturedServiceIds(): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("services")
    .select("id")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true })
    .limit(8);
  if (error) {
    console.error("[featured] getFeaturedServiceIds failed:", error.message);
    return [];
  }
  return (data ?? []).map((r) => (r as { id: string }).id);
}

/** Returns active top-level parents with their active children attached.
 * One round-trip to Supabase (two queries running in parallel) so the
 * /services page can render the full catalog tree without N+1 fetches. */
export async function listServicesByParentTree(): Promise<
  { parent: Service; children: Service[] }[]
> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServer();
  const [{ data: parents, error: pErr }, { data: kids, error: cErr }] =
    await Promise.all([
      supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .is("parent_id", null)
        .order("sort_order", { ascending: true }),
      supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .not("parent_id", "is", null)
        .order("sort_order", { ascending: true }),
    ]);
  if (pErr) throw pErr;
  if (cErr) throw cErr;

  const childrenByParent = new Map<string, Service[]>();
  for (const c of (kids ?? []) as Service[]) {
    if (!c.parent_id) continue;
    const list = childrenByParent.get(c.parent_id) ?? [];
    list.push(c);
    childrenByParent.set(c.parent_id, list);
  }

  return ((parents ?? []) as Service[]).map((parent) => ({
    parent,
    children: childrenByParent.get(parent.id) ?? [],
  }));
}

/** Child services under a parent */
export async function listChildServices(parentId: string): Promise<Service[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("parent_id", parentId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Service[];
}

/** Parents shown in the booking flow. A parent is "bookable" if it
 * has its own itdoctor_service_id (it acts as a leaf bookable service)
 * OR if it has at least one active child with an itdoctor_service_id.
 * Used only by /book; the /services info catalog still shows everything. */
export async function listBookableParentServicesPublic(): Promise<Service[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServer();
  const [{ data: parents, error: pErr }, { data: bookableChildren, error: cErr }] =
    await Promise.all([
      supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .is("parent_id", null)
        .order("sort_order", { ascending: true }),
      supabase
        .from("services")
        .select("parent_id")
        .eq("is_active", true)
        .eq("is_bookable", true)
        .not("parent_id", "is", null),
    ]);
  if (pErr) throw pErr;
  if (cErr) throw cErr;

  const parentIdsWithBookableChild = new Set(
    ((bookableChildren ?? []) as { parent_id: string | null }[])
      .map((r) => r.parent_id)
      .filter((v): v is string => v != null),
  );

  // A top-level row appears in the booking entry if it's itself bookable
  // (a top-level leaf) or it's a category with at least one bookable child.
  return ((parents ?? []) as Service[]).filter(
    (p) => p.is_bookable || parentIdsWithBookableChild.has(p.id),
  );
}

/** Bookable children under a parent: requires is_bookable. */
export async function listBookableChildServices(parentId: string): Promise<Service[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("parent_id", parentId)
    .eq("is_active", true)
    .eq("is_bookable", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Service[];
}

export async function getServiceBySlugPublic(
  slug: string,
): Promise<Service | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data as Service | null;
}

export async function listDoctorsForService(
  serviceId: string,
): Promise<DoctorWithDepartment[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServer();

  // Get doctor IDs from junction
  const { data: junctionRows, error: jErr } = await supabase
    .from("doctor_services")
    .select("doctor_id")
    .eq("service_id", serviceId);
  if (jErr) throw jErr;
  const doctorIds = (junctionRows ?? []).map(
    (r) => (r as { doctor_id: string }).doctor_id,
  );
  if (doctorIds.length === 0) return [];

  // Fetch those doctors with departments
  const { data, error } = await supabase
    .from("doctors")
    .select(
      "*, department:departments!doctors_department_id_fkey(id,slug,name_mn,name_en)",
    )
    .eq("is_active", true)
    .in("id", doctorIds)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return withLocalPhotos(
    (data ?? []) as unknown as DoctorWithDepartment[],
  );
}
