"use client";

import { Search, X } from "lucide-react";
import type { IntentKey, IntentTag } from "@/lib/services/intent-tags";

type Props = {
  intents: IntentTag[];
  lang: "mn" | "en";
  query: string;
  onQueryChange: (next: string) => void;
  activeIntent: IntentKey | null;
  onIntentChange: (next: IntentKey | null) => void;
  labels: {
    searchPlaceholder: string;
    searchClear: string;
    intentLabel: string;
  };
};

export function SmartFindBar({
  intents,
  lang,
  query,
  onQueryChange,
  activeIntent,
  onIntentChange,
  labels,
}: Props) {
  return (
    <div className="mx-auto max-w-7xl px-5 pt-8 sm:px-8 sm:pt-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
            {labels.intentLabel}
          </p>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {intents.map((it) => {
              const active = activeIntent === it.key;
              return (
                <button
                  key={it.key}
                  type="button"
                  onClick={() => onIntentChange(active ? null : it.key)}
                  aria-pressed={active}
                  className={
                    "snap-start shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors " +
                    (active
                      ? "border-primary bg-primary text-white shadow-sm"
                      : "border-line bg-surface text-ink hover:border-line-strong hover:bg-primary-soft/40")
                  }
                >
                  {lang === "mn" ? it.mn : it.en}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative w-full sm:w-80">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2"
            strokeWidth={2.25}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                onQueryChange("");
                onIntentChange(null);
              }
            }}
            placeholder={labels.searchPlaceholder}
            aria-label={labels.searchPlaceholder}
            className="h-11 w-full rounded-full border border-line bg-surface pl-10 pr-10 text-[14px] text-ink placeholder:text-muted-2 transition-colors hover:border-line-strong focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label={labels.searchClear}
              className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-ink transition-colors"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
