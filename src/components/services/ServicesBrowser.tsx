"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, SearchX } from "lucide-react";
import { ServiceCard, type ServiceCardItem } from "./ServiceCard";
import { FeaturedServiceCard } from "./FeaturedServiceCard";

export type CategoryOption = {
  value: string;
  label: string;
};

type Props = {
  items: ServiceCardItem[];
  lang: string;
  categories: CategoryOption[];
  labels: {
    searchPlaceholder: string;
    searchClear: string;
    filterAll: string;
    featuredLabel: string;
    viewDetails: string;
    emptyTitle: string;
    emptyDescription: string;
  };
};

export function ServicesBrowser({ items, lang, categories, labels }: Props) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("__all__");
  const gridRef = useRef<HTMLDivElement | null>(null);

  // Debounce the search input
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim()), 120);
    return () => window.clearTimeout(t);
  }, [query]);

  // Reveal-on-intersect for cards (runs once)
  useEffect(() => {
    const root = gridRef.current;
    if (!root) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      root.querySelectorAll<HTMLElement>(".reveal").forEach((el) => {
        el.classList.add("reveal-in");
      });
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-in");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    root.querySelectorAll<HTMLElement>(".reveal").forEach((el) => {
      observer.observe(el);
    });
    return () => observer.disconnect();
  });

  const filtered = useMemo(() => {
    const q = debouncedQuery.toLocaleLowerCase();
    return items.filter((it) => {
      const matchesCategory =
        activeCategory === "__all__" ||
        (it.category ?? "").toLocaleLowerCase() ===
          activeCategory.toLocaleLowerCase();
      if (!matchesCategory) return false;
      if (!q) return true;
      const hay = `${it.title} ${it.description ?? ""}`.toLocaleLowerCase();
      return hay.includes(q);
    });
  }, [items, debouncedQuery, activeCategory]);

  const featured: ServiceCardItem[] = [];
  const regular: ServiceCardItem[] = [];
  for (const it of filtered) {
    if (featured.length < 1 && it.isFeatured) featured.push(it);
    else regular.push(it);
  }

  const showFilters = items.length > 3;

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      {showFilters && (
        <div className="sticky top-16 z-10 -mx-2 mb-8 flex flex-col gap-3 rounded-2xl bg-bg/80 px-2 py-3 backdrop-blur-md sm:top-20 sm:mx-0 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:rounded-3xl sm:px-4">
          <div className="flex min-w-0 flex-1 -mx-2 overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ul className="flex shrink-0 items-center gap-2 snap-x">
              <li>
                <CategoryChip
                  active={activeCategory === "__all__"}
                  onClick={() => setActiveCategory("__all__")}
                  label={labels.filterAll}
                />
              </li>
              {categories.map((c) => (
                <li key={c.value}>
                  <CategoryChip
                    active={
                      activeCategory.toLocaleLowerCase() ===
                      c.value.toLocaleLowerCase()
                    }
                    onClick={() => setActiveCategory(c.value)}
                    label={c.label}
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2"
              strokeWidth={2.25}
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setQuery("");
              }}
              placeholder={labels.searchPlaceholder}
              aria-label={labels.searchPlaceholder}
              className="h-11 w-full rounded-full border border-line bg-surface pl-10 pr-10 text-[14px] text-ink placeholder:text-muted-2 transition-colors hover:border-line-strong focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label={labels.searchClear}
                className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-ink transition-colors"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      )}

      <div ref={gridRef}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-surface/50 px-6 py-16 text-center">
            <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-primary-ink">
              <SearchX className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <h3 className="font-display text-[18px] font-bold text-ink">
              {labels.emptyTitle}
            </h3>
            <p className="mt-1 max-w-sm text-[13px] leading-6 text-muted">
              {labels.emptyDescription}
            </p>
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((item, i) => (
              <li key={item.id} className="sm:col-span-2 lg:col-span-2">
                <FeaturedServiceCard
                  item={item}
                  lang={lang}
                  viewLabel={labels.viewDetails}
                  featuredLabel={labels.featuredLabel}
                  index={i}
                />
              </li>
            ))}
            {regular.map((item, i) => (
              <li key={item.id}>
                <ServiceCard
                  item={item}
                  lang={lang}
                  viewLabel={labels.viewDetails}
                  index={featured.length + i}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function CategoryChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "snap-start whitespace-nowrap rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors " +
        (active
          ? "border-primary bg-primary text-white shadow-sm"
          : "border-line bg-surface text-ink hover:border-line-strong hover:bg-surface-2")
      }
    >
      {label}
    </button>
  );
}
