import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import { getDoctorBySlug } from "@/lib/queries/catalog";

export default async function DoctorDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const doctor = await getDoctorBySlug(slug);
  if (!doctor) notFound();

  const name = lang === "mn" ? doctor.name_mn : doctor.name_en;
  const title = lang === "mn" ? doctor.title_mn : doctor.title_en;
  const bio = lang === "mn" ? doctor.bio_mn : doctor.bio_en;
  const deptName =
    lang === "mn" ? doctor.department.name_mn : doctor.department.name_en;

  return (
    <div
      className="relative"
      style={{
        background:
          "linear-gradient(180deg, #ecf5f3 0%, #e3eeeb 50%, #f1f7f5 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:py-16">
        {/* Back */}
        <Link
          href={`/${lang}/doctors`}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted hover:text-primary transition-colors"
        >
          ← {dict.doctors.filter_all}
        </Link>

        {/* Profile card */}
        <article className="mt-5 overflow-hidden rounded-[20px] bg-surface p-4 shadow-[0_20px_50px_-25px_rgba(26,132,120,0.25)] ring-1 ring-line sm:mt-6 sm:rounded-[28px] sm:p-6">
          <div className="grid gap-5 sm:gap-6 lg:grid-cols-[0.95fr_1.1fr] lg:gap-10">
            {/* Photo */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-[16px] bg-primary-soft sm:rounded-[22px] lg:aspect-auto lg:min-h-[480px]">
              {doctor.photo_url ? (
                <Image
                  src={doctor.photo_url}
                  alt={name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 540px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center font-display text-8xl text-muted-2">
                  {name.charAt(0)}
                </div>
              )}
              {doctor.years_exp != null && (
                <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-ink backdrop-blur">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                  {doctor.years_exp}+ {dict.doctors.years_exp}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col sm:p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary sm:text-[11px]">
                ◦ {deptName}
              </p>
              <h1 className="font-display mt-2 text-[24px] font-extrabold leading-tight tracking-tight text-ink sm:mt-3 sm:text-[32px] lg:text-[44px]">
                {name}
              </h1>
              {title && (
                <p className="mt-2 text-[13px] font-semibold leading-6 text-primary sm:mt-3 sm:text-[14px] lg:text-[15px]">
                  {title}
                </p>
              )}
              {bio && (
                <p className="mt-4 max-w-xl text-[13.5px] leading-7 text-muted sm:mt-5 sm:text-[14px] lg:text-[15px]">
                  {bio}
                </p>
              )}

              {/* 3 info cards */}
              <ul className="mt-5 grid gap-2.5 sm:mt-7 sm:gap-3 sm:grid-cols-3">
                {[
                  {
                    label: dict.doctors.profession_label,
                    value: title || deptName,
                  },
                  {
                    label: dict.doctors.rank_label,
                    value: dict.doctors.default_rank,
                  },
                  {
                    label: dict.doctors.direction_label,
                    value: deptName,
                  },
                ].map((item) => (
                  <li
                    key={item.label}
                    className="rounded-2xl border border-line bg-surface px-4 pb-5 pt-4"
                  >
                    <p className="text-[13px] font-bold text-ink">
                      {item.label}
                    </p>
                    <p className="mt-2 text-[13px] leading-6 text-muted">
                      {item.value}
                    </p>
                    <span className="mt-3 block h-px w-10 bg-primary/30" />
                  </li>
                ))}
              </ul>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/${lang}/book/${doctor.department.slug}?doctor=${doctor.id}`}
                  className="group inline-flex items-center gap-3 rounded-full bg-primary py-2 pl-6 pr-2 text-[14px] font-bold text-white hover:bg-primary-hover transition-colors"
                >
                  {dict.doctors.book_with_doctor}
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
                  href={`/${lang}/contact`}
                  className="inline-flex items-center gap-2 rounded-full border border-ink px-5 py-3 text-[13px] font-semibold text-ink hover:bg-ink hover:text-white transition-colors"
                >
                  {dict.nav.contact}
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </div>
        </article>

        {/* Bottom CTA band */}
        <section className="mt-8 rounded-[20px] bg-forest-grain px-6 py-8 text-center text-white sm:mt-10 sm:rounded-[28px] sm:px-10 sm:py-10 lg:px-12 lg:py-12">
          <p className="font-script text-[20px] leading-none text-primary sm:text-[26px] lg:text-[34px]">
            {dict.brand.name}
          </p>
          <h2 className="font-display mt-2 text-[20px] font-extrabold uppercase tracking-tight sm:text-[24px] lg:text-[32px]">
            {dict.doctors.book_with_doctor}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[12.5px] leading-6 text-white/65 sm:text-[13px] sm:leading-7">
            {name} — {title || deptName}
          </p>
          <Link
            href={`/${lang}/book/${doctor.department.slug}?doctor=${doctor.id}`}
            className="group mt-5 inline-flex items-center gap-2.5 rounded-full bg-primary py-2 pl-5 pr-1.5 text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors sm:mt-7 sm:gap-3 sm:pl-6 sm:pr-2 sm:text-[14px]"
          >
            {dict.booking.submit}
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
        </section>
      </div>
    </div>
  );
}
