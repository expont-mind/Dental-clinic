"use client";

import Image from "next/image";
import { useState } from "react";

const SLIDES = [
  { src: "/uilchilgee-1.png", alt: "Үйлчилгээ 1" },
  { src: "/uilchilgee-2.png", alt: "Үйлчилгээ 2" },
];

export function ServicesCarousel() {
  const [active, setActive] = useState(0);
  const total = SLIDES.length;

  function prev() {
    setActive((i) => (i - 1 + total) % total);
  }
  function next() {
    setActive((i) => (i + 1) % total);
  }

  return (
    <div className="relative">
      <div className="relative aspect-4/5 w-full">
        {SLIDES.map((s, i) => (
          <Image
            key={s.src}
            src={s.src}
            alt={s.alt}
            fill
            sizes="(max-width: 1024px) 90vw, 520px"
            className={`object-contain transition-opacity duration-500 ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
            priority={i === 0}
          />
        ))}

        {/* Prev/Next buttons */}
        <button
          type="button"
          aria-label="Previous"
          onClick={prev}
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white text-ink shadow-md ring-1 ring-line hover:bg-primary-soft transition-colors"
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
          aria-label="Next"
          onClick={next}
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white text-ink shadow-md ring-1 ring-line hover:bg-primary-soft transition-colors"
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

        {/* Pagination dots */}
        <div className="absolute -bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-6 bg-primary" : "w-1.5 bg-line"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
