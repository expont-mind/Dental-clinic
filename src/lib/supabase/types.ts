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
  sort_order: number;
  created_at: string;
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
  is_active: boolean;
  sort_order: number;
  created_at: string;
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
