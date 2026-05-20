import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import {
  listActiveServicesPublic,
  listChildServices,
} from "@/lib/queries/catalog";
import {
  ServicesBrowser,
  type CategoryOption,
} from "@/components/services/ServicesBrowser";
import type { ServiceCardItem } from "@/components/services/ServiceCard";

const FEATURED_SLUGS = new Set(["general", "orthodontics", "implant"]);

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const isMn = lang === "mn";

  const parents = await listActiveServicesPublic();

  const enriched = await Promise.all(
    parents.map(async (p) => {
      const children = await listChildServices(p.id);
      const prices = children
        .map((c) => c.price_cents)
        .filter((v): v is number => v != null && v > 0);
      return {
        ...p,
        minPrice: prices.length > 0 ? Math.min(...prices) : null,
      };
    }),
  );

  const items: ServiceCardItem[] = enriched.map((s) => {
    const title = isMn ? s.name_mn : s.name_en;
    const desc = isMn ? s.description_mn : s.description_en;
    const customPrice = isMn ? s.price_text_mn : s.price_text_en;
    const priceLabel = customPrice
      ? customPrice
      : s.minPrice
        ? `${dict.services.from_price} ${(s.minPrice / 100).toLocaleString()}₮`
        : null;
    return {
      id: s.id,
      slug: s.slug,
      title,
      description: desc,
      priceLabel,
      imageUrl: s.image_url || "/p4.jpg",
      category: s.category,
      isFeatured: FEATURED_SLUGS.has(s.slug),
    };
  });

  // Distinct, sorted categories — labelled by their own value (DB stores
  // human-readable category strings like "Cosmetic", "Orthodontics", etc.).
  const seen = new Map<string, string>();
  for (const it of items) {
    if (it.category && !seen.has(it.category.toLocaleLowerCase())) {
      seen.set(it.category.toLocaleLowerCase(), it.category);
    }
  }
  const categories: CategoryOption[] = Array.from(seen.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="bg-bg">
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

      {/* Filtering + grid (client) */}
      <ServicesBrowser
        items={items}
        lang={lang}
        categories={categories}
        labels={{
          searchPlaceholder: dict.services.search_placeholder,
          searchClear: dict.services.search_clear,
          filterAll: dict.services.filter_all,
          featuredLabel: dict.services.featured_label,
          viewDetails: dict.services.view_details,
          emptyTitle: dict.services.empty_title,
          emptyDescription: dict.services.empty_description,
        }}
      />

      {/* CTA band */}
      <section className="px-5 pb-5 sm:px-8">
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
