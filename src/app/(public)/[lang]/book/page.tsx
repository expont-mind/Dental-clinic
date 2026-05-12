import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import { SERVICE_CATALOG, type ServiceIconKey } from "@/lib/data/services";
import { StepIndicator } from "@/components/booking/StepIndicator";

const ICONS: Record<ServiceIconKey, { tone: "primary" | "accent"; path: string }> = {
  implant: {
    tone: "primary",
    path: "M12 2v10M9 5h6M8 12h8l-1 8a3 3 0 0 1-3 3h-0a3 3 0 0 1-3-3l-1-8z",
  },
  braces: {
    tone: "primary",
    path: "M4 8h16v3a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4V8zM8 8v7M12 8v7M16 8v7",
  },
  surgery: {
    tone: "primary",
    path: "M8 3c-2 0-4 1.5-4 4 0 1 .3 2 .8 3.2.7 1.8 1.2 3.3 1.7 5.8.4 2 1 4 2 4 1.2 0 1.5-2 1.7-3.5.1-1 .8-1.5 1.8-1.5s1.7.5 1.8 1.5c.2 1.5.5 3.5 1.7 3.5 1 0 1.6-2 2-4M16 4l4 4-3 3-4-4z",
  },
  kid: {
    tone: "accent",
    path: "M8 3c-2 0-4 1.5-4 4 0 1 .3 2 .8 3.2.7 1.8 1.2 3.3 1.7 5.8.4 2 1 4 2 4 1.2 0 1.5-2 1.7-3.5.1-1 .8-1.5 1.8-1.5s1.7.5 1.8 1.5c.2 1.5.5 3.5 1.7 3.5 1 0 1.6-2 2-4 .5-2.5 1-4 1.7-5.8.5-1.2.8-2.2.8-3.2 0-2.5-2-4-4-4M9 12h.01M15 12h.01",
  },
  routine: {
    tone: "primary",
    path: "M8 3c-2 0-4 1.5-4 4 0 1 .3 2 .8 3.2.7 1.8 1.2 3.3 1.7 5.8.4 2 1 4 2 4 1.2 0 1.5-2 1.7-3.5.1-1 .8-1.5 1.8-1.5s1.7.5 1.8 1.5c.2 1.5.5 3.5 1.7 3.5 1 0 1.6-2 2-4M9 10l2 2 4-4",
  },
  hygiene: {
    tone: "primary",
    path: "M3 21l4-4 6-6 5 5-6 6-4 4zM13 11l4-4 3 3-4 4M14 6l4 4",
  },
  crown: {
    tone: "primary",
    path: "M3 18h18l-1.5-9-4 4-3.5-7-3.5 7-4-4z",
  },
  gum: {
    tone: "accent",
    path: "M4 12c0-4 3-7 8-7s8 3 8 7v6H4zM8 18l-1 4M16 18l1 4M12 18v4",
  },
  smile: {
    tone: "accent",
    path: "M8 3c-2 0-4 1.5-4 4 0 1 .3 2 .8 3.2.7 1.8 1.2 3.3 1.7 5.8.4 2 1 4 2 4 1.2 0 1.5-2 1.7-3.5.1-1 .8-1.5 1.8-1.5s1.7.5 1.8 1.5c.2 1.5.5 3.5 1.7 3.5 1 0 1.6-2 2-4M19 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1z",
  },
};

const FEATURE_ICONS = [
  "M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  "M5 12h14m-6-6 6 6-6 6",
  "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3",
];

export default async function BookStartPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      {/* Hero + step bar */}
      <section className="relative overflow-hidden bg-primary-soft">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-primary/30 blur-3xl"
        />

        <StepIndicator
          variant="onSoft"
          current={1}
          stepWord={dict.booking.step}
          ofWord={dict.booking.of}
          labels={[
            dict.nav.services,
            dict.nav.doctors,
            dict.booking.step_slot_title.replace(/[…—-].*$/, "").trim(),
            dict.booking.step_form_title.replace(/[…—-].*$/, "").trim(),
          ]}
        />

        <div className="relative mx-auto max-w-3xl px-5 pt-10 pb-12 text-center sm:px-8 sm:pt-14 sm:pb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            ◦ {dict.booking.book_eyebrow}
          </p>
          <p className="font-script mt-2 text-[28px] leading-none text-primary sm:text-[36px]">
            {dict.brand.name} Dental Clinic
          </p>
          <h1 className="mt-2 text-[32px] font-extrabold uppercase leading-[1.05] tracking-tight text-ink sm:text-[44px]">
            {dict.booking.book_title}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[14px] leading-7 text-muted sm:text-[15px]">
            {dict.booking.book_lede}
          </p>
        </div>
      </section>

      {/* Features strip */}
      <section className="mx-auto max-w-5xl px-5 pt-10 sm:px-8">
        <ul className="grid grid-cols-1 overflow-hidden rounded-[24px] bg-surface shadow-[0_18px_40px_-25px_rgba(26,132,120,0.25)] ring-1 ring-line sm:grid-cols-3">
          {dict.booking.book_features.map((f, i) => (
            <li
              key={f.title}
              className={
                "flex items-center gap-3 px-5 py-4 text-left sm:flex-row sm:gap-3 sm:px-6 sm:py-6 " +
                (i > 0
                  ? "border-t border-line sm:border-l sm:border-t-0"
                  : "")
              }
            >
              <span
                className={
                  "grid h-9 w-9 shrink-0 place-items-center rounded-2xl " +
                  (i === 1
                    ? "bg-accent text-accent-ink"
                    : "bg-primary text-white")
                }
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={FEATURE_ICONS[i]} />
                </svg>
              </span>
              <div>
                <p className="font-display text-[14px] font-bold leading-tight text-ink sm:text-[15px]">
                  {f.title}
                </p>
                <p className="mt-0.5 text-[11px] text-muted">{f.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 9-service catalog grid */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_CATALOG.map((s) => {
            const title = lang === "mn" ? s.title_mn : s.title_en;
            const desc = lang === "mn" ? s.description_mn : s.description_en;
            const { tone, path } = ICONS[s.icon];
            return (
              <li key={s.slug}>
                <Link
                  href={`/${lang}/book/${s.dept_slug}`}
                  className="group flex h-full items-start gap-4 rounded-[22px] bg-surface p-5 ring-1 ring-line transition-all hover:-translate-y-1 hover:ring-primary/40 hover:shadow-[0_18px_36px_-22px_rgba(26,132,120,0.3)] sm:p-6"
                >
                  <span
                    className={
                      "grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition-transform group-hover:-rotate-3 group-hover:scale-105 " +
                      (tone === "accent"
                        ? "bg-accent/25 text-accent-ink ring-1 ring-accent/40"
                        : "bg-primary/15 text-primary ring-1 ring-primary/30")
                    }
                  >
                    <svg
                      width="24"
                      height="24"
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
                    <h2 className="text-[14px] font-extrabold uppercase tracking-wide text-ink group-hover:text-primary transition-colors">
                      {title}
                    </h2>
                    <p className="mt-2 text-[12.5px] leading-6 text-muted line-clamp-2">
                      {desc}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                      {dict.common.select}
                      <span className="transition-transform group-hover:translate-x-0.5">
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

      {/* Help band */}
      <section className="px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="mx-auto max-w-5xl rounded-[28px] bg-forest-grain p-7 text-white sm:p-10">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                ◦ {dict.booking.book_help_eyebrow}
              </p>
              <h2 className="font-display mt-3 text-[22px] font-extrabold leading-tight tracking-tight sm:text-[28px]">
                {dict.booking.book_help_title}
              </h2>
              <p className="mt-3 text-[13px] leading-6 text-white/65">
                {dict.booking.book_help_body}
              </p>
            </div>
            <a
              href={`tel:${dict.contact.phone.replace(/\s/g, "")}`}
              className="group inline-flex items-center gap-3 rounded-full bg-primary py-2 pl-6 pr-2 text-[14px] font-bold text-white hover:bg-primary-hover transition-colors"
            >
              <span className="leading-tight text-left">
                <span className="block text-[10px] uppercase tracking-wider text-white/65">
                  {dict.contact.phone_label}
                </span>
                <span className="block text-[14px] font-bold tracking-wide">
                  {dict.contact.phone}
                </span>
              </span>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2 2A14 14 0 0 1 3 6a2 2 0 0 1 2-2z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
