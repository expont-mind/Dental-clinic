import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import { getDepartmentBySlug } from "@/lib/queries/catalog";
import { getDentists } from "@/lib/itdoctor/client";
import { StepIndicator } from "@/components/booking/StepIndicator";
import { PatientForm } from "@/components/booking/PatientForm";
import { formatFull } from "@/lib/utils/datetime";

export default async function BookConfirmPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; deptSlug: string; doctorId: string }>;
  searchParams: Promise<{ slot?: string; branch_id?: string; service_name?: string }>;
}) {
  const { lang, deptSlug, doctorId } = await params;
  const { slot: slotDatetime, branch_id: branchIdStr, service_name: serviceName } = await searchParams;
  if (!hasLocale(lang)) notFound();
  if (!slotDatetime) notFound();
  const dict = await getDictionary(lang);

  const branchId = Number(branchIdStr || "1");
  const dept = await getDepartmentBySlug(deptSlug);
  if (!dept) notFound();

  const deptName = lang === "mn" ? dept.name_mn : dept.name_en;

  // Resolve dentist name from IT Doctor
  const numId = Number(doctorId);
  let dentistName = lang === "mn" ? "Дурын эмч" : "Any doctor";
  let dentistTitle = "";

  if (!isNaN(numId) && numId > 0) {
    try {
      const dentists = await getDentists();
      const d = dentists.find((dt) => dt.id === numId);
      if (d) {
        dentistName = `${d.lastname?.charAt(0) ?? ""}. ${d.firstname}`;
        dentistTitle = d.title ?? "";
      }
    } catch {
      // Use default
    }
  }

  // Format the slot datetime for display
  // slotDatetime is "2026-05-19 09:00:00" in UB time
  const when = formatFull(slotDatetime.replace(" ", "T") + "+08:00", lang as "mn" | "en");

  return (
    <>
      <StepIndicator
        current={4}
        stepWord={dict.booking.step}
        ofWord={dict.booking.of}
        labels={[
          dict.nav.services,
          dict.nav.doctors,
          dict.booking.step_slot_title.replace(/[…—-].*$/, "").trim(),
          dict.booking.step_form_title.replace(/[…—-].*$/, "").trim(),
        ]}
      />
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        <Link
          href={`/${lang}/book/${deptSlug}/${doctorId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
        >
          ← {dict.common.back}
        </Link>

        {/* Booking summary card */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-line bg-surface">
          <div className="flex items-center gap-4 border-b border-line p-5">
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-surface-2">
              <div className="flex h-full items-center justify-center font-display text-2xl text-muted-2">
                {dentistName.charAt(0)}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-2">
                {deptName}
              </p>
              <p className="truncate font-display text-lg font-medium leading-tight">
                {dentistName}
              </p>
              {dentistTitle && (
                <p className="truncate text-xs text-muted">{dentistTitle}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <div className="p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-2">
                {dict.booking.step_slot_title.split(" ")[0]}
              </p>
              <p className="mt-1.5 font-display text-base font-medium">
                {when}
              </p>
            </div>
            <div className="p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-2">
                Asia/Ulaanbaatar
              </p>
              <p className="mt-1.5 text-sm text-ink-2">UTC+8</p>
            </div>
          </div>
        </section>

        {/* Form */}
        <header className="mt-10">
          <h1 className="font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
            {dict.booking.step_form_title}
          </h1>
          <p className="mt-3 text-base text-muted">
            {dict.booking.step_form_lede}
          </p>
        </header>

        <PatientForm
          lang={lang}
          slotId={slotDatetime}
          deptSlug={deptSlug}
          doctorId={doctorId}
          branchId={branchId}
          serviceName={serviceName ?? deptName}
          dict={dict}
        />
      </div>
    </>
  );
}
