import type {
  Branch,
  ClinicProfile,
  Department,
  DoctorWithDepartment,
  ServiceWithDepartment,
} from "@/lib/supabase/types";
import { getSiteUrl } from "./constants";

type Bilingual = { mn: string; en: string };

// Bilingual envelope helper. When one locale is missing, mirror the present
// locale into the empty side so Dentexgo's zod schema (which requires both
// keys to be non-null strings) accepts the payload. Per the integration
// contract §"Bilingual fields": mirror when only one locale exists.
function bilingual(mn: string | null, en: string | null): Bilingual | null {
  const m = mn?.trim() || null;
  const e = en?.trim() || null;
  if (!m && !e) return null;
  return { mn: m ?? e!, en: e ?? m! };
}

function serviceBookingUrl(serviceSlug: string): Bilingual {
  const site = getSiteUrl().replace(/\/$/, "");
  const slug = encodeURIComponent(serviceSlug);
  return {
    mn: `${site}/mn/services/${slug}`,
    en: `${site}/en/services/${slug}`,
  };
}

export function transformClinic(row: ClinicProfile) {
  return {
    slug: row.slug,
    name: { mn: row.name_mn, en: row.name_en } satisfies Bilingual,
    locale: "mn" as const,
    timezone: row.timezone,
    hours: row.hours,
    address: bilingual(row.address_mn, row.address_en),
    phone: row.phone,
    insurance: bilingual(row.insurance_mn, row.insurance_en),
    updatedAt: row.updated_at,
  };
}

export function transformBranch(row: Branch) {
  return {
    id: row.id,
    slug: row.slug,
    name: { mn: row.name_mn, en: row.name_en } satisfies Bilingual,
    address: bilingual(row.address_mn, row.address_en),
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
    description: bilingual(row.description_mn, row.description_en),
    category: row.category,
    priceCents: row.price_cents,
    currency: row.currency,
    // Respect the per-service opt-in: if the admin hasn't marked this
    // service as duration-displayable, hide it from the bot too — even when
    // the global persona.show_duration_in_cards toggle is on.
    durationMin: row.show_duration ? row.duration_min : null,
    bookingUrl: serviceBookingUrl(row.slug),
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
    role: bilingual(row.title_mn, row.title_en),
    specialties: row.department?.slug ? [row.department.slug] : [],
    languages: [] as string[],
    bio: bilingual(row.bio_mn, row.bio_en),
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
