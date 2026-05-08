"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

// Pre-formatted on the server. The client never calls Intl APIs, so server
// and client render the exact same strings — no hydration mismatch even when
// the browser's ICU data differs from Node's.
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
  days: SlotDay[];
  confirmHrefPrefix: string;
  emptyLabel: string;
};

export function SlotPicker({ days, confirmHrefPrefix, emptyLabel }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<string>(days[0]?.key ?? "");

  if (days.length === 0) {
    return (
      <div className="mt-12 rounded-2xl border border-dashed border-line bg-surface/60 p-10 text-center">
        <p className="text-muted">{emptyLabel}</p>
      </div>
    );
  }

  const activeDay = days.find((d) => d.key === activeKey) ?? days[0];

  return (
    <div className="mt-10">
      {/* Date strip */}
      <div className="-mx-2 flex gap-2 overflow-x-auto px-2 pb-2 [scrollbar-width:thin]">
        {days.map((d) => {
          const active = d.key === activeDay.key;
          return (
            <button
              key={d.key}
              type="button"
              onClick={() => setActiveKey(d.key)}
              className={cn(
                "flex flex-shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl border px-4 py-3 text-center transition-all min-w-[78px]",
                active
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-surface text-ink-2 hover:border-line-strong",
              )}
            >
              <span
                className={cn(
                  "text-[11px] uppercase tracking-wider",
                  active ? "text-white/70" : "text-muted-2",
                )}
              >
                {d.weekday}
              </span>
              <span className="font-display text-xl font-medium leading-none">
                {d.day}
              </span>
              <span
                className={cn(
                  "text-[11px]",
                  active ? "text-white/70" : "text-muted",
                )}
              >
                {d.month}
              </span>
            </button>
          );
        })}
      </div>

      {/* Slots grid */}
      <div className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {activeDay.slots.map((s) => {
          const isPending = pending === s.id;
          return (
            <button
              key={s.id}
              type="button"
              disabled={s.is_booked || pending !== null}
              onClick={() => {
                setPending(s.id);
                router.push(
                  `${confirmHrefPrefix}?slot=${encodeURIComponent(s.id)}`,
                );
              }}
              className={cn(
                "h-12 rounded-xl border text-sm font-medium transition-all",
                s.is_booked &&
                  "cursor-not-allowed border-dashed border-line text-muted-2 line-through",
                !s.is_booked &&
                  !isPending &&
                  "border-line bg-surface text-ink hover:border-primary hover:bg-primary-soft hover:text-primary-ink",
                isPending && "border-primary bg-primary text-white",
                pending !== null && !isPending && "opacity-40",
              )}
            >
              {s.time}
            </button>
          );
        })}
      </div>
    </div>
  );
}
