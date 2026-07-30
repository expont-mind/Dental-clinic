/**
 * IT Doctor API client for the Dentaris clinic booking system.
 * Docs: THIRD_PARTY_BOOKING_API_MN.md
 */

const API_URL = () => process.env.ITDOCTOR_API_URL!;
const API_TOKEN = () => process.env.ITDOCTOR_API_TOKEN!;

/**
 * iDoctor exposes only two configured services for this clinic — Treatment
 * (Эмчилгээ 1) and Checkup (Үзлэг 1). Every booking must POST one of those
 * ids. Per-service iDoctor IDs in our DB are no longer used; we route based
 * on the service's `is_multi_visit` flag.
 *
 * Falls back to legacy id 35 if env isn't configured so the booking flow
 * still tries to complete instead of hard-failing.
 */
export function resolveServiceIdForBooking(isMultiVisit: boolean): number {
  const raw = isMultiVisit
    ? process.env.ITDOCTOR_CHECKUP_SERVICE_ID
    : process.env.ITDOCTOR_TREATMENT_SERVICE_ID;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 35;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${API_TOKEN()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // Surface Retry-After so the booking chain can respect rate limits.
    if (res.status === 429) {
      const ra = res.headers.get("retry-after");
      if (ra) body.retry_after = ra;
    }
    throw new ITDoctorError(res.status, body.message ?? res.statusText, body);
  }

  const json = await res.json();
  if (!json.success) {
    throw new ITDoctorError(422, json.message ?? "Unknown error", json);
  }
  return json.data as T;
}

export class ITDoctorError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ITDoctorError";
  }
}

// ---------- Types ----------

export interface ITBranch {
  id: number;
  name: string;
  address: string;
  phone: string;
  start_time: string;
  end_time: string;
  slot_duration: number;
  business_days: string;
  business_hours: { endTime: string; startTime: string; daysOfWeek: number[] }[] | null;
  lunch_enabled: boolean;
  lunch_start_time: string | null;
  lunch_end_time: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface ITService {
  id: number;
  name: string;
  type: string | null;
}

export interface ITDentist {
  id: number;
  firstname: string;
  lastname: string;
  title: string | null;
  intro: string | null;
  avatar: string | null;
}

export interface ITSlot {
  start: string; // "2026-05-19 09:00:00"
  end: string;   // "2026-05-19 09:20:00"
}

export interface ITBookingResult {
  booking_reference: string;
  status: number;
  date: string;
  end_date: string;
  service: string;
  dentist: string;
  branch: string;
  is_valid: boolean;
}

export interface ITBookingRequest {
  branch_id: number;
  service_id: number;
  dentist_id?: number;
  date: string; // "Y-m-d H:i"
  // Booking end for services longer than the branch slot_duration. iDoctor
  // blocks the whole [date, end_date) window under one appointment, so no
  // ghost placeholder bookings are needed. Omit for single-slot services.
  end_date?: string; // "Y-m-d H:i"
  customer_name: string;
  customer_phone: string;
  note?: string;
  // Forward-compat: iDoctor currently ignores this field and sets is_valid
  // based on the clinic's prepayment config (verified 2026-06-16). Kept on
  // the request so the day iDoctor honors it, our payment-confirmed flow
  // auto-marks bookings valid without a code change. To flip the response
  // today, contact IT Doctor support to disable the prepayment requirement.
  is_valid?: boolean;
}

// ---------- Endpoints ----------

export async function getBranches(): Promise<ITBranch[]> {
  return apiFetch<ITBranch[]>("/branches");
}

export async function getServices(): Promise<ITService[]> {
  return apiFetch<ITService[]>("/services");
}

export async function getDentists(branchId?: number): Promise<ITDentist[]> {
  const qs = branchId ? `?branch_id=${branchId}` : "";
  return apiFetch<ITDentist[]>(`/dentists${qs}`);
}

export async function getSlots(
  dentistId: number,
  date: string,
  branchId: number,
): Promise<ITSlot[]> {
  return apiFetch<ITSlot[]>(
    `/dentists/${dentistId}/slots?date=${date}&branch_id=${branchId}`,
  );
}

export async function createBooking(
  req: ITBookingRequest,
): Promise<ITBookingResult> {
  return apiFetch<ITBookingResult>("/bookings", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function getBooking(ref: string): Promise<ITBookingResult> {
  return apiFetch<ITBookingResult>(`/bookings/${encodeURIComponent(ref)}`);
}

export async function cancelBooking(ref: string): Promise<ITBookingResult> {
  return apiFetch<ITBookingResult>(`/bookings/${encodeURIComponent(ref)}`, {
    method: "DELETE",
  });
}

/**
 * Format a local "YYYY-MM-DD HH:MM" string `addMinutes` minutes later.
 * iDoctor uses clinic-local time without timezone in both the booking
 * `date` parameter and the slot responses, so we mirror that.
 */
function addMinutesToLocalDateString(
  dateStr: string,
  addMinutes: number,
): string {
  // Treat as UTC for arithmetic — output is reformatted back to "YYYY-MM-DD HH:MM"
  // so timezone drift never enters the equation.
  const ts = Date.parse(dateStr.replace(" ", "T") + "Z");
  const next = new Date(ts + addMinutes * 60_000);
  const y = next.getUTCFullYear();
  const mo = String(next.getUTCMonth() + 1).padStart(2, "0");
  const d = String(next.getUTCDate()).padStart(2, "0");
  const hh = String(next.getUTCHours()).padStart(2, "0");
  const mm = String(next.getUTCMinutes()).padStart(2, "0");
  return `${y}-${mo}-${d} ${hh}:${mm}`;
}

/**
 * Create a single iDoctor booking, sizing it to `durationMin` via `end_date`.
 *
 * iDoctor's slot grid is `branch.slot_duration` (typically 20 min), but a
 * booking may span multiple cells: passing `end_date` blocks the whole
 * [date, end_date) window under ONE appointment. For services no longer than
 * one slot (or with no duration set) we omit `end_date` and let iDoctor use
 * its default single-cell length.
 *
 * This replaces the former "ghost chain" of placeholder bookings — one
 * appointment now covers the full window, so there is nothing to roll back
 * and nothing extra to cancel later.
 */
export async function createTimedBooking(
  req: ITBookingRequest,
  opts: { durationMin: number | null | undefined },
): Promise<ITBookingResult> {
  const durationMin = opts.durationMin ?? 0;
  if (durationMin <= 0) {
    return createBooking(req);
  }
  return createBooking({
    ...req,
    end_date: addMinutesToLocalDateString(req.date, durationMin),
  });
}

/**
 * Resolve which iDoctor branch a dentist belongs to.
 *
 * The `/dentists` payload doesn't carry `branch_id`, but `/dentists?branch_id=N`
 * filters by branch — so we ask each branch which dentists it has and pick the
 * first branch that contains the dentist. Returns `branches[0].id` as a
 * fallback so the caller never has to handle "no match" specially. If a
 * dentist is at multiple branches, the first match wins.
 */
export async function resolveDentistBranch(dentistId: number): Promise<number> {
  const branches = await getBranches();
  if (branches.length === 0) return 1;
  for (const b of branches) {
    try {
      const dentists = await getDentists(b.id);
      if (dentists.some((d) => d.id === dentistId)) return b.id;
    } catch {
      // Skip this branch and keep looking
    }
  }
  return branches[0].id;
}
