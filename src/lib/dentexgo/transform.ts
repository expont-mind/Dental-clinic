import type {
  Branch,
  ClinicProfile,
  Department,
  DoctorWithDepartment,
  ServiceWithDepartment,
} from "@/lib/supabase/types";
import { getSiteUrl } from "./constants";

type Bilingual = { mn: string; en: string };
type BilingualNullable = { mn: string | null; en: string | null };

function bilingualNullable(mn: string | null, en: string | null): BilingualNullable | null {
  if (mn == null && en == null) return null;
  return { mn, en };
}

function bookingUrlFor(deptSlug: string): Bilingual {
  const site = getSiteUrl().replace(/\/$/, "");
  return {
    mn: `${site}/mn/book/${deptSlug}`,
    en: `${site}/en/book/${deptSlug}`,
  };
}

export function transformClinic(row: ClinicProfile) {
  return {
    slug: row.slug,
    name: { mn: row.name_mn, en: row.name_en } satisfies Bilingual,
    locale: "mn" as const,
    timezone: row.timezone,
    hours: row.hours,
    address: bilingualNullable(row.address_mn, row.address_en),
    phone: row.phone,
    insurance: bilingualNullable(row.insurance_mn, row.insurance_en),
    updatedAt: row.updated_at,
  };
}

export function transformBranch(row: Branch) {
  return {
    id: row.id,
    slug: row.slug,
    name: { mn: row.name_mn, en: row.name_en } satisfies Bilingual,
    address: bilingualNullable(row.address_mn, row.address_en),
    phone: row.phone,
    hours: row.hours,
    timezone: row.timezone,
    isActive: row.is_active,
    updatedAt: row.updated_at,
  };
}

export function transformService(
  row: ServiceWithDepartment,
  branchIds: string[] = [],
) {
  return {
    id: row.id,
    slug: row.slug,
    name: { mn: row.name_mn, en: row.name_en } satisfies Bilingual,
    description: bilingualNullable(row.description_mn, row.description_en),
    category: row.category,
    priceCents: row.price_cents,
    currency: row.currency,
    durationMin: row.duration_min,
    bookingUrl: bookingUrlFor(row.department.slug),
    branchIds,
    isActive: row.is_active,
    updatedAt: row.updated_at,
  };
}

export function transformStaff(
  row: DoctorWithDepartment,
  branchIds: string[] = [],
  allDepartments?: Pick<Department, "slug">[],
) {
  void allDepartments;
  return {
    id: row.id,
    name: { mn: row.name_mn, en: row.name_en } satisfies Bilingual,
    role: bilingualNullable(row.title_mn, row.title_en),
    specialties: row.department?.slug ? [row.department.slug] : [],
    languages: [] as string[],
    bio: bilingualNullable(row.bio_mn, row.bio_en),
    photoUrl: row.photo_url,
    branchIds,
    isActive: row.is_active,
    updatedAt: row.updated_at,
  };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(s: string): boolean {
  return UUID_RE.test(s);
}
