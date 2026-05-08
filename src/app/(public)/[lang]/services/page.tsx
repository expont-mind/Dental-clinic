import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import { listDepartments } from "@/lib/queries/catalog";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const departments = await listDepartments();

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
          ◦ {dict.nav.services}
        </p>
        <h1 className="font-display mt-3 text-4xl font-medium leading-tight tracking-tight sm:text-6xl">
          {dict.services.title}
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-muted">
          {dict.services.lede}
        </p>
      </header>

      <ul className="mt-14 divide-y divide-line border-y border-line">
        {departments.map((d, i) => {
          const name = lang === "mn" ? d.name_mn : d.name_en;
          const desc = lang === "mn" ? d.description_mn : d.description_en;
          return (
            <li key={d.id}>
              <Link
                href={`/${lang}/book/${d.slug}`}
                className="group grid items-start gap-6 py-8 transition-colors sm:grid-cols-12 sm:py-10"
              >
                <div className="sm:col-span-1">
                  <span className="font-mono text-sm text-muted-2">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="sm:col-span-7">
                  <h2 className="font-display text-2xl font-medium leading-snug tracking-tight sm:text-3xl">
                    {name}
                  </h2>
                  <p className="mt-2 max-w-prose text-base leading-7 text-muted">
                    {desc}
                  </p>
                </div>
                <div className="sm:col-span-4 sm:text-right">
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:text-primary-hover">
                    {dict.nav.book}
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
    </div>
  );
}
