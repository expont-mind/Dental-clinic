"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SearchX } from "lucide-react";
import type { ServiceCardItem } from "./ServiceCard";
import { FeaturedServiceCard } from "./FeaturedServiceCard";
import { CatalogSection } from "./CatalogSection";
import { SmartFindBar } from "./SmartFindBar";
import {
  INTENT_TAGS,
  type IntentKey,
  type IntentTag,
} from "@/lib/services/intent-tags";

export type CatalogGroup = {
  parentSlug: string;
  parentTitle: string;
  description: string | null;
  items: ServiceCardItem[];
};

type Props = {
  groups: CatalogGroup[];
  featured: ServiceCardItem[];
  lang: "mn" | "en";
  labels: {
    searchPlaceholder: string;
    searchClear: string;
    intentLabel: string;
    featuredEyebrow: string;
    featuredLabel: string;
    viewDetails: string;
    seeAll: string;
    emptyTitle: string;
    emptyDescription: string;
    resetFilters: string;
  };
};

export function ServicesBrowser({
  groups,
  featured,
  lang,
  labels,
}: Props) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeIntent, setActiveIntent] = useState<IntentKey | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Debounce search
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim()), 120);
    return () => window.clearTimeout(t);
  }, [query]);

  // Reveal-on-intersect: each section's cards fade in once
  useEffect(() => {
    const root = rootRef.current;
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

  // Filter groups by active intent + search
  const activeIntentTag: IntentTag | null = useMemo(() => {
    if (!activeIntent) return null;
    return INTENT_TAGS.find((t) => t.key === activeIntent) ?? null;
  }, [activeIntent]);

  const filteredGroups = useMemo(() => {
    const q = debouncedQuery.toLocaleLowerCase();
    const slugFilter = activeIntentTag
      ? new Set(activeIntentTag.parentSlugs)
      : null;

    return groups
      .filter((g) => !slugFilter || slugFilter.has(g.parentSlug))
      .map((g) => {
        if (!q) return g;
        const items = g.items.filter((it) => {
          const hay = `${it.title} ${it.description ?? ""}`.toLocaleLowerCase();
          return hay.includes(q);
        });
        return { ...g, items };
      })
      .filter((g) => g.items.length > 0);
  }, [groups, debouncedQuery, activeIntentTag]);

  const totalVisible = filteredGroups.reduce(
    (n, g) => n + g.items.length,
    0,
  );

  const showFeatured = featured.length > 0 && !activeIntent && !debouncedQuery;
  const isFiltered = Boolean(activeIntent || debouncedQuery);

  return (
    <div ref={rootRef}>
      <SmartFindBar
        intents={INTENT_TAGS}
        lang={lang}
        query={query}
        onQueryChange={setQuery}
        activeIntent={activeIntent}
        onIntentChange={setActiveIntent}
        labels={{
          searchPlaceholder: labels.searchPlaceholder,
          searchClear: labels.searchClear,
          intentLabel: labels.intentLabel,
        }}
      />

      {showFeatured && (
        <section className="mx-auto max-w-7xl px-5 pt-10 sm:px-8 sm:pt-14">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            ✦ {labels.featuredEyebrow}
          </p>
          <div className="grid gap-6 sm:gap-8">
            {featured.map((item, idx) => (
              <FeaturedServiceCard
                key={item.id}
                item={item}
                lang={lang}
                viewLabel={labels.viewDetails}
                featuredLabel={labels.featuredLabel}
                index={idx}
              />
            ))}
          </div>
        </section>
      )}

      {totalVisible === 0 ? (
        <section className="mx-auto max-w-3xl px-5 pt-16 sm:px-8 sm:pt-20">
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
            {isFiltered && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setActiveIntent(null);
                }}
                className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-[12px] font-bold text-white hover:bg-primary-hover transition-colors"
              >
                {labels.resetFilters}
              </button>
            )}
          </div>
        </section>
      ) : (
        filteredGroups.map((g, i) => (
          <CatalogSection
            key={g.parentSlug}
            index={i}
            parentSlug={g.parentSlug}
            parentTitle={g.parentTitle}
            description={isFiltered ? null : g.description}
            items={g.items}
            lang={lang}
            viewLabel={labels.viewDetails}
            seeAllLabel={labels.seeAll}
          />
        ))
      )}
    </div>
  );
}

export type { ServiceCardItem };
