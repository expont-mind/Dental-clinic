import { createSupabaseServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/auth";
import type {
  ClinicProfile,
  Doctor,
  ServiceWithDepartment,
} from "@/lib/supabase/types";

const SERVICE_SELECT = `
  id, slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, itdoctor_service_id,
  is_active, sort_order, created_at, updated_at,
  department:departments!inner ( id, slug, name_mn, name_en )
`;

export async function listServicesAdmin(): Promise<ServiceWithDepartment[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("services")
    .select(SERVICE_SELECT)
    .is("itdoctor_service_id", null)
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
