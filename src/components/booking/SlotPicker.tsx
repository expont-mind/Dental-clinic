"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

export type SlotDay = {
  key: string;            // "YYYY-MM-DD" UB-local
  weekday: string;        // e.g. "Бя", "Sat"
  day: string;            // "08"
  month: string;          // "May", "5-р сар"
  slots: Array<{
    id: string;
    time: string;         // "09:00"
    is_booked: boolean;
  }>;
};

type Props = {
  /** IT Doctor dentist id (number) or Supabase doctor id (string) */
  dentistId: number;
  branchId: number;
  /** Service length in minutes — start cells without enough consecutive free
   * cells to fit this are hidden, so a long service can't land on a short gap. */
  durationMin?: number | null;
  serviceName?: string;
  serviceSlug?: string | null;
  confirmHrefPrefix: string;
  emptyLabel: string;
  lang: string;
};

function generateDateRange(count: number): { key: string; date: Date }[] {
  const dates: { key: string; date: Date }[] = [];
  const now = new Date();
  // Start from UB time
  const ubNow = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Ulaanbaatar" }),
  );
  for (let i = 0; i < count; i++) {
    const d = new Date(ubNow);
    d.setDate(d.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    dates.push({ key, date: d });
  }
  return dates;
}

// Hardcoded so the labels look identical on every browser regardless of
// whether the runtime ships Mongolian ICU locale data. Intl.DateTimeFormat
// with mn-MN silently falls back to en-US on browsers without Mongolian
// support, which produced the "dates look English on /mn" bug.

const WEEKDAYS_MN = ["Ня", "Да", "Мя", "Лх", "Пү", "Ба", "Бя"];
const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_MN = [
  "1-р сар",
  "2-р сар",
  "3-р сар",
  "4-р сар",
  "5-р сар",
  "6-р сар",
  "7-р сар",
  "8-р сар",
  "9-р сар",
  "10-р сар",
  "11-р сар",
  "12-р сар",
];
const MONTHS_EN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatWeekday(date: Date, lang: string): string {
  const arr = lang === "mn" ? WEEKDAYS_MN : WEEKDAYS_EN;
  return arr[date.getDay()];
}

function formatMonth(date: Date, lang: string): string {
  const arr = lang === "mn" ? MONTHS_MN : MONTHS_EN;
  return arr[date.getMonth()];
}

function formatDay(date: Date): string {
  return String(date.getDate()).padStart(2, "0");
}

export function SlotPicker({
  dentistId,
  branchId,
  durationMin,
  serviceName,
  serviceSlug,
  confirmHrefPrefix,
  emptyLabel,
  lang,
}: Props) {
  const router = useRouter();
  const [dates] = useState(() => generateDateRange(14));
  const [activeKey, setActiveKey] = useState(dates[0]?.key ?? "");
  const [slots, setSlots] = useState<
    Array<{ start: string; end: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  const fetchSlots = useCallback(
    async (date: string) => {
      setLoading(true);
      setSlots([]);
      try {
        const durationParam = durationMin && durationMin > 0 ? `&duration=${durationMin}` : "";
        const res = await fetch(
          `/api/booking/slots?dentist_id=${dentistId}&date=${date}&branch_id=${branchId}${durationParam}`,
        );
        if (res.ok) {
          const data = await res.json();
          setSlots(data.slots ?? []);
        }
      } finally {
        setLoading(false);
      }
    },
    [dentistId, branchId, durationMin],
  );

  useEffect(() => {
    if (activeKey) fetchSlots(activeKey);
  }, [activeKey, fetchSlots]);

  // Format slots for display
  const displaySlots = slots.map((s) => {
    const time = s.start.split(" ")[1]?.slice(0, 5) ?? s.start;
    // Encode slot info into the id for the confirm page
    const slotId = `${s.start}`;
    return { id: slotId, time, is_booked: false };
  });

  const activeDate = dates.find((d) => d.key === activeKey)?.date;
  const activeDateLabel = activeDate
    ? `${formatWeekday(activeDate, lang)} ${formatDay(activeDate)} ${formatMonth(activeDate, lang)}`
    : "";

  return (
    <div className="mt-8 sm:mt-10">
      {/* Date strip */}
      <div className="-mx-2 flex gap-2 overflow-x-auto px-2 pb-2 [scrollbar-width:thin]">
        {dates.map((d) => {
          const active = d.key === activeKey;
          return (
            <button
              key={d.key}
              type="button"
              aria-pressed={active}
              onClick={() => setActiveKey(d.key)}
              className={cn(
                "flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl border px-4 py-3 text-center transition-all min-w-[76px]",
                active
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-surface text-ink-2 hover:border-line-strong active:bg-surface-2",
              )}
            >
              <span
                className={cn(
                  "text-[11px] uppercase tracking-wider",
                  active ? "text-white/70" : "text-muted-2",
                )}
              >
                {formatWeekday(d.date, lang)}
              </span>
              <span className="font-display text-xl font-medium leading-none">
                {formatDay(d.date)}
              </span>
              <span
                className={cn(
                  "text-[11px]",
                  active ? "text-white/70" : "text-muted",
                )}
              >
                {formatMonth(d.date, lang)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div
          className="mt-8 grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6"
          aria-hidden
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-13 rounded-xl" />
          ))}
        </div>
      )}

      {/* No slots */}
      {!loading && displaySlots.length === 0 && (
        <EmptyState
          className="mt-8"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          }
          title={emptyLabel}
        />
      )}

      {/* Slots grid */}
      {!loading && displaySlots.length > 0 && (
        <div
          role="group"
          aria-label={activeDateLabel}
          className="mt-8 grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6"
        >
          {displaySlots.map((s) => {
            const isPending = pending === s.id;
            return (
              <button
                key={s.id}
                type="button"
                disabled={s.is_booked || pending !== null}
                aria-pressed={isPending}
                aria-label={`${activeDateLabel} ${s.time}`.trim()}
                onClick={() => {
                  setPending(s.id);
                  const svcParam = serviceName ? `&service_name=${encodeURIComponent(serviceName)}` : "";
                  const slugParam = serviceSlug
                    ? `&service=${encodeURIComponent(serviceSlug)}`
                    : "";
                  router.push(
                    `${confirmHrefPrefix}?slot=${encodeURIComponent(s.id)}&branch_id=${branchId}${svcParam}${slugParam}`,
                  );
                }}
                className={cn(
                  "h-13 rounded-xl border text-[15px] font-semibold transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  s.is_booked &&
                    "cursor-not-allowed border-dashed border-line text-muted-2 line-through",
                  !s.is_booked &&
                    !isPending &&
                    "border-line bg-surface text-ink hover:border-primary hover:bg-primary-soft hover:text-primary-ink active:scale-[0.97]",
                  isPending && "border-primary bg-primary text-white",
                  pending !== null && !isPending && "opacity-40",
                )}
              >
                {s.time}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
