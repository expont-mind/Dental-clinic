"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

/**
 * Sticky bottom CTA bar that appears on mobile when the
 * main stats card scrolls out of view.
 */
export function StickyBookCTA({
  href,
  label,
  price,
  sentinelId = "stats-card",
}: {
  href: string;
  label: string;
  price?: string | null;
  sentinelId?: string;
}) {
  const [visible, setVisible] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const el = document.getElementById(sentinelId);
    if (!el) return;

    observer.current = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.current.observe(el);

    return () => observer.current?.disconnect();
  }, [sentinelId]);

  return (
    <div
      className={
        "fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-white/95 px-4 py-3 backdrop-blur-xl transition-transform duration-300 lg:hidden " +
        (visible ? "translate-y-0" : "translate-y-full")
      }
    >
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        {price && (
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Үнэ
            </p>
            <p className="font-display text-[18px] font-extrabold text-primary">
              {price}
            </p>
          </div>
        )}
        <Link
          href={href}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[14px] font-bold text-white hover:bg-primary-hover transition-colors"
        >
          {label}
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
