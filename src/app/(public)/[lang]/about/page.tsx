import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";

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
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary-soft">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl"
        />
        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                ◦ {dict.about.eyebrow}
              </p>
              <p className="font-script mt-2 text-[34px] leading-none text-primary sm:text-[44px]">
                {dict.about.script_accent}
              </p>
              <h1 className="mt-3 text-[36px] font-extrabold uppercase leading-[1.05] tracking-tight text-ink sm:text-[52px]">
                {dict.about.title}
              </h1>
              <p className="mt-6 max-w-xl text-[15px] leading-7 text-muted">
                {dict.about.lede}
              </p>
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
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[36px] shadow-xl">
                <Image
                  src="/p1.jpg"
                  alt={dict.brand.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 480px"
                  className="object-cover"
                />
              </div>
              <span
                aria-hidden
                className="absolute -bottom-5 -left-5 hidden h-32 w-32 rounded-3xl bg-accent/70 sm:block"
              />
              <span
                aria-hidden
                className="absolute -right-3 -top-3 hidden h-20 w-20 rounded-full bg-primary sm:block"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats row — overlaps hero */}
      <section className="relative -mt-12 px-5 sm:px-8">
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

      {/* Mission */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          {/* Photo collage */}
          <div className="relative">
            <div className="relative grid grid-cols-2 gap-4">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[24px]">
                <Image
                  src="/p2.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 50vw, 240px"
                  className="object-cover"
                />
              </div>
              <div className="mt-12 grid gap-4">
                <div className="relative aspect-square overflow-hidden rounded-[24px]">
                  <Image
                    src="/p3.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 50vw, 240px"
                    className="object-cover"
                  />
                </div>
                <div className="relative aspect-square overflow-hidden rounded-[24px]">
                  <Image
                    src="/p4.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 50vw, 240px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
            <span
              aria-hidden
              className="absolute -bottom-4 -left-4 hidden h-24 w-24 rounded-3xl bg-accent/40 sm:block"
            />
          </div>

          {/* Copy + values */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
              01 — {dict.about.section_mission}
            </p>
            <p className="font-display mt-5 text-[24px] leading-snug tracking-tight text-ink sm:text-[32px]">
              &ldquo;{dict.about.mission_body}&rdquo;
            </p>

            <ul className="mt-9 space-y-4">
              {dict.about.values.map((v, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span
                    className={
                      "grid h-10 w-10 shrink-0 place-items-center rounded-2xl font-display text-[14px] font-bold " +
                      (i % 2 === 1
                        ? "bg-accent text-accent-ink"
                        : "bg-primary text-white")
                    }
                  >
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-[17px] font-bold tracking-tight text-ink">
                      {v.title}
                    </h3>
                    <p className="mt-1 text-[14px] leading-7 text-muted">
                      {v.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            ◦ {dict.about.timeline_title}
          </p>
          <p className="font-script mt-2 text-[30px] leading-none text-primary sm:text-[38px]">
            {dict.brand.name}
          </p>
          <h2 className="mt-2 text-[28px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-[40px]">
            {dict.about.timeline_title}
          </h2>
        </div>
        <ol className="relative mt-12 space-y-10 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-px before:bg-line sm:before:left-7">
          {dict.about.timeline.map((t, i) => (
            <li
              key={t.year}
              className="relative grid gap-2 pl-14 sm:grid-cols-[140px_1fr] sm:gap-10 sm:pl-20"
            >
              <div
                className={
                  "absolute left-0 top-1 grid h-10 w-10 place-items-center rounded-full text-white shadow-md ring-4 ring-bg sm:h-14 sm:w-14 " +
                  (i % 2 === 1 ? "bg-accent" : "bg-primary")
                }
              >
                <span className="font-display text-[9px] font-bold tracking-wider sm:text-[11px]">
                  {t.year}
                </span>
              </div>
              <div className="hidden sm:block">
                <p
                  className={
                    "font-display text-[26px] font-extrabold " +
                    (i % 2 === 1 ? "text-accent" : "text-primary")
                  }
                >
                  {t.year}
                </p>
              </div>
              <div>
                <h3 className="font-display text-[19px] font-bold tracking-tight text-ink">
                  {t.title}
                </h3>
                <p className="mt-2 text-[14px] leading-7 text-muted">
                  {t.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="px-3 pb-3 sm:px-5 sm:pb-5">
        <div className="bg-forest-grain mx-auto max-w-7xl rounded-[28px] px-8 py-12 text-center text-white sm:rounded-[40px] sm:px-12 sm:py-16">
          <p className="font-script text-[28px] leading-none text-primary sm:text-[36px]">
            {dict.brand.name}
          </p>
          <h2 className="mt-2 text-[26px] font-extrabold uppercase tracking-tight sm:text-[36px]">
            {dict.home.welcome_offer.title}
          </h2>
          <Link
            href={`/${lang}/book`}
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
