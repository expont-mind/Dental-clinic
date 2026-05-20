"use client";

import Image from "next/image";
import { useState } from "react";

type Slide = { src: string; alt: string };

type PdfCarouselProps = {
  slides: Slide[];
  aspectClass?: string;
  maxWidthClass?: string;
  fit?: "contain" | "cover";
  sizes?: string;
};

export function PdfCarousel({
  slides,
  aspectClass = "aspect-5/7",
  maxWidthClass = "max-w-md",
  fit = "contain",
  sizes = "(max-width: 1024px) 90vw, 420px",
}: PdfCarouselProps) {
  const [index, setIndex] = useState(0);
  const total = slides.length;
  const goPrev = () => setIndex((i) => (i - 1 + total) % total);
  const goNext = () => setIndex((i) => (i + 1) % total);

  return (
    <div className="relative">
      <div
        className={`relative mx-auto w-full overflow-hidden rounded-[24px] bg-surface-2 ring-1 ring-line shadow-sm ${aspectClass} ${maxWidthClass}`}
      >
        {slides.map((s, i) => (
          <Image
            key={s.src}
            src={s.src}
            alt={s.alt}
            fill
            priority={i === 0}
            sizes={sizes}
            className={
              (fit === "cover" ? "object-cover " : "object-contain ") +
              "transition-opacity duration-500 " +
              (i === index ? "opacity-100" : "pointer-events-none opacity-0")
            }
          />
        ))}

        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous"
          className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-md ring-1 ring-line backdrop-blur transition-colors hover:bg-white hover:text-primary"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 6l-6 6 6 6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={goNext}
          aria-label="Next"
          className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-md ring-1 ring-line backdrop-blur transition-colors hover:bg-white hover:text-primary"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {slides.map((s, i) => (
          <button
            key={s.src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Slide ${i + 1}`}
            aria-current={i === index}
            className={
              "h-2 rounded-full transition-all " +
              (i === index ? "w-8 bg-primary" : "w-2 bg-line hover:bg-primary/40")
            }
          />
        ))}
      </div>
    </div>
  );
}
