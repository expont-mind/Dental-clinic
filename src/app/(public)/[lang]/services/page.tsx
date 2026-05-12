import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import { SERVICE_CATALOG, type ServiceIconKey } from "@/lib/data/services";

const ICONS: Record<ServiceIconKey, { tone: "primary" | "accent"; path: string }> = {
  // Implant — screw + tooth
  implant: {
    tone: "primary",
    path: "M12 2v10M9 5h6M8 12h8l-1 8a3 3 0 0 1-3 3h-0a3 3 0 0 1-3-3l-1-8z",
  },
  // Braces — teeth with brackets
  braces: {
    tone: "primary",
    path: "M4 8h16v3a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4V8zM8 8v7M12 8v7M16 8v7",
  },
  // Surgery — tooth with scalpel
  surgery: {
    tone: "primary",
    path: "M8 3c-2 0-4 1.5-4 4 0 1 .3 2 .8 3.2.7 1.8 1.2 3.3 1.7 5.8.4 2 1 4 2 4 1.2 0 1.5-2 1.7-3.5.1-1 .8-1.5 1.8-1.5s1.7.5 1.8 1.5c.2 1.5.5 3.5 1.7 3.5 1 0 1.6-2 2-4M16 4l4 4-3 3-4-4z",
  },
  // Kid — happy tooth with cheeks
  kid: {
    tone: "accent",
    path: "M8 3c-2 0-4 1.5-4 4 0 1 .3 2 .8 3.2.7 1.8 1.2 3.3 1.7 5.8.4 2 1 4 2 4 1.2 0 1.5-2 1.7-3.5.1-1 .8-1.5 1.8-1.5s1.7.5 1.8 1.5c.2 1.5.5 3.5 1.7 3.5 1 0 1.6-2 2-4 .5-2.5 1-4 1.7-5.8.5-1.2.8-2.2.8-3.2 0-2.5-2-4-4-4M9 12h.01M15 12h.01",
  },
  // Routine — tooth with checkmark
  routine: {
    tone: "primary",
    path: "M8 3c-2 0-4 1.5-4 4 0 1 .3 2 .8 3.2.7 1.8 1.2 3.3 1.7 5.8.4 2 1 4 2 4 1.2 0 1.5-2 1.7-3.5.1-1 .8-1.5 1.8-1.5s1.7.5 1.8 1.5c.2 1.5.5 3.5 1.7 3.5 1 0 1.6-2 2-4M9 10l2 2 4-4",
  },
  // Hygiene — brush + tooth
  hygiene: {
    tone: "primary",
    path: "M3 21l4-4 6-6 5 5-6 6-4 4zM13 11l4-4 3 3-4 4M14 6l4 4",
  },
  // Crown — crown shape
  crown: {
    tone: "primary",
    path: "M3 18h18l-1.5-9-4 4-3.5-7-3.5 7-4-4z",
  },
  // Gum — tooth with gum line
  gum: {
    tone: "accent",
    path: "M4 12c0-4 3-7 8-7s8 3 8 7v6H4zM8 18l-1 4M16 18l1 4M12 18v4",
  },
  // Smile — sparkle + tooth
  smile: {
    tone: "accent",
    path: "M8 3c-2 0-4 1.5-4 4 0 1 .3 2 .8 3.2.7 1.8 1.2 3.3 1.7 5.8.4 2 1 4 2 4 1.2 0 1.5-2 1.7-3.5.1-1 .8-1.5 1.8-1.5s1.7.5 1.8 1.5c.2 1.5.5 3.5 1.7 3.5 1 0 1.6-2 2-4M19 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1z",
  },
};

export default async function ServicesPage({
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
          className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-accent/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl"
        />
        <div className="relative mx-auto max-w-7xl px-5 py-20 text-center sm:px-8 sm:py-28">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            ◦ {dict.nav.services}
          </p>
          <p className="font-script mt-2 text-[34px] leading-none text-primary sm:text-[44px]">
            {dict.brand.name}
          </p>
          <h1 className="mx-auto mt-3 max-w-3xl text-[36px] font-extrabold uppercase leading-[1.05] tracking-tight text-ink sm:text-[52px]">
            {dict.services.title}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-muted">
            {dict.services.lede}
          </p>
        </div>
      </section>

      {/* 9 service catalog grid */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <ul className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_CATALOG.map((s) => {
            const title = lang === "mn" ? s.title_mn : s.title_en;
            const desc =
              lang === "mn" ? s.description_mn : s.description_en;
            const { tone, path } = ICONS[s.icon];
            return (
              <li key={s.slug}>
                <Link
                  href={`/${lang}/services/${s.dept_slug}`}
                  className="group flex items-start gap-4"
                >
                  <span
                    className={
                      "grid h-14 w-14 shrink-0 place-items-center rounded-2xl transition-transform group-hover:-rotate-3 group-hover:scale-105 " +
                      (tone === "accent"
                        ? "bg-accent/25 text-accent-ink ring-1 ring-accent/40"
                        : "bg-primary/15 text-primary ring-1 ring-primary/30")
                    }
                  >
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={path} />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-[15px] font-extrabold uppercase tracking-wide text-ink group-hover:text-primary transition-colors sm:text-[16px]">
                      {title}
                    </h2>
                    <p className="mt-2 text-[13.5px] leading-6 text-muted">
                      {desc}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* CTA */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 rounded-[28px] bg-primary-soft px-6 py-7 sm:flex-row sm:px-10 sm:py-8">
          <div>
            <p className="font-script text-[26px] leading-none text-primary sm:text-[32px]">
              {dict.brand.name}
            </p>
            <p className="mt-1 font-display text-[18px] font-bold tracking-tight text-ink sm:text-[20px]">
              {dict.home.hero_schedule_btn}
            </p>
          </div>
          <Link
            href={`/${lang}/book`}
            className="group inline-flex items-center gap-3 rounded-full bg-primary py-2 pl-6 pr-2 text-[14px] font-semibold text-white hover:bg-primary-hover transition-colors"
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
