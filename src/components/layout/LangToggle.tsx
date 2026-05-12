"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LOCALES = ["mn", "en"] as const;
type Locale = (typeof LOCALES)[number];

const LABELS: Record<Locale, string> = {
  mn: "MONGOLIAN",
  en: "ENGLISH",
};

export function LangToggle({ current }: { current: string }) {
  const pathname = usePathname();
  const next: Locale = current === "en" ? "mn" : "en";

  function buildHref(target: Locale) {
    const segs = (pathname || "/").split("/").filter(Boolean);
    if (segs.length === 0) return `/${target}`;
    if (LOCALES.includes(segs[0] as Locale)) {
      segs[0] = target;
    } else {
      segs.unshift(target);
    }
    return "/" + segs.join("/");
  }

  return (
    <Link
      href={buildHref(next)}
      aria-label={`Switch to ${LABELS[next]}`}
      className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-white hover:bg-white/15 transition-colors"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
      {LABELS[current as Locale] ?? "ENGLISH"}
      <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
        <path
          d="M6 9l6 6 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
