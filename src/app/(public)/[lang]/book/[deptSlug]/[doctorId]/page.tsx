import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import {
  getDepartmentBySlug,
  getDoctorById,
  listAvailableSlots,
} from "@/lib/queries/catalog";
import { StepIndicator } from "@/components/booking/StepIndicator";
import { SlotPicker, type SlotDay } from "@/components/booking/SlotPicker";
import { ubDateKey, formatTime, formatWeekday } from "@/lib/utils/datetime";

export default async function BookPickSlotPage({
  params,
}: {
  params: Promise<{ lang: string; deptSlug: string; doctorId: string }>;
}) {
  const { lang, deptSlug, doctorId } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const [dept, doctor] = await Promise.all([
    getDepartmentBySlug(deptSlug),
    getDoctorById(doctorId),
  ]);
  if (!dept || !doctor) notFound();

  const slots = await listAvailableSlots(doctor.id);
  const name = lang === "mn" ? doctor.name_mn : doctor.name_en;
  const title = lang === "mn" ? doctor.title_mn : doctor.title_en;
  const deptName = lang === "mn" ? dept.name_mn : dept.name_en;

  // Server-side group + format. Client component receives plain strings,
  // dodging hydration mismatches when the browser's Intl data differs from Node's.
  const dayMap = new Map<string, SlotDay>();
  const monthFmt = new Intl.DateTimeFormat(
    lang === "mn" ? "mn-MN" : "en-US",
    { timeZone: "Asia/Ulaanbaatar", month: "short" },
  );
  const dayNumFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ulaanbaatar",
    day: "2-digit",
  });
  for (const s of slots) {
    const key = ubDateKey(s.slot_start);
    const date = new Date(s.slot_start);
    if (!dayMap.has(key)) {
      dayMap.set(key, {
        key,
        weekday: formatWeekday(date, lang as "mn" | "en"),
        day: dayNumFmt.format(date),
        month: monthFmt.format(date),
        slots: [],
      });
    }
    dayMap.get(key)!.slots.push({
      id: s.id,
      time: formatTime(s.slot_start, lang as "mn" | "en"),
      is_booked: s.is_booked,
    });
  }
  const days: SlotDay[] = [...dayMap.values()].sort((a, b) =>
    a.key < b.key ? -1 : 1,
  );

  return (
    <>
      <StepIndicator
        current={3}
        stepWord={dict.booking.step}
        ofWord={dict.booking.of}
        labels={[
          dict.nav.services,
          dict.nav.doctors,
          dict.booking.step_slot_title.replace(/[…—-].*$/, "").trim(),
          dict.booking.step_form_title.replace(/[…—-].*$/, "").trim(),
        ]}
      />
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <Link
          href={`/${lang}/book/${deptSlug}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
        >
          ← {dict.common.back}
        </Link>

        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-line bg-surface p-4">
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-surface-2">
            {doctor.photo_url ? (
              <Image
                src={doctor.photo_url}
                alt={name}
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-2">
              {deptName}
            </p>
            <p className="truncate font-display text-lg font-medium leading-tight">
              {name}
            </p>
            <p className="truncate text-xs text-muted">{title}</p>
          </div>
        </div>

        <header className="mt-10">
          <h1 className="font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
            {dict.booking.step_slot_title}
          </h1>
          <p className="mt-3 text-base text-muted">
            {dict.booking.step_slot_lede}
          </p>
        </header>

        <SlotPicker
          days={days}
          confirmHrefPrefix={`/${lang}/book/${deptSlug}/${doctorId}/confirm`}
          emptyLabel={dict.booking.no_slots}
        />
      </div>
    </>
  );
}
