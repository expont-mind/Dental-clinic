import { cache } from "react";
import { createSupabaseServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/auth";
import type { ClinicHours, ClinicProfile } from "@/lib/supabase/types";

export type SocialKind = "facebook" | "instagram" | "youtube";

/** Public-facing contact details, already localized. Null = not set in admin. */
export interface ClinicContact {
  phone: string | null;
  phoneHref: string | null;
  email: string | null;
  address: string | null;
  hours: string | null;
  socials: { kind: SocialKind; url: string }[];
}

const EMPTY: ClinicContact = {
  phone: null,
  phoneHref: null,
  email: null,
  address: null,
  hours: null,
  socials: [],
};

const DAYS: (keyof ClinicHours)[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const DAY_LABELS: Record<string, Record<keyof ClinicHours, string>> = {
  mn: { mon: "Даваа", tue: "Мягмар", wed: "Лхагва", thu: "Пүрэв", fri: "Баасан", sat: "Бямба", sun: "Ням" },
  en: { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" },
};

/** Collapse runs of days with identical hours: "Даваа–Баасан: 09:00 – 19:00". */
function formatHours(hours: ClinicHours, lang: string): string | null {
  const labels = DAY_LABELS[lang] ?? DAY_LABELS.en;
  const closed = lang === "mn" ? "амарна" : "closed";
  const lines: string[] = [];
  let start = 0;
  for (let i = 1; i <= DAYS.length; i++) {
    if (i < DAYS.length && hours[DAYS[i]] === hours[DAYS[start]]) continue;
    const range = hours[DAYS[start]];
    const days =
      i - 1 === start
        ? labels[DAYS[start]]
        : `${labels[DAYS[start]]}–${labels[DAYS[i - 1]]}`;
    lines.push(`${days}: ${range ? range.replace("-", " – ") : closed}`);
    start = i;
  }
  return DAYS.some((d) => hours[d]) ? lines.join("\n") : null;
}

/**
 * Contact details for the public site, from the clinic_profile row edited at
 * /admin/clinic. Wrapped in React cache so the layout footer and the page share
 * one query per request. Errors degrade to "nothing set" rather than taking
 * down every page that renders the footer.
 */
export const getClinicContact = cache(
  async (lang: string): Promise<ClinicContact> => {
    if (!isSupabaseConfigured()) return EMPTY;
    const supabase = await createSupabaseServer();
    // select("*") so the site keeps rendering before 32_clinic_profile_contact.sql
    // is applied — missing columns just come back undefined.
    const { data, error } = await supabase
      .from("clinic_profile")
      .select("*")
      .maybeSingle();
    if (error) {
      console.error("[clinic] contact read failed:", error.message);
      return EMPTY;
    }
    if (!data) return EMPTY;
    const p = data as Partial<ClinicProfile>;

    const socials: ClinicContact["socials"] = [];
    if (p.facebook_url) socials.push({ kind: "facebook", url: p.facebook_url });
    if (p.instagram_url) socials.push({ kind: "instagram", url: p.instagram_url });
    if (p.youtube_url) socials.push({ kind: "youtube", url: p.youtube_url });

    return {
      phone: p.phone || null,
      phoneHref: p.phone ? `tel:${p.phone.replace(/[\s-]/g, "")}` : null,
      email: p.email || null,
      address: (lang === "mn" ? p.address_mn : p.address_en || p.address_mn) || null,
      hours: p.hours ? formatHours(p.hours, lang) : null,
      socials,
    };
  },
);
