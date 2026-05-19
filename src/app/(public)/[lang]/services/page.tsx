import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import {
  listActiveServicesPublic,
  listChildServices,
} from "@/lib/queries/catalog";

const POPULAR_SLUGS = new Set(["general", "orthodontics", "implant"]);

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
        childCount: children.length,
        minPrice: prices.length > 0 ? Math.min(...prices) : null,
      };
    }),
  );

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
        <div className="relative mx-auto max-w-5xl px-5 py-20 text-center sm:px-8 sm:py-28">
          <p className="font-script text-[32px] leading-none text-primary sm:text-[42px]">
            {dict.brand.name}
          </p>
          <h1 className="mx-auto mt-3 max-w-3xl text-[32px] font-extrabold uppercase leading-[1.05] tracking-tight text-ink sm:text-[48px]">
            {dict.services.title}
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-[15px] leading-7 text-muted">
            {dict.services.lede}
          </p>
        </div>
      </section>

      {/* Service cards grid — image-forward */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {enriched.map((s) => {
            const title = isMn ? s.name_mn : s.name_en;
            const desc = isMn ? s.description_mn : s.description_en;
            const isPopular = POPULAR_SLUGS.has(s.slug);
            const priceLabel = s.price_text_mn
              ? isMn
                ? s.price_text_mn
                : s.price_text_en
              : s.minPrice
                ? `${(s.minPrice / 100).toLocaleString()}₮~`
                : null;
            const img = s.image_url || "/p4.jpg";

            return (
              <li key={s.id}>
                <Link
                  href={`/${lang}/services/${s.slug}`}
                  className="group block overflow-hidden rounded-[24px] bg-surface ring-1 ring-line transition-all hover:-translate-y-1 hover:ring-primary/40 hover:shadow-[0_20px_40px_-20px_rgba(26,132,120,0.25)]"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-primary-soft">
                    <Image
                      src={img}
                      alt={title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
                    />

                    {/* Badges — over image */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        {isPopular && (
                          <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                            {isMn ? "Түгээмэл" : "Popular"}
                          </span>
                        )}
                        {s.childCount > 0 && (
                          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-ink backdrop-blur">
                            {s.childCount} {isMn ? "үйлчилгээ" : "services"}
                          </span>
                        )}
                      </div>
                      {priceLabel && (
                        <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-white">
                          {priceLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 sm:p-6">
                    <h2 className="font-display text-[18px] font-bold leading-tight tracking-tight text-ink group-hover:text-primary transition-colors sm:text-[20px]">
                      {title}
                    </h2>
                    {desc && (
                      <p className="mt-2 text-[13px] leading-6 text-muted line-clamp-2">
                        {desc}
                      </p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold text-primary">
                      {dict.services.view_details}
                      <span className="transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* CTA band */}
      <section className="px-5 pb-5 sm:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-forest-grain px-8 py-12 text-center text-white sm:rounded-[40px] sm:px-12 sm:py-16">
          <p className="font-script text-[28px] leading-none text-primary sm:text-[36px]">
            {dict.brand.name}
          </p>
          <h2 className="mt-2 text-[26px] font-extrabold uppercase tracking-tight sm:text-[36px]">
            {dict.home.hero_schedule_btn}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[14px] leading-6 text-white/60">
            {isMn
              ? "Манай мэргэжилтэн эмч нартай уулзаж, таны инээмсэглэлийг хамтдаа төлөвлөе."
              : "Meet our specialists and plan your perfect smile together."}
          </p>
          <Link
            href={`/${lang}/book`}
            className="group mt-7 inline-flex items-center gap-3 rounded-full bg-primary py-2.5 pl-7 pr-3 text-[14px] font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            {dict.nav.book}
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-primary transition-transform group-hover:translate-x-0.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 17 17 7M9 7h8v8"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
