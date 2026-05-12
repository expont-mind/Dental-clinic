import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import { FeedbackForm } from "@/components/contact/FeedbackForm";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const directionsHref =
    "https://www.openstreetmap.org/?mlat=47.921&mlon=106.919#map=17/47.921/106.919";

  return (
    <div className="bg-bg">
      {/* Hero — split copy left, photo right */}
      <section className="relative overflow-hidden bg-primary-soft">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl"
        />
        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                ◦ {dict.nav.contact}
              </p>
              <p className="font-script mt-2 text-[34px] leading-none text-primary sm:text-[44px]">
                {dict.contact.script_accent}
              </p>
              <h1 className="mt-3 text-[36px] font-extrabold uppercase leading-[1.05] tracking-tight text-ink sm:text-[52px]">
                {dict.contact.title}
              </h1>
              <p className="mt-6 max-w-xl text-[15px] leading-7 text-muted">
                {dict.contact.lede}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={`tel:${dict.contact.phone.replace(/\s/g, "")}`}
                  className="group inline-flex items-center gap-3 rounded-full bg-primary py-2 pl-6 pr-2 text-[14px] font-semibold text-white hover:bg-primary-hover transition-colors"
                >
                  {dict.contact.phone}
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-primary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
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
                <Link
                  href={`/${lang}/book`}
                  className="inline-flex items-center gap-2 rounded-full bg-ink py-3 px-6 text-[14px] font-semibold text-white hover:bg-ink-2 transition-colors"
                >
                  {dict.nav.book}
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[36px] bg-surface shadow-xl">
                <Image
                  src="/contact.png"
                  alt={dict.brand.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 540px"
                  className="object-cover"
                />
              </div>
              {/* Floating badge — open now */}
              <div className="absolute -bottom-4 -left-4 flex items-center gap-2.5 rounded-full bg-surface px-4 py-2.5 shadow-lg ring-1 ring-line">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                </span>
                <p className="text-[13px] font-bold text-ink">
                  {dict.contact.open_now}
                </p>
              </div>
              <span
                aria-hidden
                className="absolute -right-4 -top-4 hidden h-20 w-20 rounded-full bg-accent/70 sm:block"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Info card row — overlaps hero */}
      <section className="relative -mt-12 px-5 sm:px-8">
        <ul className="mx-auto grid max-w-6xl items-stretch gap-0 overflow-hidden rounded-[28px] bg-surface shadow-[0_24px_60px_-30px_rgba(26,132,120,0.28)] ring-1 ring-line sm:grid-cols-2 lg:grid-cols-4">
          <ContactCard
            icon="M12 2c-3.5 0-6 2.5-6 6 0 5 6 13 6 13s6-8 6-13c0-3.5-2.5-6-6-6zm0 8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
            label={dict.contact.address_label}
            value={dict.contact.address}
            tone="primary"
            multiline
          />
          <ContactCard
            icon="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2 2A14 14 0 0 1 3 6a2 2 0 0 1 2-2z"
            label={dict.contact.phone_label}
            value={dict.contact.phone}
            href={`tel:${dict.contact.phone.replace(/\s/g, "")}`}
            tone="accent"
          />
          <ContactCard
            icon="M3 7l9 6 9-6M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7M3 7l9-4 9 4"
            label={dict.contact.email_label}
            value={dict.contact.email}
            href={`mailto:${dict.contact.email}`}
            tone="primary"
          />
          <ContactCard
            icon="M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
            label={dict.contact.hours_label}
            value={dict.contact.hours}
            multiline
            tone="accent"
            isLast
          />
        </ul>
      </section>

      {/* Locations / branches */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            ◦ {dict.contact.locations_eyebrow}
          </p>
          <h2 className="mt-3 text-[28px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-[40px]">
            {dict.contact.locations_title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-muted">
            {dict.contact.locations_lede}
          </p>
        </div>

        <div className="mt-12 grid items-stretch gap-6 sm:grid-cols-2">
          {/* Branch 1 — uses location1.jpg, full image visible */}
          <article className="relative overflow-hidden rounded-[28px] bg-primary-soft ring-1 ring-primary/20">
            <div className="relative aspect-[3/2] w-full overflow-hidden">
              <Image
                src="/location1.jpg"
                alt={dict.contact.branch1_name}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-sm">
              ◦ 01
            </span>
          </article>

          {/* Branch 2 — uses location2.jpg, full image visible */}
          <article className="relative overflow-hidden rounded-[28px] bg-accent-soft ring-1 ring-accent/30">
            <div className="relative aspect-[3/2] w-full overflow-hidden">
              <Image
                src="/location2.jpg"
                alt={dict.contact.branch2_name}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent-ink shadow-sm">
              ◦ 02
            </span>
          </article>
        </div>
      </section>

      {/* Feedback form */}
      <section className="mx-auto max-w-4xl px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="rounded-[28px] bg-primary-soft p-8 sm:p-12">
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
              ◦ {dict.contact.form_eyebrow}
            </p>
            <h2 className="mt-3 text-[28px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-[36px]">
              {dict.contact.form_title}
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[14px] leading-7 text-muted">
              {dict.contact.form_lede}
            </p>
          </div>

          <FeedbackForm dict={dict} />
        </div>
      </section>
    </div>
  );
}

function ContactCard({
  icon,
  label,
  value,
  href,
  multiline,
  tone = "primary",
  isLast,
}: {
  icon: string;
  label: string;
  value: string;
  href?: string;
  multiline?: boolean;
  tone?: "primary" | "accent";
  isLast?: boolean;
}) {
  const inner = (
    <div className="flex h-full flex-col gap-4 px-6 py-7 sm:px-7 sm:py-8">
      <span
        className={
          "grid h-12 w-12 place-items-center rounded-full " +
          (tone === "accent"
            ? "bg-accent text-accent-ink"
            : "bg-primary text-white")
        }
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={icon} />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-2">
          {label}
        </p>
        <p
          className={
            "mt-2 font-semibold text-ink " +
            (multiline
              ? "text-[13px] leading-6 whitespace-pre-line"
              : "text-[14px] leading-6")
          }
        >
          {value}
        </p>
      </div>
    </div>
  );
  return (
    <li
      className={
        "group relative flex flex-col border-line transition-colors hover:bg-primary-soft/40 [&:not(:first-child)]:border-t sm:[&:nth-child(2)]:border-l sm:[&:nth-child(4)]:border-l sm:[&:nth-child(3)]:border-t lg:[&:nth-child(3)]:border-t-0 lg:[&:nth-child(3)]:border-l " +
        (!isLast ? "" : "")
      }
    >
      {href ? (
        <a href={href} className="block h-full">
          {inner}
        </a>
      ) : (
        inner
      )}
    </li>
  );
}
