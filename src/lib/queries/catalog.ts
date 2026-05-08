import { createSupabaseServer } from "@/lib/supabase/server";
import type {
  Department,
  Doctor,
  DoctorWithDepartment,
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
  return data ?? [];
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

export async function listDoctors(opts?: {
  departmentSlug?: string;
}): Promise<DoctorWithDepartment[]> {
  if (!isSupabaseConfigured()) {
    let docs = fallbackDoctorsWithDepartment();
    if (opts?.departmentSlug) {
      docs = docs.filter((d) => d.department.slug === opts.departmentSlug);
    }
    return docs.sort((a, b) => a.sort_order - b.sort_order);
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
  return (data ?? []) as unknown as DoctorWithDepartment[];
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
  if (!isSupabaseConfigured()) {
    return (
      fallbackDoctorsWithDepartment().find((d) => d.slug === slug) ?? null
    );
  }
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("doctors")
    .select(
      "*, department:departments!doctors_department_id_fkey(id,slug,name_mn,name_en)",
    )
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as DoctorWithDepartment | null;
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
