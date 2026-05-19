// Manually authored DB types. Replace with `supabase gen types typescript`
// output once you have the Supabase CLI linked to your project.

export type AppointmentStatus = "confirmed" | "completed" | "cancelled";

export interface Department {
  id: string;
  slug: string;
  name_mn: string;
  name_en: string;
  description_mn: string | null;
  description_en: string | null;
  icon_key: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: string;
  department_id: string;
  slug: string;
  name_mn: string;
  name_en: string;
  title_mn: string | null;
  title_en: string | null;
  bio_mn: string | null;
  bio_en: string | null;
  photo_url: string | null;
  years_exp: number | null;
  itdoctor_dentist_id: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DoctorWithDepartment extends Doctor {
  department: Pick<Department, "id" | "slug" | "name_mn" | "name_en">;
}

export interface TimeSlot {
  id: string;
  doctor_id: string;
  slot_start: string;
  slot_end: string;
  is_booked: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  time_slot_id: string;
  patient_name: string;
  patient_phone: string;
  patient_notes: string | null;
  status: AppointmentStatus;
  created_at: string;
}

export interface BookSlotResult {
  appointment_id: string;
  slot_start: string;
  slot_end: string;
  doctor_id: string;
}

export type ServiceContentBlock = {
  treatments?: string[];
  benefits?: { title: string; body: string }[];
  faq?: { q: string; a: string }[];
  pricing?: { label: string; price: string; note?: string }[];
};

export interface Service {
  id: string;
  slug: string;
  department_id: string;
  name_mn: string;
  name_en: string;
  description_mn: string | null;
  description_en: string | null;
  category: string | null;
  price_cents: number | null;
  currency: string;
  duration_min: number | null;
  itdoctor_service_id: number | null;
  image_url: string | null;
  hero_image_url: string | null;
  icon_key: string | null;
  long_description_mn: string | null;
  long_description_en: string | null;
  duration_text_mn: string | null;
  duration_text_en: string | null;
  price_text_mn: string | null;
  price_text_en: string | null;
  parent_id: string | null;
  content_mn: ServiceContentBlock;
  content_en: ServiceContentBlock;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceWithDepartment extends Service {
  department: Pick<Department, "id" | "slug" | "name_mn" | "name_en">;
}

export type ClinicHours = {
  mon: string | null;
  tue: string | null;
  wed: string | null;
  thu: string | null;
  fri: string | null;
  sat: string | null;
  sun: string | null;
};

export interface Branch {
  id: string;
  slug: string;
  name_mn: string;
  name_en: string;
  address_mn: string | null;
  address_en: string | null;
  phone: string | null;
  hours: ClinicHours;
  timezone: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ClinicProfile {
  singleton: true;
  slug: string;
  name_mn: string;
  name_en: string;
  address_mn: string | null;
  address_en: string | null;
  phone: string | null;
  insurance_mn: string | null;
  insurance_en: string | null;
  timezone: string;
  hours: ClinicHours;
  booking_fee_cents: number;
  updated_at: string;
}

export type PendingBookingStatus = "pending" | "processing" | "paid" | "expired" | "failed";

export interface PendingBooking {
  id: string;
  invoice_id: string;
  amount_cents: number;
  branch_id: number;
  service_id: number;
  dentist_id: number | null;
  slot_datetime: string;
  customer_name: string;
  customer_phone: string;
  service_name: string | null;
  dept_slug: string | null;
  note: string | null;
  lang: string;
  status: PendingBookingStatus;
  booking_reference: string | null;
  booking_result: Record<string, unknown> | null;
  created_at: string;
  expires_at: string;
  paid_at: string | null;
  updated_at: string;
}
