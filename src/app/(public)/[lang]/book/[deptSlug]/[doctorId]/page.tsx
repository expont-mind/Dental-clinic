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
      {/* Hero + step bar — unified block */}
      <section className="relative overflow-hidden bg-primary-soft">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-primary/30 blur-3xl"
        />

        <StepIndicator
          variant="onSoft"
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

        <div className="relative mx-auto max-w-3xl px-5 pt-10 pb-14 text-center sm:px-8 sm:pt-12 sm:pb-16">
          <Link
            href={`/${lang}/book/${deptSlug}`}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted hover:text-ink"
          >
            ← {dict.common.back}
          </Link>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            ◦ {deptName}
          </p>
          <h1 className="mt-2 text-[32px] font-extrabold uppercase leading-[1.05] tracking-tight text-ink sm:text-[44px]">
            {dict.booking.step_slot_title}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[14px] leading-7 text-muted sm:text-[15px]">
            {dict.booking.step_slot_lede}
          </p>
        </div>
      </section>

      {/* Doctor summary + slot picker */}
      <section className="mx-auto max-w-4xl px-5 pb-20 pt-10 sm:px-8 sm:pb-28 sm:pt-12">
        <div className="flex items-center gap-4 rounded-[20px] bg-surface p-4 ring-1 ring-line shadow-[0_8px_20px_-12px_rgba(26,132,120,0.18)]">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-primary-soft">
            {doctor.photo_url ? (
              <Image
                src={doctor.photo_url}
                alt={name}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-display text-2xl text-muted-2">
                {name.charAt(0)}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              {deptName}
            </p>
            <p className="font-display mt-0.5 truncate text-[18px] font-bold leading-tight text-ink">
              {name}
            </p>
            {title && (
              <p className="mt-0.5 truncate text-[12px] text-muted">{title}</p>
            )}
          </div>
        </div>

        <SlotPicker
          days={days}
          confirmHrefPrefix={`/${lang}/book/${deptSlug}/${doctorId}/confirm`}
          emptyLabel={dict.booking.no_slots}
        />
      </section>
    </>
  );
}
