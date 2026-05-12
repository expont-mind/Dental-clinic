import Link from "next/link";
import Image from "next/image";
import { listDoctorsPreview } from "@/lib/queries/catalog";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export async function DoctorsPreview({
  lang,
  dict,
}: {
  lang: string;
  dict: Dictionary;
}) {
  const doctors = await listDoctorsPreview(3);
  if (doctors.length === 0) return null;

  return (
    <section>
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="font-script text-[34px] leading-none text-primary sm:text-[42px]">
              {dict.home.doctors_eyebrow}
            </p>
            <h2 className="mt-3 text-[32px] font-extrabold uppercase leading-[1.05] tracking-tight text-ink sm:text-[44px]">
              {dict.home.doctors_title}
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-7 text-muted">
              {dict.home.doctors_lede}
            </p>
          </div>
          <Link
            href={`/${lang}/doctors`}
            className="text-[14px] font-semibold text-primary-ink hover:text-ink"
          >
            {dict.home.doctors_cta}
          </Link>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-3">
          {doctors.map((d) => {
            const name = lang === "mn" ? d.name_mn : d.name_en;
            const title = lang === "mn" ? d.title_mn : d.title_en;
            const deptName =
              lang === "mn" ? d.department.name_mn : d.department.name_en;
            return (
              <li key={d.id} className="group">
                <Link href={`/${lang}/doctors/${d.slug}`} className="block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-surface-2">
                    {d.photo_url ? (
                      <Image
                        src={d.photo_url}
                        alt={name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-display text-6xl text-muted-2">
                        {name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-2 backdrop-blur">
                      {deptName}
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-xl font-medium leading-tight tracking-tight">
                      {name}
                    </h3>
                    {d.years_exp != null && (
                      <span className="text-xs text-muted-2 whitespace-nowrap">
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
      </div>
    </section>
  );
}
