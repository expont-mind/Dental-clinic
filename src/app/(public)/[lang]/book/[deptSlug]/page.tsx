import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import { getDepartmentBySlug, listDoctors } from "@/lib/queries/catalog";
import { StepIndicator } from "@/components/booking/StepIndicator";

export default async function BookPickDoctorPage({
  params,
}: {
  params: Promise<{ lang: string; deptSlug: string }>;
}) {
  const { lang, deptSlug } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const dept = await getDepartmentBySlug(deptSlug);
  if (!dept) notFound();
  const doctors = await listDoctors({ departmentSlug: deptSlug });
  const deptName = lang === "mn" ? dept.name_mn : dept.name_en;

  return (
    <>
      <StepIndicator
        current={2}
        stepWord={dict.booking.step}
        ofWord={dict.booking.of}
        labels={[
          dict.nav.services,
          dict.nav.doctors,
          dict.booking.step_slot_title.replace(/[…—-].*$/, "").trim(),
          dict.booking.step_form_title.replace(/[…—-].*$/, "").trim(),
        ]}
      />
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <Link
          href={`/${lang}/book`}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
        >
          ← {dict.common.back}
        </Link>
        <header className="mt-6">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
            ◦ {deptName}
          </p>
          <h1 className="font-display mt-3 text-3xl font-medium leading-tight tracking-tight sm:text-5xl">
            {dict.booking.step_doctor_title}
          </h1>
          <p className="mt-3 text-base text-muted sm:text-lg">
            {dict.booking.step_doctor_lede}
          </p>
        </header>

        <ul className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((d) => {
            const name = lang === "mn" ? d.name_mn : d.name_en;
            const title = lang === "mn" ? d.title_mn : d.title_en;
            return (
              <li key={d.id}>
                <Link
                  href={`/${lang}/book/${deptSlug}/${d.id}`}
                  className="group block"
                >
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
        {doctors.length === 0 && (
          <p className="mt-12 text-center text-muted">{dict.common.empty}</p>
        )}
      </div>
    </>
  );
}
