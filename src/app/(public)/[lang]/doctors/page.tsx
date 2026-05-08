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
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
          ◦ {dict.nav.doctors}
        </p>
        <h1 className="font-display mt-3 text-4xl font-medium leading-tight tracking-tight sm:text-6xl">
          {dict.doctors.title}
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-muted">
          {dict.doctors.lede}
        </p>
      </header>

      {/* Filter chips */}
      <nav
        aria-label="Filter by department"
        className="mt-10 flex flex-wrap gap-2"
      >
        <Link
          href={`/${lang}/doctors`}
          className={
            (!dept
              ? "bg-ink text-white border-ink"
              : "bg-surface text-ink-2 border-line hover:border-line-strong") +
            " inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors"
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
                  ? "bg-ink text-white border-ink"
                  : "bg-surface text-ink-2 border-line hover:border-line-strong") +
                " inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors"
              }
            >
              {name}
            </Link>
          );
        })}
      </nav>

      {/* Doctor grid */}
      <ul className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((d) => {
          const name = lang === "mn" ? d.name_mn : d.name_en;
          const title = lang === "mn" ? d.title_mn : d.title_en;
          const deptName =
            lang === "mn" ? d.department.name_mn : d.department.name_en;
          return (
            <li key={d.id} className="group">
              <Link href={`/${lang}/doctors/${d.slug}`} className="block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-surface-2">
                  {d.photo_url ? (
                    <Image
                      src={d.photo_url}
                      alt={name}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-display text-7xl text-muted-2">
                      {name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-surface/95 px-2.5 py-1 text-xs font-medium text-ink-2 backdrop-blur">
                    {deptName}
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-xl font-medium leading-tight tracking-tight">
                    {name}
                  </h3>
                  {d.years_exp != null && (
                    <span className="text-xs whitespace-nowrap text-muted-2">
                      {d.years_exp}+ {dict.doctors.years_exp}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm leading-6 text-muted">{title}</p>
              </Link>
            </li>
          );
        })}
      </ul>

      {doctors.length === 0 && (
        <p className="mt-12 text-center text-muted">{dict.common.empty}</p>
      )}
    </div>
  );
}
