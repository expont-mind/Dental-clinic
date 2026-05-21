import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import { listFeaturedServicesPublic } from "@/lib/queries/catalog";
import type { Service } from "@/lib/supabase/types";

function priceLabel(s: Service, isMn: boolean, fromWord: string): string | null {
  const customText = isMn ? s.price_text_mn : s.price_text_en;
  if (customText) return customText;
  if (s.price_cents != null && s.price_cents > 0) {
    return `${fromWord} ${(s.price_cents / 100).toLocaleString()}₮`;
  }
  return null;
}

export default async function FeaturedPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const isMn = lang === "mn";

  const featured = await listFeaturedServicesPublic();

  return (
    <div className="bg-bg">
      <section className="bg-forest-grain text-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-primary sm:text-[11px]">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.25} />
              {dict.services.featured_eyebrow}
            </p>
            <p className="font-script mt-2 text-[22px] leading-none text-primary sm:text-[32px] lg:text-[42px]">
              {dict.brand.name}
            </p>
            <h1 className="font-display mt-2 text-[24px] font-extrabold uppercase leading-tight tracking-tight sm:text-[32px] lg:text-[44px]">
              {dict.services.featured_page_title}
            </h1>
            <p className="mt-4 text-[13.5px] leading-7 text-white/65 sm:mt-5 sm:text-[14.5px] lg:text-[15px]">
              {dict.services.featured_page_lede}
            </p>
          </div>

          {featured.length === 0 ? (
            <div className="mx-auto mt-12 max-w-md rounded-3xl border border-dashed border-white/15 bg-white/[0.04] px-6 py-12 text-center">
              <h2 className="font-display text-[18px] font-bold text-white">
                {dict.services.featured_empty_title}
              </h2>
              <p className="mt-2 text-[13px] leading-6 text-white/55">
                {dict.services.featured_empty_description}
              </p>
            </div>
          ) : (
            <ul className="mt-8 grid gap-4 sm:mt-12 sm:gap-6 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
              {featured.map((s) => {
                const title = isMn ? s.name_mn : s.name_en;
                const desc = isMn ? s.description_mn : s.description_en;
                const price = priceLabel(s, isMn, dict.services.from_price);
                const img = s.image_url || s.hero_image_url || "/p4.jpg";
                return (
                  <li key={s.id}>
                    <Link
                      href={`/${lang}/services/${s.slug}`}
                      className="group block h-full overflow-hidden rounded-[20px] bg-white/[0.04] ring-1 ring-white/10 transition-all hover:-translate-y-1 hover:ring-primary/40 hover:bg-white/[0.08] sm:rounded-[24px]"
                    >
                      <div className="relative aspect-[5/3] w-full overflow-hidden bg-white/5 sm:aspect-[4/5]">
                        <Image
                          src={img}
                          alt={title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                        <div
                          aria-hidden
                          className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"
                        />
                      </div>
                      <div className="p-4 sm:p-6">
                        <h2 className="font-display text-[17px] font-bold leading-tight tracking-tight text-white group-hover:text-primary transition-colors sm:text-[20px]">
                          {title}
                        </h2>
                        {desc && (
                          <p className="mt-1.5 line-clamp-2 text-[12px] leading-6 text-white/55 sm:mt-2 sm:text-[13px]">
                            {desc}
                          </p>
                        )}
                        <div className="mt-3 flex items-center justify-between gap-3 sm:mt-4">
                          {price ? (
                            <span className="font-display text-[14px] font-extrabold leading-none text-primary sm:text-[15px]">
                              {price}
                            </span>
                          ) : (
                            <span />
                          )}
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary sm:text-[12px]">
                            {dict.services.view_details}
                            <ArrowUpRight
                              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                              strokeWidth={2.5}
                            />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
