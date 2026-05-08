import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import { listDepartments } from "@/lib/queries/catalog";
import { StepIndicator } from "@/components/booking/StepIndicator";

export default async function BookStartPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const departments = await listDepartments();

  return (
    <>
      <StepIndicator
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
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <header>
          <h1 className="font-display text-3xl font-medium leading-tight tracking-tight sm:text-5xl">
            {dict.booking.step_dept_title}
          </h1>
          <p className="mt-3 text-base text-muted sm:text-lg">
            {dict.booking.step_dept_lede}
          </p>
        </header>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {departments.map((d) => {
            const name = lang === "mn" ? d.name_mn : d.name_en;
            const desc = lang === "mn" ? d.description_mn : d.description_en;
            return (
              <li key={d.id}>
                <Link
                  href={`/${lang}/book/${d.slug}`}
                  className="group flex h-full flex-col gap-3 rounded-2xl border border-line bg-surface p-6 transition-all hover:border-primary/40 hover:shadow-[0_8px_24px_-12px_rgb(13_110_114/0.4)]"
                >
                  <h2 className="font-display text-xl font-medium tracking-tight">
                    {name}
                  </h2>
                  <p className="text-sm leading-6 text-muted">{desc}</p>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    {dict.common.select}
                    <span className="transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
