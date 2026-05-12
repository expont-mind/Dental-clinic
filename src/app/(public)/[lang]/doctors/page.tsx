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
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            ◦ {dict.nav.doctors}
          </p>
          <h1 className="font-display mt-3 text-[36px] font-extrabold leading-tight tracking-tight text-ink sm:text-[48px]">
            {dict.doctors.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-muted">
            {dict.doctors.lede}
          </p>
        </header>

        {/* Filter chips */}
        <nav
          aria-label="Filter by department"
          className="mt-10 flex flex-wrap justify-center gap-2"
        >
          <Link
            href={`/${lang}/doctors`}
            className={
              (!dept
                ? "bg-primary text-white border-primary"
                : "bg-surface text-ink-2 border-line hover:border-primary/40") +
              " inline-flex items-center rounded-full border px-4 py-1.5 text-[12px] font-semibold transition-colors"
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
                  " inline-flex items-center rounded-full border px-4 py-1.5 text-[12px] font-semibold transition-colors"
                }
              >
                {name}
              </Link>
            );
          })}
        </nav>

        {/* Doctor cards */}
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((d) => {
            const name = lang === "mn" ? d.name_mn : d.name_en;
            const deptName =
              lang === "mn" ? d.department.name_mn : d.department.name_en;
            return (
              <li key={d.id} className="group">
                <Link
                  href={`/${lang}/doctors/${d.slug}`}
                  className="block overflow-hidden rounded-[24px] bg-surface ring-1 ring-line transition-all hover:-translate-y-1 hover:ring-primary/40 hover:shadow-[0_18px_36px_-22px_rgba(26,132,120,0.3)]"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-primary-soft">
                    {d.photo_url ? (
                      <Image
                        src={d.photo_url}
                        alt={name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-display text-6xl text-muted-2">
                        {name.charAt(0)}
                      </div>
                    )}
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-ink backdrop-blur">
                      {deptName}
                    </span>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h2 className="font-display text-[18px] font-bold leading-tight tracking-tight text-ink group-hover:text-primary transition-colors">
                      {name}
                    </h2>
                  </div>
                </Link>
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
