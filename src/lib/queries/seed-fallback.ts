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
    id: "dept-general",
    slug: "general",
    name_mn: "Ерөнхий шүдний эмчилгээ",
    name_en: "General Dentistry",
    description_mn:
      "Шүдний цэвэрлэгээ, ломбо, үзлэг — гэр бүлийн шүдний үйлчилгээ.",
    description_en:
      "Cleaning, fillings and check-ups — everyday dental care for the whole family.",
    icon_key: "tooth",
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "dept-cosmetic",
    slug: "cosmetic",
    name_mn: "Гоо засал",
    name_en: "Cosmetic Dentistry",
    description_mn:
      "Шүд цайруулах, винир, инээмсэглэлийн дизайн.",
    description_en:
      "Whitening, veneers and full smile design.",
    icon_key: "sparkles",
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: "dept-orthodontics",
    slug: "orthodontics",
    name_mn: "Гажиг засал",
    name_en: "Orthodontics",
    description_mn:
      "Брэкэт, шууд биш системийн эмчилгээ — нүүр амны гажиг засал.",
    description_en:
      "Braces, clear aligners and bite correction.",
    icon_key: "align",
    sort_order: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: "dept-pediatric",
    slug: "pediatric",
    name_mn: "Хүүхдийн шүдний эмчилгээ",
    name_en: "Pediatric Dentistry",
    description_mn:
      "Хүүхдэд ээлтэй, тайван орчинд хийгддэг шүдний үйлчилгээ.",
    description_en:
      "Gentle, kid-friendly dental care from baby teeth onward.",
    icon_key: "baby",
    sort_order: 4,
    created_at: new Date().toISOString(),
  },
  {
    id: "dept-restorative",
    slug: "restorative",
    name_mn: "Имплант ба сэргээх эмчилгээ",
    name_en: "Implant & Restorative",
    description_mn:
      "Шүдний имплант, бүрээс, гүүр — сэргээх цогц шийдэл.",
    description_en:
      "Implants, crowns and bridges — full restorative solutions.",
    icon_key: "implant",
    sort_order: 5,
    created_at: new Date().toISOString(),
  },
];

const D = FALLBACK_DEPARTMENTS;

export const FALLBACK_DOCTORS: Doctor[] = [
  {
    id: "doc-narantsengel",
    department_id: "dept-orthodontics",
    slug: "b-narantsengel",
    name_mn: "Б. Наранцэнгэл",
    name_en: "B. Narantsengel",
    title_mn: "Анагаах ухааны докторант, Нүүр амны гажиг заслын их эмч",
    title_en: "PhD Candidate, Senior Orthodontist",
    bio_mn:
      "Нүүр амны гажиг заслын чиглэлээр оношилгоо, хяналт, урт хугацааны эмчилгээний төлөвлөгөө гарган ажилладаг, өвчтөн бүрийн инээмсэглэлийн онцлогт тулгуурлан нямбай ханддаг эмч.",
    bio_en:
      "Specialises in orthodontic diagnosis, monitoring and long-term treatment plans tailored to each patient's smile.",
    photo_url: "/p1.jpg",
    years_exp: 12,
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "doc-bayasgalan",
    department_id: "dept-cosmetic",
    slug: "t-bayasgalan",
    name_mn: "Т. Баясгалан",
    name_en: "T. Bayasgalan",
    title_mn: "Шүдний их эмч, Гоо заслын чиглэлээр мэргэшсэн",
    title_en: "Senior Dentist, Cosmetic Specialist",
    bio_mn:
      "Винир, шүд цайруулах, эстетик нөхөн сэргээлтийн чиглэлээр 12 жил ажилласан. Цоо шинэ инээмсэглэл бүтээх нь миний хайр.",
    bio_en:
      "12 years of experience in veneers, whitening and aesthetic restorations.",
    photo_url: "/p2.jpg",
    years_exp: 12,
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "doc-saruul",
    department_id: "dept-pediatric",
    slug: "m-saruul",
    name_mn: "М. Саруул",
    name_en: "M. Saruul",
    title_mn: "Хүүхдийн шүдний эмч",
    title_en: "Pediatric Dentist",
    bio_mn:
      "Хүүхдэд ээлтэй, тайван хандлагатай, эмчилгээний айдсыг арилгахад анхаардаг.",
    bio_en:
      "Calm, kid-friendly approach focused on building positive dental experiences.",
    photo_url: "/p3.jpg",
    years_exp: 8,
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "doc-tuvshintur",
    department_id: "dept-general",
    slug: "b-tuvshintur",
    name_mn: "Б. Түвшинтөр",
    name_en: "B. Tuvshintur",
    title_mn: "Ерөнхий шүдний их эмч",
    title_en: "General Dentist",
    bio_mn:
      "Ерөнхий шүдний эмчилгээ, цэвэрлэгээ, ломбо болон урьдчилан сэргийлэх үзлэгийн чиглэлээр 15 жил ажилласан.",
    bio_en:
      "15 years of cleanings, fillings and preventive dental care.",
    photo_url: "/p4.jpg",
    years_exp: 15,
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "doc-batjargal",
    department_id: "dept-restorative",
    slug: "s-batjargal",
    name_mn: "С. Батжаргал",
    name_en: "S. Batjargal",
    title_mn: "Имплантологи, нөхөн сэргээх эмчилгээний их эмч",
    title_en: "Implantologist, Restorative Specialist",
    bio_mn:
      "Шүдний имплант, бүрээс, гүүр зэрэг сэргээх цогц шийдэл — 20 жилийн туршлагатай.",
    bio_en:
      "20 years specializing in dental implants, crowns and bridges.",
    photo_url: "/p5.jpg",
    years_exp: 20,
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "doc-oyuntsetseg",
    department_id: "dept-general",
    slug: "g-oyuntsetseg",
    name_mn: "Г. Оюунцэцэг",
    name_en: "G. Oyuntsetseg",
    title_mn: "Шүдний эмч",
    title_en: "Dentist",
    bio_mn:
      "Урьдчилан сэргийлэх үзлэг, мэргэжлийн цэвэрлэгээ, сурталчилгаа.",
    bio_en:
      "Preventive care, professional cleanings and patient education.",
    photo_url: "/p6.jpg",
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
    if (dow === 0 || dow === 6) continue;
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
