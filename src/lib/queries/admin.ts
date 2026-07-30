import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin, isAdminConfigured } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/auth";
import type {
  ClinicProfile,
  Department,
  Doctor,
  PendingBooking,
  PendingBookingStatus,
  ServiceWithDepartment,
} from "@/lib/supabase/types";

const SERVICE_SELECT = `
  id, slug, department_id, parent_id, name_mn, name_en,
  description_mn, description_en, long_description_mn, long_description_en,
  category, price_cents, currency, duration_min,
  price_text_mn, price_text_en, duration_text_mn, duration_text_en,
  image_url, hero_image_url, icon_key,
  content_mn, content_en,
  itdoctor_service_id, is_active, is_featured, is_bookable, show_duration, is_multi_visit, sort_order, created_at, updated_at,
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

// ----------------------------------------------------------------------------
// Pending bookings — the QPay → iDoctor reconciliation queue.
// This is the real source of truth for bookings made through the site.
// See supabase/12_booking_payment.sql + src/lib/actions/fulfill-booking.ts.
// ----------------------------------------------------------------------------

export type PendingBookingFilter =
  | PendingBookingStatus
  | "pending_any"
  | "all";

export async function listPendingBookingsAdmin(
  statusFilter: PendingBookingFilter = "all",
): Promise<PendingBooking[]> {
  // Use the service-role client: pending_bookings is written by
  // createSupabaseAdmin in fulfill-booking.ts and isn't granted to anon.
  // The admin page is gated by requireAdminUser, so bypassing RLS is safe.
  if (!isAdminConfigured()) return [];
  const supabase = createSupabaseAdmin();
  let q = supabase
    .from("pending_bookings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (statusFilter === "pending_any") {
    q = q.in("status", ["pending", "processing"]);
  } else if (statusFilter !== "all") {
    q = q.eq("status", statusFilter);
  }
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as PendingBooking[];
}

/**
 * Customer-facing: every booking made under a given phone (8 digits, the form
 * stored in pending_bookings). Uses the service-role client because the table
 * isn't exposed to anon; callers MUST derive `phone8` from the authenticated
 * session, never from client input. Newest appointment first.
 */
export async function listBookingsByPhone(
  phone8: string,
): Promise<PendingBooking[]> {
  if (!isAdminConfigured() || !phone8) return [];
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("pending_bookings")
    .select("*")
    .eq("customer_phone", phone8)
    .order("slot_datetime", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as unknown as PendingBooking[];
}

export type AdminBookingStats = {
  paidToday: number;
  paidWeek: number;
  paidMonth: number;
  paidAll: number;
  awaitingPayment: number;
  activeDoctors: number;
};

export async function getAdminBookingStats(): Promise<AdminBookingStats> {
  const zero: AdminBookingStats = {
    paidToday: 0,
    paidWeek: 0,
    paidMonth: 0,
    paidAll: 0,
    awaitingPayment: 0,
    activeDoctors: 0,
  };
  if (!isAdminConfigured()) return zero;

  const supabase = createSupabaseAdmin();
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(startOfWeek.getDate() - 6);
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // We count by created_at (rather than paid_at) so day/week/month buckets
  // line up with the booking submission timeline. Bookings made today that
  // pay slightly later still show up in "today".
  const [todayRes, weekRes, monthRes, allRes, awaitingRes, doctorsRes] =
    await Promise.all([
      supabase
        .from("pending_bookings")
        .select("id", { count: "exact", head: true })
        .eq("status", "paid")
        .gte("created_at", startOfDay.toISOString()),
      supabase
        .from("pending_bookings")
        .select("id", { count: "exact", head: true })
        .eq("status", "paid")
        .gte("created_at", startOfWeek.toISOString()),
      supabase
        .from("pending_bookings")
        .select("id", { count: "exact", head: true })
        .eq("status", "paid")
        .gte("created_at", startOfMonth.toISOString()),
      supabase
        .from("pending_bookings")
        .select("id", { count: "exact", head: true })
        .eq("status", "paid"),
      supabase
        .from("pending_bookings")
        .select("id", { count: "exact", head: true })
        .in("status", ["pending", "processing"])
        .gt("expires_at", now.toISOString()),
      supabase
        .from("doctors")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
    ]);

  return {
    paidToday: todayRes.count ?? 0,
    paidWeek: weekRes.count ?? 0,
    paidMonth: monthRes.count ?? 0,
    paidAll: allRes.count ?? 0,
    awaitingPayment: awaitingRes.count ?? 0,
    activeDoctors: doctorsRes.count ?? 0,
  };
}
