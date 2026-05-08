import type {
  Department,
  Doctor,
  DoctorWithDepartment,
  TimeSlot,
} from "@/lib/supabase/types";

// In-memory mirror of supabase/seed.sql so the site renders before the
// real DB is wired up. Swapped out automatically once env vars are set.

export const FALLBACK_DEPARTMENTS: Department[] = [
  {
    id: "dept-internal",
    slug: "internal",
    name_mn: "Дотрын тасаг",
    name_en: "Internal Medicine",
    description_mn: "Дотрын өвчний оношилгоо, эмчилгээ, урьдчилан сэргийлэх үзлэг.",
    description_en: "Diagnosis and care for adult internal medicine conditions.",
    icon_key: "stethoscope",
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "dept-pediatrics",
    slug: "pediatrics",
    name_mn: "Хүүхдийн тасаг",
    name_en: "Pediatrics",
    description_mn: "0–18 насны хүүхдийн эрүүл мэндийн үйлчилгээ.",
    description_en: "Care for infants, children and adolescents.",
    icon_key: "baby",
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: "dept-cardiology",
    slug: "cardiology",
    name_mn: "Зүрх судасны төв",
    name_en: "Cardiology",
    description_mn: "Зүрх судасны өвчний оношилгоо, ECG, эхо шинжилгээ.",
    description_en: "Heart and vascular care including ECG and echocardiography.",
    icon_key: "heart-pulse",
    sort_order: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: "dept-dermatology",
    slug: "dermatology",
    name_mn: "Арьс гоо засал",
    name_en: "Dermatology",
    description_mn: "Арьс, үс, хумсны өвчний эмчилгээ, гоо заслын үйлчилгээ.",
    description_en: "Skin, hair and nail care including aesthetic services.",
    icon_key: "sparkles",
    sort_order: 4,
    created_at: new Date().toISOString(),
  },
  {
    id: "dept-dental",
    slug: "dental",
    name_mn: "Шүдний эмнэлэг",
    name_en: "Dentistry",
    description_mn: "Шүдний цэвэрлэгээ, ломбо, гоо засал.",
    description_en: "Cleaning, restoration and cosmetic dental work.",
    icon_key: "tooth",
    sort_order: 5,
    created_at: new Date().toISOString(),
  },
];

const D = FALLBACK_DEPARTMENTS;

export const FALLBACK_DOCTORS: Doctor[] = [
  {
    id: "doc-tuvshintur",
    department_id: "dept-internal",
    slug: "b-tuvshintur",
    name_mn: "Б. Түвшинтөр",
    name_en: "B. Tuvshintur",
    title_mn: "Дотрын тасгийн эрхлэгч, MD",
    title_en: "Department Head, MD",
    bio_mn: "15 жил дотрын өвчний эмчилгээний туршлагатай. Зүрх, чихрийн шижин, бөөрний өвчний чиглэлээр.",
    bio_en: "15 years of internal medicine. Specialises in cardiometabolic and renal conditions.",
    photo_url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80&auto=format&fit=crop",
    years_exp: 15,
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "doc-oyuntsetseg",
    department_id: "dept-internal",
    slug: "g-oyuntsetseg",
    name_mn: "Г. Оюунцэцэг",
    name_en: "G. Oyuntsetseg",
    title_mn: "Дотрын эмч, MD",
    title_en: "Internal Medicine, MD",
    bio_mn: "Урьдчилан сэргийлэх үзлэг ба архаг өвчний удирдлага.",
    bio_en: "Preventive care and chronic disease management.",
    photo_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&q=80&auto=format&fit=crop",
    years_exp: 8,
    is_active: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: "doc-saruul",
    department_id: "dept-pediatrics",
    slug: "m-saruul",
    name_mn: "М. Саруул",
    name_en: "M. Saruul",
    title_mn: "Хүүхдийн эмч, MD",
    title_en: "Pediatrician, MD",
    bio_mn: "Нярай ба бага насны хүүхдийн эрүүл мэнд, дархлаажуулалт.",
    bio_en: "Newborn and early-childhood care, immunisation.",
    photo_url: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=600&q=80&auto=format&fit=crop",
    years_exp: 10,
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "doc-naranbat",
    department_id: "dept-pediatrics",
    slug: "d-naranbat",
    name_mn: "Д. Наранбат",
    name_en: "D. Naranbat",
    title_mn: "Хүүхдийн эмч",
    title_en: "Pediatrician",
    bio_mn: "Хүүхдийн амьсгалын замын өвчин, харшил.",
    bio_en: "Pediatric respiratory and allergy care.",
    photo_url: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&q=80&auto=format&fit=crop",
    years_exp: 6,
    is_active: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: "doc-batjargal",
    department_id: "dept-cardiology",
    slug: "s-batjargal",
    name_mn: "С. Батжаргал",
    name_en: "S. Batjargal",
    title_mn: "Зүрх судасны төвийн дарга, MD, PhD",
    title_en: "Cardiology Director, MD, PhD",
    bio_mn: "20 жилийн туршлагатай. Эхокардиографи ба катетерийн оношилгоо.",
    bio_en: "20 years experience. Echocardiography and interventional diagnostics.",
    photo_url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&q=80&auto=format&fit=crop",
    years_exp: 20,
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "doc-altantsetseg",
    department_id: "dept-cardiology",
    slug: "b-altantsetseg",
    name_mn: "Б. Алтанцэцэг",
    name_en: "B. Altantsetseg",
    title_mn: "Зүрхний эмч, MD",
    title_en: "Cardiologist, MD",
    bio_mn: "Артерийн даралт, зүрхний хэмнэлийн өөрчлөлт.",
    bio_en: "Hypertension and arrhythmia care.",
    photo_url: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600&q=80&auto=format&fit=crop",
    years_exp: 11,
    is_active: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: "doc-undral",
    department_id: "dept-dermatology",
    slug: "e-undral",
    name_mn: "Э. Үндрал",
    name_en: "E. Undral",
    title_mn: "Арьсны эмч, MD",
    title_en: "Dermatologist, MD",
    bio_mn: "Эмчилгээний дерматологи ба laser гоо засал.",
    bio_en: "Medical dermatology and laser aesthetics.",
    photo_url: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=600&q=80&auto=format&fit=crop",
    years_exp: 9,
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "doc-bayasgalan",
    department_id: "dept-dental",
    slug: "t-bayasgalan",
    name_mn: "Т. Баясгалан",
    name_en: "T. Bayasgalan",
    title_mn: "Шүдний их эмч",
    title_en: "Senior Dentist",
    bio_mn: "Гоо засал, имплант, ломбо.",
    bio_en: "Cosmetic dentistry, implants, restorative work.",
    photo_url: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=600&q=80&auto=format&fit=crop",
    years_exp: 12,
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "doc-enkhtuya",
    department_id: "dept-dental",
    slug: "p-enkhtuya",
    name_mn: "П. Энхтуяа",
    name_en: "P. Enkhtuya",
    title_mn: "Шүдний эмч",
    title_en: "Dentist",
    bio_mn: "Хүүхдийн шүдний эмчилгээ.",
    bio_en: "Pediatric dentistry.",
    photo_url: "https://images.unsplash.com/photo-1559839914-17aae19cec71?w=600&q=80&auto=format&fit=crop",
    years_exp: 7,
    is_active: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
];

export function fallbackDoctorsWithDepartment(): DoctorWithDepartment[] {
  return FALLBACK_DOCTORS.map((d) => {
    const dept = D.find((x) => x.id === d.department_id)!;
    return {
      ...d,
      department: {
        id: dept.id,
        slug: dept.slug,
        name_mn: dept.name_mn,
        name_en: dept.name_en,
      },
    };
  });
}

/** Generate fallback slots in-memory: weekdays 09:00–17:00 UB-time, 30min, next 14 days. */
export function generateFallbackSlots(doctorId: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const now = new Date();
  const tz = "Asia/Ulaanbaatar";
  // Use a date 1..14 days from today
  for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
    const day = new Date(now);
    day.setDate(day.getDate() + dayOffset);
    const dayKey = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(day);
    const dow = new Date(`${dayKey}T00:00:00+08:00`).getUTCDay();
    if (dow === 0 || dow === 6) continue; // skip Sun(0) and Sat(6)
    for (let h = 9; h < 17; h++) {
      for (const m of [0, 30]) {
        const hh = String(h).padStart(2, "0");
        const mm = String(m).padStart(2, "0");
        const startISO = `${dayKey}T${hh}:${mm}:00+08:00`;
        const startDate = new Date(startISO);
        const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);
        slots.push({
          id: `slot-${doctorId}-${dayKey}-${hh}${mm}`,
          doctor_id: doctorId,
          slot_start: startDate.toISOString(),
          slot_end: endDate.toISOString(),
          is_booked: false,
          created_at: new Date().toISOString(),
        });
      }
    }
  }
  return slots;
}
