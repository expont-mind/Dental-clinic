"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const LOCALES = ["mn", "en"] as const;
type Locale = (typeof LOCALES)[number];

export function LangToggle({ current }: { current: string }) {
  const pathname = usePathname();

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
    <div
      className="inline-flex items-center gap-0.5 rounded-full border border-line bg-surface p-0.5 text-xs font-medium"
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((loc) => {
        const active = loc === current;
        return (
          <Link
            key={loc}
            href={buildHref(loc)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "px-2.5 py-1 rounded-full uppercase tracking-wider transition-colors",
              active
                ? "bg-ink text-white"
                : "text-muted hover:text-ink",
            )}
          >
            {loc}
          </Link>
        );
      })}
    </div>
  );
}
