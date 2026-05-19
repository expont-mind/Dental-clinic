"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";

type FaqItem = { q: string; a: string };

export function ServiceFaq({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const baseId = useId();
  if (items.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-[20px] bg-surface ring-1 ring-line">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        const headerId = `${baseId}-h-${i}`;
        const panelId = `${baseId}-p-${i}`;
        return (
          <div
            key={`${item.q}-${i}`}
            className={i > 0 ? "border-t border-line" : ""}
          >
            <h3>
              <button
                type="button"
                id={headerId}
                aria-controls={panelId}
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-primary-soft/30 sm:px-8"
              >
                <span className="font-display text-[15px] font-bold leading-snug tracking-tight text-ink sm:text-[16px]">
                  {item.q}
                </span>
                <span
                  className={
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition-transform duration-300 " +
                    (isOpen ? "rotate-45" : "")
                  }
                  aria-hidden
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              className="accordion-body"
              data-open={isOpen}
            >
              <div className="accordion-body-inner">
                <div className="px-6 pb-5 sm:px-8">
                  <p className="text-[14px] leading-7 text-muted">{item.a}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
