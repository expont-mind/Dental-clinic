"use client";

import { useEffect, useState } from "react";

export type NavItem = {
  id: string;
  label: string;
};

export function ServicePageNav({ items }: { items: NavItem[] }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    if (items.length === 0) return;

    const observed: HTMLElement[] = [];
    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) observed.push(el);
    });
    if (observed.length === 0) return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.intersectionRatio);
          } else {
            visible.delete(entry.target.id);
          }
        }
        if (visible.size === 0) return;
        let best = "";
        let bestRatio = -1;
        for (const [id, ratio] of visible) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        }
        if (best) setActive(best);
      },
      {
        rootMargin: "-30% 0px -55% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );
    observed.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Section navigation"
      className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur-xl"
    >
      <div className="mx-auto -mx-px max-w-5xl overflow-x-auto px-5 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex shrink-0 items-center gap-1 py-1">
          {items.map((it) => {
            const isActive = active === it.id;
            return (
              <li key={it.id}>
                <a
                  href={`#${it.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(it.id);
                    if (!el) return;
                    const top =
                      el.getBoundingClientRect().top +
                      window.scrollY -
                      120;
                    window.scrollTo({ top, behavior: "smooth" });
                    setActive(it.id);
                  }}
                  className={
                    "relative inline-flex whitespace-nowrap px-3 py-3 text-[13px] font-semibold transition-colors " +
                    (isActive
                      ? "text-primary"
                      : "text-muted hover:text-ink")
                  }
                  aria-current={isActive ? "true" : undefined}
                >
                  {it.label}
                  <span
                    aria-hidden
                    className={
                      "absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-primary transition-opacity " +
                      (isActive ? "opacity-100" : "opacity-0")
                    }
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
