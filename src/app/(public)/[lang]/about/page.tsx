import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import { PdfCarousel } from "@/components/marketing/PdfCarousel";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <div className="bg-bg">
      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <section className="relative overflow-hidden bg-primary-soft">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl"
        />
        <div className="relative mx-auto max-w-7xl px-5 pt-14 pb-24 sm:px-8 sm:pt-20 sm:pb-32 lg:pt-24 lg:pb-36">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-14">
            <div className="order-2 lg:order-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                ◦ {dict.about.eyebrow}
              </p>
              <h1 className="font-script mt-3 text-[24px] leading-[1.05] text-primary sm:text-[28px] lg:text-[32px] xl:text-[36px]">
                {dict.about.title}
              </h1>
              <div className="mt-6 space-y-4">
                <p className="text-[15px] leading-7 text-ink-2">
                  {dict.about.lede}
                </p>
                <p className="text-[14.5px] leading-7 text-muted">
                  {dict.about.lede_2}
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/${lang}/book`}
                  className="group inline-flex items-center gap-3 rounded-full bg-primary py-2 pl-6 pr-2 text-[14px] font-semibold text-white hover:bg-primary-hover transition-colors"
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
                <Link
                  href={`/${lang}/services`}
                  className="inline-flex items-center gap-2 rounded-full border border-ink px-5 py-2.5 text-[13px] font-semibold text-ink hover:bg-ink hover:text-white transition-colors"
                >
                  {dict.nav.services} →
                </Link>
              </div>
            </div>

            <div className="relative order-1 lg:order-2">
              <span
                aria-hidden
                className="pointer-events-none absolute -right-6 -top-6 hidden h-24 w-24 rounded-full bg-primary/15 sm:block lg:-right-10 lg:-top-8 lg:h-28 lg:w-28"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-8 -left-8 hidden h-32 w-32 rounded-[40px] bg-accent/30 sm:block lg:h-40 lg:w-40"
              />
              <div className="relative aspect-5/4 overflow-hidden rounded-[28px] ring-1 ring-white/60 shadow-[0_30px_60px_-30px_rgba(12,42,38,0.35)] sm:rounded-[36px]">
                <Image
                  src="/hamtolon.jpg"
                  alt={dict.brand.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 620px"
                  className="object-cover object-center"
                />
                <div className="absolute bottom-4 right-4 rounded-2xl bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur sm:bottom-5 sm:right-5">
                  <p className="font-script text-[20px] leading-none text-primary sm:text-[22px]">
                    since 2018
                  </p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-muted sm:text-[10px]">
                    Digital Dental Clinic
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── STATS STRIP ─────────────────────────── */}
      <section className="relative -mt-16 px-5 sm:-mt-20 sm:px-8">
        <ul className="mx-auto grid max-w-5xl grid-cols-2 gap-4 rounded-[28px] bg-surface p-6 shadow-[0_20px_50px_-25px_rgba(26,132,120,0.25)] ring-1 ring-line sm:grid-cols-4 sm:p-8">
          {dict.about.stats.map((s, i) => (
            <li
              key={s.label}
              className={
                "text-center " +
                (i > 0 ? "sm:border-l sm:border-line" : "")
              }
            >
              <p className="font-display text-3xl font-extrabold leading-none text-primary sm:text-4xl">
                {s.value}
              </p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                {s.label}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ─────────────────────────── STORY ─────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          {/* PDF pages — button-controlled carousel between p.4 and p.5 */}
          <PdfCarousel
            slides={[
              { src: "/uilchilgee-2.png", alt: "Dentaris үйлчилгээний дэлгэрэнгүй" },
              { src: "/uilchilgee-1.png", alt: "Dentaris үйлчилгээний танилцуулга" },
            ]}
          />

          {/* Copy */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
              ◦ {dict.about.story_eyebrow}
            </p>
            <h2 className="mt-4 text-[26px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-[34px]">
              {dict.about.story_title}
            </h2>
            <p className="mt-6 text-[15px] leading-7 text-ink-2">
              {dict.about.story_intro}
            </p>
            <ul className="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {dict.about.story_services.map((s, i) => (
                <li
                  key={s}
                  className="flex items-start gap-3 text-[14.5px] leading-6 text-ink-2"
                >
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-soft font-display text-[10px] font-bold text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-4">
              <p className="text-[15px] leading-7 text-ink-2">
                {dict.about.story_closing}
              </p>
              <p className="font-display text-[17px] leading-7 italic text-primary">
                {dict.about.story_closing_2}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── TEAM ─────────────────────────── */}
      <section className="bg-forest-grain text-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <div className="relative">
              <div className="relative overflow-hidden rounded-[28px] shadow-2xl">
                <Image
                  src="/DSC02779.jpg"
                  alt={dict.about.team_title}
                  width={1600}
                  height={1200}
                  sizes="(max-width: 1024px) 100vw, 640px"
                  className="h-auto w-full"
                />
              </div>
              <span
                aria-hidden
                className="absolute -bottom-5 -right-5 hidden h-28 w-28 rounded-3xl bg-accent sm:block"
              />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
                ◦ {dict.about.team_eyebrow}
              </p>
              <h2 className="mt-2 text-[28px] font-extrabold uppercase leading-tight tracking-tight sm:text-[40px]">
                {dict.about.team_title}
              </h2>

              <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-2">
                {dict.about.team_breakdown.map((m, i) => (
                  <li
                    key={m.label}
                    className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10 backdrop-blur"
                  >
                    <span
                      className={
                        "grid h-10 w-10 shrink-0 place-items-center rounded-xl font-display text-[16px] font-extrabold " +
                        (i % 3 === 1
                          ? "bg-accent text-accent-ink"
                          : "bg-primary text-white")
                      }
                    >
                      {m.count}
                    </span>
                    <span className="text-[12px] font-medium leading-tight text-white/90">
                      {m.label}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/${lang}/doctors`}
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-white py-2 pl-6 pr-2 text-[14px] font-semibold text-ink hover:bg-accent hover:text-accent-ink transition-colors"
              >
                {dict.nav.doctors}
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-white">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12h14M13 5l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── CLINIC GALLERY (horizontal scroll) ─────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                ◦ {dict.about.gallery_eyebrow}
              </p>
              <h2 className="mt-3 text-[22px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:whitespace-nowrap sm:text-[34px] lg:text-[40px]">
                {dict.about.gallery_title}
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-muted">
                {dict.about.gallery_lede}
              </p>
            </div>
            <p className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-muted sm:flex sm:items-center sm:gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14M13 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              гүйлгэх →
            </p>
          </div>
        </div>

        <div className="relative mt-10">
          <div
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-4 sm:gap-6 sm:scroll-px-8 sm:px-8 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]"
          >
            {dict.about.gallery_items.map((g, i) => (
              <figure
                key={g.image}
                className="group relative shrink-0 snap-start overflow-hidden rounded-[28px] bg-surface-2 ring-1 ring-line shadow-sm w-[82%] sm:w-[58%] lg:w-[44%] xl:w-[38%]"
              >
                <div className="relative aspect-4/3 overflow-hidden">
                  <Image
                    src={g.image}
                    alt={g.caption}
                    fill
                    sizes="(max-width: 640px) 82vw, (max-width: 1024px) 58vw, 44vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-linear-to-t from-black/55 via-black/0 to-transparent"
                  />
                </div>
                <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                  <div>
                    <span className="inline-block rounded-full bg-white/95 px-3 py-1 font-display text-[11px] font-bold tracking-widest text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="mt-2 font-display text-[18px] font-bold leading-tight text-white sm:text-[20px]">
                      {g.caption}
                    </p>
                  </div>
                </figcaption>
              </figure>
            ))}
            {/* trailing spacer so last card can fully snap-start with right padding visible */}
            <span aria-hidden className="shrink-0 w-1 sm:w-3" />
          </div>
        </div>
      </section>

      {/* ─────────────────────────── CSR ─────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="relative overflow-hidden rounded-[36px] bg-accent-soft p-8 sm:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/40 blur-3xl"
          />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent-ink">
                ◦ {dict.about.csr_eyebrow}
              </p>
              <h2 className="mt-3 text-[26px] font-extrabold uppercase leading-tight tracking-tight text-accent-ink sm:text-[36px]">
                {dict.about.csr_title}
              </h2>
              <p className="mt-5 max-w-xl text-[15px] leading-7 text-accent-ink/85">
                {dict.about.csr_body}
              </p>
            </div>
            <div className="rounded-[28px] bg-white p-8 text-center shadow-md ring-1 ring-accent/30">
              <p className="font-display text-[56px] font-extrabold leading-none text-accent-ink sm:text-[72px]">
                {dict.about.csr_stat}
              </p>
              <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-muted">
                {dict.about.csr_stat_label}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── LOCATIONS ─────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            ◦ {dict.about.locations_eyebrow}
          </p>
        </div>
        <div className="mt-12">
          {dict.about.locations.map((loc) => (
            <div
              key={loc.name}
              className="group mx-auto grid max-w-5xl overflow-hidden rounded-[28px] bg-surface ring-1 ring-line transition-shadow hover:shadow-xl md:grid-cols-2"
            >
              <div className="relative aspect-5/3 overflow-hidden bg-surface-2 md:aspect-auto md:min-h-90">
                <Image
                  src={loc.image}
                  alt={loc.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 540px"
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col justify-center p-7 sm:p-9">
                <span className="inline-block w-fit rounded-full bg-primary-soft px-3 py-1 font-display text-[11px] font-bold tracking-widest text-primary">
                  {loc.tag}
                </span>
                <h3 className="mt-4 font-display text-[26px] font-bold tracking-tight text-ink sm:text-[30px]">
                  {loc.name}
                </h3>
                <p className="mt-4 flex items-start gap-2 text-[14px] leading-6 text-muted">
                  <svg
                    className="mt-0.5 shrink-0 text-primary"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M12 21s-7-6.5-7-12a7 7 0 1 1 14 0c0 5.5-7 12-7 12Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <circle
                      cx="12"
                      cy="9"
                      r="2.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                  {loc.address}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <a
                    href={`tel:${loc.phone.replace(/\s+/g, "")}`}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-primary-hover transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {loc.phone}
                  </a>
                  <Link
                    href={`/${lang}/contact`}
                    className="inline-flex items-center gap-2 rounded-full border border-ink px-5 py-2.5 text-[13px] font-semibold text-ink hover:bg-ink hover:text-white transition-colors"
                  >
                    {dict.nav.contact} →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
