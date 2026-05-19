import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import {
  getServiceBySlugPublic,
  getServiceById,
  listActiveServicesPublic,
  listChildServices,
  listDoctorsForService,
  getSiblingServices,
} from "@/lib/queries/catalog";
import { createSupabaseStatic } from "@/lib/supabase/server";
import { StickyBookCTA } from "@/components/services/StickyBookCTA";
import type { Service, ServiceContentBlock } from "@/lib/supabase/types";

export async function generateStaticParams() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url.includes("YOUR_PROJECT_REF")) return [];

  const supabase = createSupabaseStatic();
  const { data: allServices } = await supabase
    .from("services")
    .select("slug")
    .eq("is_active", true);

  return (allServices ?? []).flatMap((s) => [
    { lang: "mn", slug: s.slug },
    { lang: "en", slug: s.slug },
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

  const service = await getServiceBySlugPublic(slug);
  if (!service) notFound();

  const isMn = lang === "mn";
  const isParent = service.parent_id === null;

  if (isParent) {
    return <ParentDetail service={service} lang={lang} isMn={isMn} dict={dict} />;
  }
  return <ChildDetail service={service} lang={lang} isMn={isMn} dict={dict} />;
}

// ============================================================================
// PARENT SERVICE DETAIL — e-commerce style product page
// ============================================================================

async function ParentDetail({
  service,
  lang,
  isMn,
  dict,
}: {
  service: Service;
  lang: string;
  isMn: boolean;
  dict: Awaited<ReturnType<typeof getDictionary>>;
}) {
  const children = await listChildServices(service.id);
  const doctors = await listDoctorsForService(service.id);
  const content: ServiceContentBlock = isMn
    ? service.content_mn
    : service.content_en;

  const name = isMn ? service.name_mn : service.name_en;
  const desc = isMn ? service.description_mn : service.description_en;
  const long = isMn ? service.long_description_mn : service.long_description_en;
  const duration = isMn ? service.duration_text_mn : service.duration_text_en;
  const price = isMn ? service.price_text_mn : service.price_text_en;
  const heroImg = service.hero_image_url || "/hamtolon.jpg";
  const bookHref = `/${lang}/book/${service.slug}`;

  const treatments = content?.treatments ?? [];
  const benefits = content?.benefits ?? [];
  const faq = content?.faq ?? [];
  const pricing = content?.pricing ?? [];

  return (
    <div className="bg-bg">
      {/* Hero — full bleed image with overlay */}
      <section className="relative">
        <div className="relative h-[420px] w-full overflow-hidden sm:h-[520px]">
          <Image
            src={heroImg}
            alt={name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/70"
          />
          <div className="relative mx-auto flex h-full max-w-5xl flex-col items-center justify-end px-5 pb-20 text-center sm:px-8">
            <Link
              href={`/${lang}/services`}
              className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/80 hover:text-white transition-colors"
            >
              {dict.services.back_to_services}
            </Link>
            <p className="font-script text-[26px] leading-none text-white/90 sm:text-[34px]">
              {dict.brand.name}
            </p>
            <h1 className="mt-2 max-w-3xl text-[32px] font-extrabold uppercase leading-[1.08] tracking-tight text-white sm:text-[50px]">
              {name}
            </h1>
            {desc && (
              <p className="mt-4 max-w-lg text-[14px] leading-7 text-white/80 sm:text-[15px]">
                {desc}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Stats card — overlaps hero */}
      <section className="relative -mt-14 px-5 sm:px-8">
        <div
          id="stats-card"
          className="mx-auto grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-[20px] bg-line shadow-[0_24px_48px_-20px_rgba(26,132,120,0.2)] sm:grid-cols-3"
        >
          {duration && (
            <div className="bg-surface px-5 py-5 text-center sm:px-8 sm:py-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                {dict.services.duration_label}
              </p>
              <p className="font-display mt-1.5 text-[22px] font-extrabold text-ink sm:text-[26px]">
                {duration}
              </p>
            </div>
          )}
          {price && (
            <div className="bg-surface px-5 py-5 text-center sm:px-8 sm:py-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                {dict.services.starting_from_label}
              </p>
              <p className="font-display mt-1.5 text-[22px] font-extrabold text-primary sm:text-[26px]">
                {price}
              </p>
            </div>
          )}
          <div className="col-span-2 bg-primary sm:col-span-1">
            <Link
              href={bookHref}
              className="group flex h-full items-center justify-center gap-2 px-6 py-5 text-[14px] font-bold text-white sm:py-6"
            >
              {dict.services.book_cta}
              <span className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Long description */}
      {long && (
        <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
          <p className="text-[16px] leading-8 text-ink-2 sm:text-[17px]">
            {long}
          </p>
        </section>
      )}

      {/* Child services — pricing table style */}
      {children.length > 0 && (
        <section className="mx-auto max-w-4xl px-5 pb-16 sm:px-8 sm:pb-20">
          <h2 className="text-[24px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-[30px]">
            {dict.services.child_services_title}
          </h2>
          <p className="mt-2 text-[14px] text-muted">
            {isMn
              ? "Үйлчилгээ дээр дарж дэлгэрэнгүй үзнэ үү"
              : "Click a service for details"}
          </p>
          <div className="mt-6 overflow-hidden rounded-[20px] ring-1 ring-line">
            {children.map((child, i) => {
              const childName = isMn ? child.name_mn : child.name_en;
              const childDesc = isMn ? child.description_mn : child.description_en;
              const childPrice = child.price_cents
                ? `${(child.price_cents / 100).toLocaleString()}₮`
                : null;
              const childDuration = child.duration_min
                ? `${child.duration_min} ${isMn ? "мин" : "min"}`
                : null;

              return (
                <Link
                  key={child.id}
                  href={`/${lang}/services/${child.slug}`}
                  className={
                    "group flex items-center gap-4 bg-surface px-5 py-4 transition-colors hover:bg-primary-soft/40 sm:px-7 sm:py-5 " +
                    (i > 0 ? "border-t border-line" : "")
                  }
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[14px] font-bold text-ink group-hover:text-primary transition-colors sm:text-[15px]">
                      {childName}
                    </h3>
                    {childDesc && (
                      <p className="mt-0.5 text-[12px] leading-5 text-muted line-clamp-1">
                        {childDesc}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    {childDuration && (
                      <span className="hidden text-[12px] text-muted sm:block">
                        {childDuration}
                      </span>
                    )}
                    {childPrice && (
                      <span className="text-[14px] font-bold text-primary sm:text-[15px]">
                        {childPrice}
                      </span>
                    )}
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary transition-transform group-hover:translate-x-0.5">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Treatments + Benefits */}
      {(treatments.length > 0 || benefits.length > 0) && (
        <section className="bg-[#f6f2ec]">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
              {/* Treatments */}
              {treatments.length > 0 && (
                <div>
                  <p className="font-script text-[26px] leading-none text-primary sm:text-[32px]">
                    ✱
                  </p>
                  <h2 className="mt-2 text-[24px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-[30px]">
                    {dict.services.treatments_title}
                  </h2>
                  <ul className="mt-6 space-y-2.5">
                    {treatments.map((t) => (
                      <li key={t} className="flex items-start gap-3 rounded-2xl bg-white/80 px-4 py-3">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-white">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12l5 5 9-11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <p className="text-[14px] leading-6 text-ink-2">{t}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits */}
              {benefits.length > 0 && (
                <div>
                  <h2 className="text-[24px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-[30px]">
                    {dict.services.benefits_title}
                  </h2>
                  <ul className="mt-6 space-y-3">
                    {benefits.map((b, i) => (
                      <li
                        key={b.title}
                        className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line/50"
                      >
                        <div className="flex items-start gap-4">
                          <span
                            className={
                              "grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white " +
                              (i % 2 === 0 ? "bg-primary" : "bg-accent")
                            }
                          >
                            <span className="font-display text-[14px] font-bold">
                              0{i + 1}
                            </span>
                          </span>
                          <div>
                            <h3 className="font-display text-[16px] font-bold tracking-tight text-ink">
                              {b.title}
                            </h3>
                            <p className="mt-1 text-[13px] leading-6 text-muted">
                              {b.body}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Pricing table */}
      {pricing.length > 0 && (
        <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
          <h2 className="text-[24px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-[30px]">
            {dict.services.pricing_title}
          </h2>
          <div className="mt-6 overflow-hidden rounded-[20px] ring-1 ring-line">
            {pricing.map((row, i) => (
              <div
                key={row.label}
                className={
                  "flex items-baseline justify-between gap-4 bg-surface px-6 py-5 sm:px-8 " +
                  (i > 0 ? "border-t border-line" : "")
                }
              >
                <div className="min-w-0">
                  <p className="font-display text-[15px] font-bold leading-snug tracking-tight text-ink">
                    {row.label}
                  </p>
                  {row.note && (
                    <p className="mt-0.5 text-[12px] leading-5 text-muted">
                      {row.note}
                    </p>
                  )}
                </div>
                <p className="shrink-0 font-display text-[16px] font-extrabold text-primary">
                  {row.price}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ — accordion */}
      {faq.length > 0 && (
        <section className="mx-auto max-w-4xl px-5 pb-16 sm:px-8 sm:pb-20">
          <h2 className="text-[24px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-[30px]">
            {dict.services.faq_title}
          </h2>
          <div className="mt-6 divide-y divide-line overflow-hidden rounded-[20px] bg-surface ring-1 ring-line">
            {faq.map((f) => (
              <details key={f.q} className="group">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 sm:px-8">
                  <p className="font-display text-[15px] font-bold leading-snug tracking-tight text-ink sm:text-[16px]">
                    {f.q}
                  </p>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition-transform group-open:rotate-45">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-5 sm:px-8">
                  <p className="text-[14px] leading-7 text-muted">{f.a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Related doctors */}
      {doctors.length > 0 && (
        <section className="bg-[#f6f2ec]">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
            <h2 className="text-[24px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-[30px]">
              {dict.services.related_doctors_title}
            </h2>
            <ul className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((d) => {
                const dName = isMn ? d.name_mn : d.name_en;
                const dTitle = isMn ? d.title_mn : d.title_en;
                return (
                  <li key={d.id} className="group">
                    <Link
                      href={`/${lang}/book/${service.slug}?doctor=${d.itdoctor_dentist_id ?? d.id}`}
                      className="block overflow-hidden rounded-[22px] bg-white ring-1 ring-line/60 transition-all hover:-translate-y-1 hover:shadow-[0_16px_32px_-16px_rgba(26,132,120,0.2)]"
                    >
                      <div className="relative aspect-[4/5] w-full overflow-hidden bg-primary-soft">
                        {d.photo_url ? (
                          <Image
                            src={d.photo_url}
                            alt={dName}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center font-display text-6xl text-muted-2">
                            {dName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="p-4 sm:p-5">
                        <h3 className="font-display text-[17px] font-bold leading-tight tracking-tight text-ink group-hover:text-primary transition-colors">
                          {dName}
                        </h3>
                        {dTitle && (
                          <p className="mt-1 text-[12px] text-muted">{dTitle}</p>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* Final CTA band */}
      <section className="px-3 pb-3 sm:px-5 sm:pb-5">
        <div className="bg-forest-grain mx-auto max-w-7xl rounded-[28px] px-8 py-12 text-center text-white sm:rounded-[40px] sm:px-12 sm:py-16">
          <p className="font-script text-[28px] leading-none text-primary sm:text-[36px]">
            {dict.brand.name}
          </p>
          <h2 className="mt-2 text-[26px] font-extrabold uppercase tracking-tight sm:text-[36px]">
            {dict.services.book_cta}
          </h2>
          <Link
            href={bookHref}
            className="group mt-7 inline-flex items-center gap-3 rounded-full bg-primary py-2.5 pl-7 pr-3 text-[14px] font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            {dict.home.hero_schedule_btn}
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-primary transition-transform group-hover:translate-x-0.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <StickyBookCTA
        href={bookHref}
        label={dict.services.book_cta}
        price={price}
      />
    </div>
  );
}

// ============================================================================
// CHILD SERVICE DETAIL — focused product page
// ============================================================================

async function ChildDetail({
  service,
  lang,
  isMn,
  dict,
}: {
  service: Service;
  lang: string;
  isMn: boolean;
  dict: Awaited<ReturnType<typeof getDictionary>>;
}) {
  const parent = service.parent_id
    ? await getServiceById(service.parent_id)
    : null;
  const siblings = service.parent_id
    ? await getSiblingServices(service.parent_id, service.slug)
    : [];

  const name = isMn ? service.name_mn : service.name_en;
  const desc = isMn ? service.description_mn : service.description_en;
  const parentName = parent ? (isMn ? parent.name_mn : parent.name_en) : null;
  const heroImg =
    parent?.hero_image_url || service.hero_image_url || "/hamtolon.jpg";

  const priceFormatted = service.price_cents
    ? `${(service.price_cents / 100).toLocaleString()}₮`
    : service.price_text_mn
      ? isMn
        ? service.price_text_mn
        : service.price_text_en
      : null;
  const durationFormatted = service.duration_min
    ? `${service.duration_min} ${isMn ? "мин" : "min"}`
    : service.duration_text_mn
      ? isMn
        ? service.duration_text_mn
        : service.duration_text_en
      : null;

  const bookHref = parent
    ? `/${lang}/book/${parent.slug}?service=${service.slug}&service_name=${encodeURIComponent(name)}`
    : `/${lang}/book/${service.slug}`;

  return (
    <div className="bg-bg">
      {/* Hero — shorter, with breadcrumb */}
      <section className="relative">
        <div className="relative h-[320px] w-full overflow-hidden sm:h-[380px]">
          <Image
            src={heroImg}
            alt={name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/70"
          />
          <div className="relative mx-auto flex h-full max-w-4xl flex-col items-center justify-end px-5 pb-16 text-center sm:px-8">
            {/* Breadcrumb */}
            <nav className="mb-4 flex items-center gap-1.5 text-[12px] font-semibold text-white/65">
              <Link href={`/${lang}/services`} className="hover:text-white transition-colors">
                {dict.nav.services}
              </Link>
              {parent && (
                <>
                  <span className="text-white/40">›</span>
                  <Link
                    href={`/${lang}/services/${parent.slug}`}
                    className="hover:text-white transition-colors"
                  >
                    {parentName}
                  </Link>
                </>
              )}
              <span className="text-white/40">›</span>
              <span className="text-white/90">{name}</span>
            </nav>
            <h1 className="max-w-2xl text-[28px] font-extrabold uppercase leading-[1.1] tracking-tight text-white sm:text-[40px]">
              {name}
            </h1>
          </div>
        </div>
      </section>

      {/* Stats card */}
      <section className="relative -mt-12 px-5 sm:px-8">
        <div
          id="stats-card"
          className="mx-auto grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-[20px] bg-line shadow-[0_24px_48px_-20px_rgba(26,132,120,0.2)] sm:grid-cols-3"
        >
          {priceFormatted && (
            <div className="bg-surface px-5 py-5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                {dict.services.starting_from_label}
              </p>
              <p className="font-display mt-1.5 text-[22px] font-extrabold text-primary">
                {priceFormatted}
              </p>
            </div>
          )}
          {durationFormatted && (
            <div className="bg-surface px-5 py-5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                {dict.services.duration_label}
              </p>
              <p className="font-display mt-1.5 text-[22px] font-extrabold text-ink">
                {durationFormatted}
              </p>
            </div>
          )}
          <div className="col-span-2 bg-primary sm:col-span-1">
            <Link
              href={bookHref}
              className="group flex h-full items-center justify-center gap-2 px-6 py-5 text-[14px] font-bold text-white"
            >
              {dict.services.book_cta}
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Description */}
      {desc && (
        <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-18">
          <p className="text-[16px] leading-8 text-ink-2 sm:text-[17px]">
            {desc}
          </p>
        </section>
      )}

      {/* Sibling services */}
      {siblings.length > 0 && (
        <section className="mx-auto max-w-3xl px-5 pb-16 sm:px-8 sm:pb-20">
          <h2 className="text-[22px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-[26px]">
            {dict.services.related_services_title}
          </h2>
          <div className="mt-5 overflow-hidden rounded-[18px] ring-1 ring-line">
            {siblings.map((sib, i) => {
              const sibName = isMn ? sib.name_mn : sib.name_en;
              const sibPrice = sib.price_cents
                ? `${(sib.price_cents / 100).toLocaleString()}₮`
                : null;

              return (
                <Link
                  key={sib.id}
                  href={`/${lang}/services/${sib.slug}`}
                  className={
                    "group flex items-center justify-between gap-3 bg-surface px-5 py-3.5 transition-colors hover:bg-primary-soft/40 " +
                    (i > 0 ? "border-t border-line" : "")
                  }
                >
                  <h3 className="text-[13px] font-bold text-ink group-hover:text-primary transition-colors">
                    {sibName}
                  </h3>
                  {sibPrice && (
                    <span className="shrink-0 text-[13px] font-bold text-primary">
                      {sibPrice}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* CTA band */}
      <section className="px-3 pb-3 sm:px-5 sm:pb-5">
        <div className="bg-forest-grain mx-auto max-w-5xl rounded-[24px] px-8 py-10 text-center text-white sm:rounded-[32px] sm:px-12 sm:py-14">
          <p className="font-script text-[24px] leading-none text-primary sm:text-[30px]">
            {dict.brand.name}
          </p>
          <h2 className="mt-2 text-[24px] font-extrabold uppercase tracking-tight sm:text-[32px]">
            {dict.services.book_cta}
          </h2>
          <Link
            href={bookHref}
            className="group mt-6 inline-flex items-center gap-3 rounded-full bg-primary py-2.5 pl-7 pr-3 text-[14px] font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            {dict.home.hero_schedule_btn}
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-primary transition-transform group-hover:translate-x-0.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <StickyBookCTA
        href={bookHref}
        label={dict.services.book_cta}
        price={priceFormatted}
      />
    </div>
  );
}
