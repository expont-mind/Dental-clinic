import { createSupabaseServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/auth";
import type {
  ClinicProfile,
  Department,
  Doctor,
  ServiceWithDepartment,
} from "@/lib/supabase/types";

const SERVICE_SELECT = `
  id, slug, department_id, parent_id, name_mn, name_en,
  description_mn, description_en, long_description_mn, long_description_en,
  category, price_cents, currency, duration_min,
  price_text_mn, price_text_en, duration_text_mn, duration_text_en,
  image_url, hero_image_url, icon_key,
  content_mn, content_en,
  itdoctor_service_id, is_active, is_featured, sort_order, created_at, updated_at,
  department:departments!inner ( id, slug, name_mn, name_en )
`;

export async function listServicesAdmin(): Promise<ServiceWithDepartment[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServer();
  // Admin sees ALL services — including ones linked to external systems
  // (itdoctor_service_id set) and inactive ones. The public listing applies
  // its own filters; the admin list intentionally does not.
  const { data, error } = await supabase
    .from("services")
    .select(SERVICE_SELECT)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as ServiceWithDepartment[];
}

export async function getServiceById(
  id: string,
): Promise<ServiceWithDepartment | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("services")
    .select(SERVICE_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as ServiceWithDepartment | null;
}

export async function getClinicProfile(): Promise<ClinicProfile | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("clinic_profile")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data as ClinicProfile | null;
}

// ----------------------------------------------------------------------------
// Departments — admin CRUD
// ----------------------------------------------------------------------------

export async function listDepartmentsAdmin(): Promise<Department[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Department[];
}

export async function getDepartmentByIdAdmin(
  id: string,
): Promise<Department | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Department | null) ?? null;
}

/** Per-department doctor + service counts so the admin list page can show
 * what depends on each row and the delete action can refuse safely. */
export async function countDepartmentDependents(): Promise<
  Map<string, { doctors: number; services: number }>
> {
  if (!isSupabaseConfigured()) return new Map();
  const supabase = await createSupabaseServer();
  const [{ data: docs }, { data: svcs }] = await Promise.all([
    supabase.from("doctors").select("department_id"),
    supabase.from("services").select("department_id"),
  ]);
  const counts = new Map<string, { doctors: number; services: number }>();
  const bump = (id: string | null | undefined, key: "doctors" | "services") => {
    if (!id) return;
    const e = counts.get(id) ?? { doctors: 0, services: 0 };
    e[key]++;
    counts.set(id, e);
  };
  for (const r of docs ?? []) bump((r as { department_id: string | null }).department_id, "doctors");
  for (const r of svcs ?? []) bump((r as { department_id: string | null }).department_id, "services");
  return counts;
}

export async function listDoctorsByITDoctorIds(): Promise<Doctor[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("doctors")
    .select("*")
    .not("itdoctor_dentist_id", "is", null)
    .eq("is_active", true);
  if (error) throw error;
  return (data ?? []) as Doctor[];
}

export async function getDoctorByIdAdmin(id: string): Promise<Doctor | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("doctors")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Doctor | null;
}
