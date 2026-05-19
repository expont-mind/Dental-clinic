import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  CalendarClock,
  Check,
  ChevronRight,
  Coins,
} from "lucide-react";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import {
  getServiceBySlugPublic,
  getServiceById,
  listChildServices,
  listDoctorsForService,
  getSiblingServices,
} from "@/lib/queries/catalog";
import { createSupabaseStatic } from "@/lib/supabase/server";
import { StickyBookCTA } from "@/components/services/StickyBookCTA";
import { ServicePageNav } from "@/components/services/ServicePageNav";
import { ServiceTimeline } from "@/components/services/ServiceTimeline";
import { ServiceTestimonial } from "@/components/services/ServiceTestimonial";
import { ServiceFaq } from "@/components/services/ServiceFaq";
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
// PARENT SERVICE DETAIL
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
  const timeline = content?.timeline ?? [];
  const testimonials = content?.testimonials ?? [];

  // Build the timeline fallback from treatments if no explicit steps are set.
  const expectSteps =
    timeline.length > 0
      ? timeline
      : treatments.map((t) => ({ title: t, body: "" }));

  const navItems = [
    { id: "overview", label: dict.services.nav_overview },
    expectSteps.length > 0
      ? { id: "expect", label: dict.services.nav_expect }
      : null,
    pricing.length > 0
      ? { id: "pricing", label: dict.services.nav_pricing }
      : null,
    faq.length > 0 ? { id: "faq", label: dict.services.nav_faq } : null,
    doctors.length > 0
      ? { id: "doctors", label: dict.services.nav_doctors }
      : null,
  ].filter(Boolean) as { id: string; label: string }[];

  return (
    <div className="bg-bg">
      {/* Hero — editorial split: content left, image right */}
      <section className="relative overflow-hidden bg-[#f6f2ec]">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-accent/15 blur-3xl"
        />
        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:py-20">
          <Link
            href={`/${lang}/services`}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted hover:text-primary transition-colors"
          >
            {dict.services.back_to_services}
          </Link>

          <div
            id="stats-card"
            className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-12"
          >
            <div className="order-2 lg:order-1">
              {service.category && (
                <span className="inline-flex items-center rounded-full border border-primary/20 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                  {service.category}
                </span>
              )}
              <h1 className="mt-4 text-[34px] font-extrabold uppercase leading-[1.05] tracking-tight text-ink sm:text-[44px] lg:text-[52px]">
                {name}
              </h1>
              {desc && (
                <p className="mt-5 max-w-xl text-[15px] leading-7 text-muted sm:text-[16px]">
                  {desc}
                </p>
              )}

              {(price || duration) && (
                <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                  {price && (
                    <div>
                      <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                        <Coins className="h-3.5 w-3.5" strokeWidth={2.25} />
                        {dict.services.starting_from_label}
                      </p>
                      <p className="font-display mt-1 text-[24px] font-extrabold text-primary sm:text-[28px]">
                        {price}
                      </p>
                    </div>
                  )}
                  {duration && (
                    <div>
                      <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                        <CalendarClock
                          className="h-3.5 w-3.5"
                          strokeWidth={2.25}
                        />
                        {dict.services.duration_label}
                      </p>
                      <p className="font-display mt-1 text-[24px] font-extrabold text-ink sm:text-[28px]">
                        {duration}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href={bookHref}
                  className="group inline-flex items-center gap-2.5 rounded-full bg-primary px-6 py-3 text-[14px] font-bold text-white shadow-[0_8px_20px_-8px_rgba(26,132,120,0.6)] hover:bg-primary-hover transition-colors"
                >
                  {dict.services.book_cta}
                  <ArrowUpRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    strokeWidth={2.5}
                  />
                </Link>
                {navItems.length > 1 && (
                  <a
                    href="#overview"
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-5 py-3 text-[13px] font-semibold text-ink hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    {dict.services.nav_overview}
                  </a>
                )}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] bg-primary-soft shadow-[0_24px_48px_-20px_rgba(10,23,20,0.25)] sm:aspect-[5/4] lg:aspect-[4/5]">
                <Image
                  src={heroImg}
                  alt={name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky in-page nav */}
      <ServicePageNav items={navItems} />

      {/* Overview */}
      <section
        id="overview"
        className="scroll-mt-20 px-5 pt-16 sm:px-8 sm:pt-20"
      >
        <div className="mx-auto max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            {dict.services.eyebrow_overview}
          </p>
          {long ? (
            <p className="mt-4 text-[16px] leading-8 text-ink-2 sm:text-[17px]">
              {long}
            </p>
          ) : desc ? (
            <p className="mt-4 text-[16px] leading-8 text-ink-2 sm:text-[17px]">
              {desc}
            </p>
          ) : null}
        </div>

        {/* Child services list */}
        {children.length > 0 && (
          <div className="mx-auto mt-12 max-w-4xl">
            <h2 className="text-[20px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-[24px]">
              {dict.services.child_services_title}
            </h2>
            <ul className="mt-5 space-y-2">
              {children.map((child) => {
                const childName = isMn ? child.name_mn : child.name_en;
                const childDesc = isMn
                  ? child.description_mn
                  : child.description_en;
                const childPrice = child.price_cents
                  ? `${(child.price_cents / 100).toLocaleString()}₮`
                  : null;
                const childImg = child.image_url || service.image_url || "/p4.jpg";

                return (
                  <li key={child.id}>
                    <Link
                      href={`/${lang}/services/${child.slug}`}
                      className="group flex items-center gap-4 rounded-2xl bg-surface px-3 py-3 ring-1 ring-line transition-all hover:ring-primary/40 hover:bg-primary-soft/30 sm:px-4 sm:py-4"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-primary-soft sm:h-16 sm:w-16">
                        <Image
                          src={childImg}
                          alt={childName}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[14px] font-bold leading-tight text-ink group-hover:text-primary transition-colors sm:text-[15px]">
                          {childName}
                        </h3>
                        {childDesc && (
                          <p className="mt-0.5 line-clamp-1 text-[12px] leading-5 text-muted">
                            {childDesc}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        {childPrice && (
                          <span className="text-[14px] font-bold text-primary sm:text-[15px]">
                            {childPrice}
                          </span>
                        )}
                        <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary transition-transform group-hover:translate-x-0.5">
                          <ChevronRight
                            className="h-3.5 w-3.5"
                            strokeWidth={2.5}
                          />
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      {/* What to expect (timeline) */}
      {expectSteps.length > 0 && (
        <section
          id="expect"
          className="scroll-mt-20 bg-[#f6f2ec] px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-5xl">
            <ServiceTimeline
              steps={expectSteps}
              eyebrow={dict.services.eyebrow_expect}
              title={dict.services.timeline_title}
              lede={dict.services.timeline_lede}
            />
          </div>
        </section>
      )}

      {/* Benefits */}
      {benefits.length > 0 && (
        <section
          id="benefits"
          className="scroll-mt-20 px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-5xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
              {dict.services.eyebrow_benefits}
            </p>
            <h2 className="mt-3 text-[24px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-[30px]">
              {dict.services.benefits_title}
            </h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {benefits.map((b, i) => (
                <li
                  key={b.title}
                  className="rounded-2xl bg-surface p-6 ring-1 ring-line/60"
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
        </section>
      )}

      {/* Pricing */}
      {pricing.length > 0 && (
        <section
          id="pricing"
          className="scroll-mt-20 bg-[#f6f2ec] px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-4xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
              {dict.services.eyebrow_pricing}
            </p>
            <h2 className="mt-3 text-[24px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-[30px]">
              {dict.services.pricing_title}
            </h2>
            <div className="mt-6 overflow-hidden rounded-[20px] bg-surface ring-1 ring-line">
              {pricing.map((row, i) => (
                <div
                  key={row.label}
                  className={
                    "flex items-baseline justify-between gap-4 px-6 py-5 sm:px-8 " +
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
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section
          id="voices"
          className="scroll-mt-20 bg-[#f6f2ec] px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-4xl">
            <ServiceTestimonial
              items={testimonials}
              eyebrow={dict.services.eyebrow_voices}
              title={dict.services.testimonials_title}
            />
          </div>
        </section>
      )}

      {/* FAQ */}
      {faq.length > 0 && (
        <section
          id="faq"
          className="scroll-mt-20 px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-4xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
              {dict.services.eyebrow_faq}
            </p>
            <h2 className="mt-3 text-[24px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-[30px]">
              {dict.services.faq_title}
            </h2>
            <div className="mt-6">
              <ServiceFaq items={faq} />
            </div>
          </div>
        </section>
      )}

      {/* Doctors */}
      {doctors.length > 0 && (
        <section
          id="doctors"
          className="scroll-mt-20 bg-[#f6f2ec] px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
              {dict.services.eyebrow_doctors}
            </p>
            <h2 className="mt-3 text-[24px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-[30px]">
              {dict.services.related_doctors_title}
            </h2>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Final CTA */}
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
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
          </Link>
        </div>
      </section>

      <StickyBookCTA
        href={bookHref}
        label={dict.services.book_cta}
        price={price}
      />
    </div>
  );
}

// ============================================================================
// CHILD SERVICE DETAIL
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

  const content: ServiceContentBlock = isMn
    ? service.content_mn
    : service.content_en;
  const name = isMn ? service.name_mn : service.name_en;
  const desc = isMn ? service.description_mn : service.description_en;
  const long = isMn ? service.long_description_mn : service.long_description_en;
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

  const treatments = content?.treatments ?? [];
  const faq = content?.faq ?? [];
  const timeline = content?.timeline ?? [];
  const testimonials = content?.testimonials ?? [];
  const expectSteps =
    timeline.length > 0
      ? timeline
      : treatments.map((t) => ({ title: t, body: "" }));

  const navItems = [
    { id: "overview", label: dict.services.nav_overview },
    expectSteps.length > 0
      ? { id: "expect", label: dict.services.nav_expect }
      : null,
    faq.length > 0 ? { id: "faq", label: dict.services.nav_faq } : null,
  ].filter(Boolean) as { id: string; label: string }[];

  return (
    <div className="bg-bg">
      {/* Hero — editorial split: content left, image right */}
      <section className="relative overflow-hidden bg-[#f6f2ec]">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-accent/15 blur-3xl"
        />
        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:py-20">
          <nav className="flex items-center gap-1.5 text-[12px] font-semibold text-muted">
            <Link
              href={`/${lang}/services`}
              className="hover:text-primary transition-colors"
            >
              {dict.nav.services}
            </Link>
            {parent && (
              <>
                <span className="text-muted-2">›</span>
                <Link
                  href={`/${lang}/services/${parent.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {parentName}
                </Link>
              </>
            )}
            <span className="text-muted-2">›</span>
            <span className="text-ink">{name}</span>
          </nav>

          <div
            id="stats-card"
            className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-12"
          >
            <div className="order-2 lg:order-1">
              {parent && parentName && (
                <span className="inline-flex items-center rounded-full border border-primary/20 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                  {parentName}
                </span>
              )}
              <h1 className="mt-4 text-[30px] font-extrabold uppercase leading-[1.08] tracking-tight text-ink sm:text-[38px] lg:text-[44px]">
                {name}
              </h1>
              {desc && (
                <p className="mt-5 max-w-xl text-[15px] leading-7 text-muted sm:text-[16px]">
                  {desc}
                </p>
              )}

              {(priceFormatted || durationFormatted) && (
                <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                  {priceFormatted && (
                    <div>
                      <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                        <Coins className="h-3.5 w-3.5" strokeWidth={2.25} />
                        {dict.services.starting_from_label}
                      </p>
                      <p className="font-display mt-1 text-[22px] font-extrabold text-primary sm:text-[26px]">
                        {priceFormatted}
                      </p>
                    </div>
                  )}
                  {durationFormatted && (
                    <div>
                      <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                        <CalendarClock
                          className="h-3.5 w-3.5"
                          strokeWidth={2.25}
                        />
                        {dict.services.duration_label}
                      </p>
                      <p className="font-display mt-1 text-[22px] font-extrabold text-ink sm:text-[26px]">
                        {durationFormatted}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href={bookHref}
                  className="group inline-flex items-center gap-2.5 rounded-full bg-primary px-6 py-3 text-[14px] font-bold text-white shadow-[0_8px_20px_-8px_rgba(26,132,120,0.6)] hover:bg-primary-hover transition-colors"
                >
                  {dict.services.book_cta}
                  <ArrowUpRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    strokeWidth={2.5}
                  />
                </Link>
                {navItems.length > 1 && (
                  <a
                    href="#overview"
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-5 py-3 text-[13px] font-semibold text-ink hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    {dict.services.nav_overview}
                  </a>
                )}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] bg-primary-soft shadow-[0_24px_48px_-20px_rgba(10,23,20,0.25)] sm:aspect-[5/4] lg:aspect-[4/5]">
                <Image
                  src={heroImg}
                  alt={name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky in-page nav */}
      <ServicePageNav items={navItems} />

      {/* Overview */}
      <section
        id="overview"
        className="scroll-mt-20 px-5 pt-14 sm:px-8 sm:pt-18"
      >
        <div className="mx-auto max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            {dict.services.eyebrow_overview}
          </p>
          {(long || desc) && (
            <p className="mt-4 text-[16px] leading-8 text-ink-2 sm:text-[17px]">
              {long || desc}
            </p>
          )}
          {treatments.length > 0 && expectSteps !== timeline && (
            // If no explicit timeline, show treatments as a clean checklist below the overview
            <ul className="mt-8 grid gap-2.5 sm:grid-cols-2">
              {treatments.map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-3 rounded-2xl bg-surface px-4 py-3 ring-1 ring-line/60"
                >
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-white">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <p className="text-[13px] leading-6 text-ink-2">{t}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* What to expect — only if explicit timeline is provided */}
      {timeline.length > 0 && (
        <section
          id="expect"
          className="scroll-mt-20 mt-16 bg-[#f6f2ec] px-5 py-16 sm:mt-20 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-5xl">
            <ServiceTimeline
              steps={timeline}
              eyebrow={dict.services.eyebrow_expect}
              title={dict.services.timeline_title}
              lede={dict.services.timeline_lede}
            />
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section
          id="voices"
          className={
            "scroll-mt-20 px-5 py-16 sm:px-8 sm:py-20 " +
            (timeline.length > 0 ? "" : "bg-[#f6f2ec]")
          }
        >
          <div className="mx-auto max-w-4xl">
            <ServiceTestimonial
              items={testimonials}
              eyebrow={dict.services.eyebrow_voices}
              title={dict.services.testimonials_title}
            />
          </div>
        </section>
      )}

      {/* FAQ */}
      {faq.length > 0 && (
        <section
          id="faq"
          className="scroll-mt-20 px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mx-auto max-w-4xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
              {dict.services.eyebrow_faq}
            </p>
            <h2 className="mt-3 text-[24px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-[30px]">
              {dict.services.faq_title}
            </h2>
            <div className="mt-6">
              <ServiceFaq items={faq} />
            </div>
          </div>
        </section>
      )}

      {/* Siblings */}
      {siblings.length > 0 && (
        <section className="mx-auto max-w-4xl px-5 pb-16 sm:px-8 sm:pb-20">
          <h2 className="text-[20px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-[24px]">
            {dict.services.related_services_title}
          </h2>
          <ul className="mt-5 space-y-2">
            {siblings.map((sib) => {
              const sibName = isMn ? sib.name_mn : sib.name_en;
              const sibPrice = sib.price_cents
                ? `${(sib.price_cents / 100).toLocaleString()}₮`
                : null;
              return (
                <li key={sib.id}>
                  <Link
                    href={`/${lang}/services/${sib.slug}`}
                    className="group flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3.5 ring-1 ring-line transition-all hover:ring-primary/40 hover:bg-primary-soft/30"
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
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* CTA */}
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
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
          </Link>
        </div>
      </section>

      <StickyBookCTA
        href={bookHref}
        label={dict.services.book_cta}
        price={priceFormatted}
      />
    </div>
  );
}
