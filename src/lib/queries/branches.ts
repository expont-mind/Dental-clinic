import { createSupabaseServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/auth";
import type { Branch } from "@/lib/supabase/types";

const BRANCH_SELECT = `
  id, slug, name_mn, name_en, address_mn, address_en, phone, hours,
  timezone, is_active, sort_order, created_at, updated_at
`;

export async function listBranchesAdmin(): Promise<Branch[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("branches")
    .select(BRANCH_SELECT)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as Branch[];
}

export async function getBranchById(id: string): Promise<Branch | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("branches")
    .select(BRANCH_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as Branch) ?? null;
}

export async function listBranchIdsForService(serviceId: string): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("service_branches")
    .select("branch_id")
    .eq("service_id", serviceId);
  if (error) throw error;
  return (data ?? []).map((r) => (r as { branch_id: string }).branch_id);
}

export async function listBranchIdsForDoctor(doctorId: string): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("doctor_branches")
    .select("branch_id")
    .eq("doctor_id", doctorId);
  if (error) throw error;
  return (data ?? []).map((r) => (r as { branch_id: string }).branch_id);
}

export async function listServiceIdsForDoctor(doctorId: string): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("doctor_services")
    .select("service_id")
    .eq("doctor_id", doctorId);
  if (error) throw error;
  return (data ?? []).map((r) => (r as { service_id: string }).service_id);
}
