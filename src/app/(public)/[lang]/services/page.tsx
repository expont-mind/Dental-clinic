import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import { listServicesByParentTree } from "@/lib/queries/catalog";
import {
  ServicesBrowser,
  type CatalogGroup,
} from "@/components/services/ServicesBrowser";
import type { ServiceCardItem } from "@/components/services/ServiceCard";
import { TrustBand } from "@/components/services/TrustBand";
import type { Service } from "@/lib/supabase/types";

function formatPrice(s: Service, isMn: boolean, fromWord: string): string | null {
  const customText = isMn ? s.price_text_mn : s.price_text_en;
  if (customText) return customText;
  if (s.price_cents != null && s.price_cents > 0) {
    return `${fromWord} ${(s.price_cents / 100).toLocaleString()}₮`;
  }
  return null;
}

function toCardItem(
  s: Service,
  isMn: boolean,
  fromWord: string,
): ServiceCardItem {
  return {
    id: s.id,
    slug: s.slug,
    title: isMn ? s.name_mn : s.name_en,
    description: isMn ? s.description_mn : s.description_en,
    priceLabel: formatPrice(s, isMn, fromWord),
    imageUrl: s.image_url || s.hero_image_url || "/p4.jpg",
    isFeatured: s.is_featured,
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const isMn = lang === "mn";
  const fromWord = dict.services.from_price;

  const tree = await listServicesByParentTree();

  // Build one group per parent. If a parent has children, the section shows
  // its children (the catalog mirror). If it has no children, the section
  // shows the parent itself as the only card so it isn't orphaned.
  const groups: CatalogGroup[] = tree
    .map(({ parent, children }) => {
      const items =
        children.length > 0
          ? children.map((c) => toCardItem(c, isMn, fromWord))
          : [toCardItem(parent, isMn, fromWord)];
      // Inherit cheapest child price for the parent card when needed.
      if (children.length > 0 && parent.price_cents == null) {
        const cheapestKid = children
          .map((c) => c.price_cents)
          .filter((v): v is number => v != null && v > 0)
          .sort((a, b) => a - b)[0];
        if (cheapestKid && items.length > 0 && !items[0].priceLabel) {
          // best-effort min-price fallback for groups whose children all
          // have prices but the parent itself was missing one.
          items[0] = {
            ...items[0],
            priceLabel: `${fromWord} ${(cheapestKid / 100).toLocaleString()}₮`,
          };
        }
      }
      return {
        parentSlug: parent.slug,
        parentTitle: isMn ? parent.name_mn : parent.name_en,
        description: isMn ? parent.description_mn : parent.description_en,
        items,
      };
    })
    .filter((g) => g.items.length > 0);

  // Pick a single featured service from across all groups. Prefer one
  // explicitly tagged is_featured; fall back to first item of first group.
  let featured: ServiceCardItem | null = null;
  for (const g of groups) {
    const hit = g.items.find((it) => it.isFeatured);
    if (hit) {
      featured = hit;
      break;
    }
  }

  return (
    <div className="bg-bg pb-2">
      {/* Hero — warm, inviting */}
      <section className="relative overflow-hidden bg-[#f6f2ec]">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-accent/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-5xl px-5 py-12 text-center sm:px-8 sm:py-20 lg:py-28">
          <p className="font-script text-[22px] leading-none text-primary sm:text-[32px] lg:text-[42px]">
            {dict.brand.name}
          </p>
          <h1 className="font-display mx-auto mt-3 max-w-3xl text-[24px] font-extrabold uppercase leading-[1.1] tracking-tight text-ink sm:text-[34px] lg:text-[48px]">
            {dict.services.title}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[13.5px] leading-7 text-muted sm:mt-5 sm:text-[14.5px] lg:text-[15px]">
            {dict.services.lede}
          </p>
        </div>
      </section>

      {/* Find hub: chips + search + featured + catalog sections */}
      <ServicesBrowser
        groups={groups}
        featured={featured}
        lang={isMn ? "mn" : "en"}
        labels={{
          searchPlaceholder: dict.services.search_placeholder,
          searchClear: dict.services.search_clear,
          intentLabel: dict.services.intent_label,
          featuredEyebrow: dict.services.featured_eyebrow,
          featuredLabel: dict.services.featured_label,
          viewDetails: dict.services.view_details,
          seeAll: dict.services.see_all,
          emptyTitle: dict.services.empty_title,
          emptyDescription: dict.services.empty_description,
          resetFilters: dict.services.reset_filters,
        }}
      />

      {/* Trust band */}
      <TrustBand
        eyebrow={dict.services.trust_eyebrow}
        stats={[
          { value: "25+", label: dict.services.trust_years },
          { value: "12K+", label: dict.services.trust_patients },
          { value: "9+", label: dict.services.trust_doctors },
          { value: "3", label: dict.services.trust_branches },
        ]}
      />

      {/* Final CTA band */}
      <section className="mt-16 px-5 pb-5 sm:px-8 sm:mt-20">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[20px] bg-forest-grain px-6 py-8 text-center text-white sm:rounded-[28px] sm:px-10 sm:py-12 lg:rounded-[40px] lg:px-12 lg:py-16">
          <p className="font-script text-[20px] leading-none text-primary sm:text-[28px] lg:text-[36px]">
            {dict.brand.name}
          </p>
          <h2 className="font-display mt-2 text-[20px] font-extrabold uppercase tracking-tight sm:text-[26px] lg:text-[36px]">
            {dict.home.hero_schedule_btn}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[12.5px] leading-6 text-white/60 sm:text-[14px]">
            {isMn
              ? "Манай мэргэжилтэн эмч нартай уулзаж, таны инээмсэглэлийг хамтдаа төлөвлөе."
              : "Meet our specialists and plan your perfect smile together."}
          </p>
          <Link
            href={`/${lang}/book`}
            className="group mt-5 inline-flex items-center gap-2 rounded-full bg-primary py-2 pl-5 pr-2 text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors sm:mt-7 sm:gap-3 sm:py-2.5 sm:pl-7 sm:pr-3 sm:text-[14px]"
          >
            {dict.nav.book}
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-primary transition-transform group-hover:translate-x-0.5 sm:h-9 sm:w-9">
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
