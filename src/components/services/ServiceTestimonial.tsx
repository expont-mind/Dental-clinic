"use client";

import { useState } from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";

type Testimonial = { quote: string; author: string; role?: string };

export function ServiceTestimonial({
  items,
  title,
  eyebrow,
}: {
  items: Testimonial[];
  title: string;
  eyebrow: string;
}) {
  const [index, setIndex] = useState(0);
  if (items.length === 0) return null;

  const safeIndex = Math.min(index, items.length - 1);
  const current = items[safeIndex];
  const multiple = items.length > 1;

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-[24px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-[30px]">
        {title}
      </h2>

      <figure className="mt-8 rounded-[24px] bg-white p-6 ring-1 ring-line/70 sm:p-10">
        <Quote
          className="h-8 w-8 text-primary/30"
          strokeWidth={2}
          aria-hidden
        />
        <blockquote className="mt-4 font-display text-[18px] leading-[1.6] text-ink-2 sm:text-[22px] sm:leading-[1.5]">
          &ldquo;{current.quote}&rdquo;
        </blockquote>
        <figcaption className="mt-6 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-ink">{current.author}</p>
            {current.role && (
              <p className="mt-0.5 text-[12px] text-muted">{current.role}</p>
            )}
          </div>
          {multiple && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setIndex((i) => (i - 1 + items.length) % items.length)
                }
                aria-label="Previous"
                className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted hover:border-primary hover:text-primary transition-colors"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
              </button>
              <span className="mx-1 text-[12px] font-semibold tabular-nums text-muted">
                {safeIndex + 1} / {items.length}
              </span>
              <button
                type="button"
                onClick={() => setIndex((i) => (i + 1) % items.length)}
                aria-label="Next"
                className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted hover:border-primary hover:text-primary transition-colors"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
              </button>
            </div>
          )}
        </figcaption>
      </figure>
    </div>
  );
}
