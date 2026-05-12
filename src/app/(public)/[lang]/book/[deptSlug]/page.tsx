import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import { getDepartmentBySlug, listDoctors } from "@/lib/queries/catalog";
import { StepIndicator } from "@/components/booking/StepIndicator";

export default async function BookPickDoctorPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; deptSlug: string }>;
  searchParams: Promise<{ doctor?: string }>;
}) {
  const { lang, deptSlug } = await params;
  const { doctor: doctorIdQuery } = await searchParams;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const dept = await getDepartmentBySlug(deptSlug);
  if (!dept) notFound();
  const doctors = await listDoctors({ departmentSlug: deptSlug });
  const deptName = lang === "mn" ? dept.name_mn : dept.name_en;

  // If query param points at a doctor in this department, skip step 2.
  if (doctorIdQuery) {
    const target = doctors.find((d) => d.id === doctorIdQuery);
    if (target) {
      redirect(`/${lang}/book/${deptSlug}/${target.id}`);
    }
  }

  return (
    <>
      {/* Hero + step bar — unified block */}
      <section className="relative overflow-hidden bg-primary-soft">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-primary/30 blur-3xl"
        />

        <StepIndicator
          variant="onSoft"
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

        <div className="relative mx-auto max-w-3xl px-5 pt-10 pb-14 text-center sm:px-8 sm:pt-12 sm:pb-16">
          <Link
            href={`/${lang}/book`}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted hover:text-ink"
          >
            ← {dict.common.back}
          </Link>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            ◦ {deptName}
          </p>
          <h1 className="mt-2 text-[32px] font-extrabold uppercase leading-[1.05] tracking-tight text-ink sm:text-[44px]">
            {dict.booking.step_doctor_title}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[14px] leading-7 text-muted sm:text-[15px]">
            {dict.booking.step_doctor_lede}
          </p>
        </div>
      </section>

      {/* Doctor grid */}
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8 sm:pb-28 sm:pt-14">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((d) => {
            const name = lang === "mn" ? d.name_mn : d.name_en;
            return (
              <li key={d.id} className="group">
                <Link
                  href={`/${lang}/book/${deptSlug}/${d.id}`}
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
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ink backdrop-blur">
                      {deptName}
                    </span>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className="font-display text-[18px] font-bold leading-tight tracking-tight text-ink group-hover:text-primary transition-colors">
                      {name}
                    </h3>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
        {doctors.length === 0 && (
          <p className="mt-12 text-center text-muted">{dict.common.empty}</p>
        )}
      </section>
    </>
  );
}
