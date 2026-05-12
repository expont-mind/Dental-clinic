import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import { getDepartmentBySlug } from "@/lib/queries/catalog";
import { getServiceDetail, SERVICE_DETAILS } from "@/lib/data/services";

export async function generateStaticParams() {
  const slugs = Object.keys(SERVICE_DETAILS);
  return slugs.flatMap((slug) => [
    { lang: "mn", slug },
    { lang: "en", slug },
  ]);
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const detail = getServiceDetail(slug);
  if (!detail) notFound();
  // Department lookup is optional — only used to display canonical name/description.
  // The page is fully usable from static SERVICE_DETAILS alone if the DB row is missing.
  const dept = await getDepartmentBySlug(slug).catch(() => null);

  const isMn = lang === "mn";

  // Fallback display name from SERVICE_CATALOG when no department row exists
  const fallbackName = isMn
    ? (
        ({
          general: "Ерөнхий шүдний эмчилгээ",
          cosmetic: "Гоо засал",
          orthodontics: "Гажиг засал",
          pediatric: "Хүүхдийн шүдний эмчилгээ",
          restorative: "Имплант ба сэргээх эмчилгээ",
        }) as Record<string, string>
      )[slug]
    : (
        ({
          general: "General Dentistry",
          cosmetic: "Cosmetic Dentistry",
          orthodontics: "Orthodontics",
          pediatric: "Pediatric Dentistry",
          restorative: "Implant & Restorative",
        }) as Record<string, string>
      )[slug];

  const name =
    (dept && (isMn ? dept.name_mn : dept.name_en)) ?? fallbackName ?? slug;
  const desc = dept ? (isMn ? dept.description_mn : dept.description_en) : null;
  const long = isMn ? detail.long_mn : detail.long_en;
  const treatments = isMn ? detail.treatments_mn : detail.treatments_en;
  const benefits = isMn ? detail.benefits_mn : detail.benefits_en;
  const faq = isMn ? detail.faq_mn : detail.faq_en;
  const duration = isMn ? detail.duration_mn : detail.duration_en;
  const price = isMn ? detail.price_from_mn : detail.price_from_en;
  const pricing = isMn ? detail.pricing_mn : detail.pricing_en;

  return (
    <div className="bg-bg">
      {/* Hero with image */}
      <section className="relative">
        <div className="relative h-[400px] w-full overflow-hidden sm:h-[480px]">
          <Image
            src={detail.hero_image}
            alt={name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/65"
          />
          <div className="relative mx-auto flex h-full max-w-5xl flex-col items-center justify-end px-5 pb-16 text-center sm:px-8">
            <Link
              href={`/${lang}/services`}
              className="mb-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/85 hover:text-white"
            >
              {dict.services.back_to_services}
            </Link>
            <p className="font-script text-[28px] leading-none text-white sm:text-[36px]">
              Dentaris
            </p>
            <h1 className="mt-2 max-w-3xl text-[34px] font-extrabold uppercase leading-[1.1] tracking-tight text-white sm:text-[52px]">
              {name}
            </h1>
            {desc && (
              <p className="mt-4 max-w-xl text-[14px] leading-7 text-white/85">
                {desc}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Stats card row — overlaps hero */}
      <section className="relative -mt-12 px-5 sm:px-8">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 rounded-[24px] bg-surface p-4 shadow-[0_20px_50px_-25px_rgba(26,132,120,0.25)] ring-1 ring-line sm:grid-cols-3 sm:p-6">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-2">
              {dict.services.duration_label}
            </p>
            <p className="font-display mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
              {duration}
            </p>
          </div>
          <div className="border-x border-line text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-2">
              {dict.services.starting_from_label}
            </p>
            <p className="font-display mt-2 text-2xl font-extrabold text-primary sm:text-3xl">
              {price}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Link
              href={`/${lang}/book/${slug}`}
              className="group flex h-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 text-[14px] font-bold text-white hover:bg-primary-hover transition-colors"
            >
              {dict.services.book_cta}
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-24">
        <p className="text-[16px] leading-8 text-ink-2 sm:text-[17px]">
          {long}
        </p>
      </section>

      {/* Treatments + Benefits split */}
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 sm:pb-24">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* Treatments */}
          <div className="rounded-[28px] bg-primary-soft p-8 sm:p-10">
            <p className="font-script text-[28px] leading-none text-primary sm:text-[36px]">
              ✱
            </p>
            <h2 className="mt-2 text-[26px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-[34px]">
              {dict.services.treatments_title}
            </h2>
            <ul className="mt-7 space-y-3">
              {treatments.map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-white">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 12l5 5 9-11"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <p className="text-[14px] leading-7 text-ink-2">{t}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Benefits */}
          <div>
            <h2 className="text-[26px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-[34px]">
              {dict.services.benefits_title}
            </h2>
            <ul className="mt-7 grid gap-4 sm:grid-cols-1">
              {benefits.map((b, i) => (
                <li
                  key={b.title}
                  className={
                    "rounded-[20px] p-6 ring-1 ring-line " +
                    (i % 2 === 0 ? "bg-surface" : "bg-accent-soft")
                  }
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={
                        "grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-white " +
                        (i % 2 === 0 ? "bg-primary" : "bg-accent")
                      }
                    >
                      <span className="font-display text-[15px] font-bold">
                        0{i + 1}
                      </span>
                    </span>
                    <div>
                      <h3 className="font-display text-[18px] font-bold tracking-tight text-ink">
                        {b.title}
                      </h3>
                      <p className="mt-1.5 text-[13px] leading-6 text-muted">
                        {b.body}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing table — only when pricing rows exist */}
      {pricing && pricing.length > 0 && (
        <section className="mx-auto max-w-5xl px-5 pb-20 sm:px-8 sm:pb-24">
          <h2 className="text-[26px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-[34px]">
            {dict.services.pricing_title}
          </h2>
          <ul className="mt-7 overflow-hidden rounded-[20px] bg-surface ring-1 ring-line">
            {pricing.map((row, i) => (
              <li
                key={row.label}
                className={
                  "grid items-baseline gap-3 px-6 py-5 sm:grid-cols-[1fr_auto] sm:px-8 sm:py-6 " +
                  (i > 0 ? "border-t border-line" : "")
                }
              >
                <div>
                  <p className="font-display text-[15px] font-bold leading-snug tracking-tight text-ink sm:text-[17px]">
                    {row.label}
                  </p>
                  {row.note && (
                    <p className="mt-1 text-[12px] leading-6 text-muted sm:text-[13px]">
                      {row.note}
                    </p>
                  )}
                </div>
                <p className="font-display text-[16px] font-extrabold text-primary sm:text-right sm:text-[18px]">
                  {row.price}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* FAQ */}
      <section className="mx-auto max-w-5xl px-5 pb-24 sm:px-8 sm:pb-32">
        <h2 className="text-[26px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-[34px]">
          {dict.services.faq_title}
        </h2>
        <ul className="mt-7 divide-y divide-line rounded-[20px] bg-surface ring-1 ring-line">
          {faq.map((f) => (
            <li key={f.q} className="px-6 py-5 sm:px-8 sm:py-6">
              <p className="font-display text-[16px] font-bold leading-snug tracking-tight text-ink sm:text-[18px]">
                {f.q}
              </p>
              <p className="mt-2 text-[13px] leading-6 text-muted sm:text-[14px]">
                {f.a}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA band */}
      <section className="px-3 pb-3 sm:px-5 sm:pb-5">
        <div className="bg-forest-grain mx-auto max-w-7xl rounded-[28px] px-8 py-12 text-center text-white sm:rounded-[40px] sm:px-12 sm:py-16">
          <p className="font-script text-[28px] leading-none text-primary sm:text-[36px]">
            {dict.brand.name}
          </p>
          <h2 className="mt-2 text-[28px] font-extrabold uppercase tracking-tight sm:text-[40px]">
            {dict.services.book_cta}
          </h2>
          <Link
            href={`/${lang}/book/${slug}`}
            className="group mt-7 inline-flex items-center gap-3 rounded-full bg-primary py-2 pl-6 pr-2 text-[14px] font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            {dict.home.hero_schedule_btn}
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
