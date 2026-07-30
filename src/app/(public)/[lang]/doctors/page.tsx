import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import { listDoctors, listDepartments } from "@/lib/queries/catalog";

export default async function DoctorsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ dept?: string }>;
}) {
  const { lang } = await params;
  const { dept } = await searchParams;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const [departments, doctors] = await Promise.all([
    listDepartments(),
    listDoctors({ departmentSlug: dept }),
  ]);

  return (
    <div
      className="relative"
      style={{
        background:
          "linear-gradient(180deg, #ecf5f3 0%, #e3eeeb 50%, #f1f7f5 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
        <header className="text-center">
          <h1 className="font-display text-[24px] font-extrabold leading-tight tracking-tight text-ink sm:text-[36px] lg:text-[48px]">
            {dict.doctors.title}
          </h1>
        </header>

        {/* Filter chips — hidden when there is only one department (single-clinic setup) */}
        <nav
          aria-label="Filter by department"
          hidden={departments.length <= 1}
          className="mt-8 flex gap-2 overflow-x-auto px-1 pb-2 sm:mt-10 sm:justify-center sm:overflow-visible sm:px-0 sm:pb-0 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <Link
            href={`/${lang}/doctors`}
            className={
              (!dept
                ? "bg-primary text-white border-primary"
                : "bg-surface text-ink-2 border-line hover:border-primary/40") +
              " inline-flex shrink-0 items-center rounded-full border px-4 py-1.5 text-[12px] font-semibold transition-colors"
            }
          >
            {dict.doctors.filter_all}
          </Link>
          {departments.map((d) => {
            const active = dept === d.slug;
            const name = lang === "mn" ? d.name_mn : d.name_en;
            return (
              <Link
                key={d.id}
                href={`/${lang}/doctors?dept=${d.slug}`}
                className={
                  (active
                    ? "bg-primary text-white border-primary"
                    : "bg-surface text-ink-2 border-line hover:border-primary/40") +
                  " inline-flex shrink-0 items-center rounded-full border px-4 py-1.5 text-[12px] font-semibold transition-colors"
                }
              >
                {name}
              </Link>
            );
          })}
        </nav>

        {/* Doctor cards */}
        <ul className="mt-8 grid grid-cols-3 gap-2 sm:mt-12 sm:gap-4 lg:gap-6">
          {doctors.map((d) => {
            const name = lang === "mn" ? d.name_mn : d.name_en;
            const deptName =
              lang === "mn" ? d.department.name_mn : d.department.name_en;
            const title = (lang === "mn" ? d.title_mn : d.title_en) || deptName;
            const bio = lang === "mn" ? d.bio_mn : d.bio_en;
            const yearsLabel =
              typeof d.years_exp === "number" && d.years_exp > 0
                ? `${d.years_exp} ${lang === "mn" ? "жил" : "yrs"}`
                : null;
            return (
              <li key={d.id} className="group">
                <div className="flex h-full flex-col overflow-hidden rounded-[14px] bg-white ring-1 ring-line shadow-[0_8px_24px_-18px_rgba(15,23,42,0.18)] transition-all hover:-translate-y-1 hover:ring-primary/40 hover:shadow-[0_18px_36px_-22px_rgba(26,132,120,0.3)] sm:rounded-[20px] lg:rounded-[24px]">
                  <Link
                    href={`/${lang}/doctors/${d.slug}`}
                    className="relative block aspect-4/5 w-full overflow-hidden bg-primary-soft"
                  >
                    {d.photo_url ? (
                      <Image
                        src={d.photo_url}
                        alt={name}
                        fill
                        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 33vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-display text-3xl text-muted-2 sm:text-5xl lg:text-6xl">
                        {name.charAt(0)}
                      </div>
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col p-2.5 sm:p-4 lg:p-6">
                    <Link href={`/${lang}/doctors/${d.slug}`}>
                      <h2 className="font-display text-[12px] font-extrabold leading-tight tracking-tight text-primary hover:text-primary-hover transition-colors sm:text-[15px] lg:text-[20px]">
                        {name}
                      </h2>
                    </Link>

                    <p className="mt-1 text-[10px] leading-4 text-ink-2 line-clamp-2 sm:mt-1.5 sm:text-[12px] sm:leading-5 sm:line-clamp-none lg:mt-2 lg:text-[13px] lg:leading-6">
                      {title}
                    </p>

                    {yearsLabel && (
                      <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-3">
                        <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white sm:px-3 sm:py-1 sm:text-[11px] lg:px-3.5 lg:text-[12px]">
                          {yearsLabel}
                        </span>
                      </div>
                    )}

                    {bio && (
                      <p className="mt-2 hidden text-[12px] leading-6 text-muted line-clamp-3 sm:block lg:mt-4 lg:text-[13px]">
                        {bio}
                      </p>
                    )}

                    <Link
                      href={`/${lang}/booking?doctor=${d.slug}`}
                      className="mt-3 inline-flex items-center justify-center rounded-xl bg-primary px-2 py-2 text-[10.5px] font-bold text-white hover:bg-primary-hover transition-colors sm:mt-4 sm:rounded-2xl sm:px-4 sm:py-2.5 sm:text-[12px] lg:mt-5 lg:px-5 lg:py-3 lg:text-[14px]"
                    >
                      {lang === "mn" ? "Цаг авах" : "Book"}
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {doctors.length === 0 && (
          <p className="mt-12 text-center text-muted">{dict.common.empty}</p>
        )}
      </div>
    </div>
  );
}
