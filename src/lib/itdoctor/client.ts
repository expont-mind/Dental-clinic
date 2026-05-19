/**
 * IT Doctor API client for the Dentaris clinic booking system.
 * Docs: THIRD_PARTY_BOOKING_API_MN.md
 */

const API_URL = () => process.env.ITDOCTOR_API_URL!;
const API_TOKEN = () => process.env.ITDOCTOR_API_TOKEN!;

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
  customer_name: string;
  customer_phone: string;
  note?: string;
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
