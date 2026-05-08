import Link from "next/link";
import { listDepartments } from "@/lib/queries/catalog";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const DEPT_ICONS: Record<string, string> = {
  internal: "M12 2v20M5 8h14M5 16h14",
  pediatrics:
    "M12 12c2.5 0 4-2 4-4.5S14.5 3 12 3 8 5 8 7.5 9.5 12 12 12Zm-6 9c0-3 2.7-5 6-5s6 2 6 5",
  cardiology:
    "M3 12h4l2-7 4 14 2-7h6",
  dermatology:
    "M5 12c0-4 3-7 7-7s7 3 7 7-3 7-7 7M9 9h.01M15 9h.01M9 13c1 1 2 1.5 3 1.5s2-.5 3-1.5",
  dental:
    "M8 3c-2 0-4 1.5-4 4 0 1 .3 2 .8 3.2C5.5 12 6 13.5 6.5 16c.4 2 1 4 2 4 1.2 0 1.5-2 1.7-3.5.1-1 .8-1.5 1.8-1.5s1.7.5 1.8 1.5c.2 1.5.5 3.5 1.7 3.5 1 0 1.6-2 2-4 .5-2.5 1-4 1.7-5.8.5-1.2.8-2.2.8-3.2 0-2.5-2-4-4-4-1.5 0-2 .5-4 .5S9.5 3 8 3Z",
};

export async function ServicesGrid({
  lang,
  dict,
}: {
  lang: string;
  dict: Dictionary;
}) {
  const departments = await listDepartments();

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
      <div className="flex items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
            ◦ {dict.nav.services}
          </p>
          <h2 className="font-display mt-3 text-3xl font-medium leading-tight tracking-tight sm:text-5xl">
            {dict.home.services_title}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted sm:text-lg">
            {dict.home.services_lede}
          </p>
        </div>
      </div>

      <ul className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((d) => {
          const name = lang === "mn" ? d.name_mn : d.name_en;
          const desc = lang === "mn" ? d.description_mn : d.description_en;
          const iconPath =
            (d.icon_key && DEPT_ICONS[d.slug]) || DEPT_ICONS.internal;
          return (
            <li key={d.id} className="bg-surface">
              <Link
                href={`/${lang}/book/${d.slug}`}
                className="group flex h-full flex-col gap-5 p-7 transition-colors hover:bg-primary-soft/40"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary-ink transition-transform group-hover:-translate-y-0.5">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={iconPath} />
                  </svg>
                </span>
                <div>
                  <h3 className="font-display text-xl font-medium leading-tight tracking-tight text-ink">
                    {name}
                  </h3>
                  <p className="mt-2 text-[15px] leading-7 text-muted">
                    {desc}
                  </p>
                </div>
                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  {dict.nav.book}
                  <span className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
