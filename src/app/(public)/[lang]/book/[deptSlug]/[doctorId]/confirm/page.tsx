import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import { getDepartmentBySlug, getServiceBySlugPublic } from "@/lib/queries/catalog";
import { getDentists } from "@/lib/itdoctor/client";
import { getCurrentUser } from "@/lib/actions/auth";
import { formatMongolianPhone } from "@/lib/utils/phone";
import { serviceMeta } from "@/lib/utils/service-format";
import { BookingStepHeader } from "@/components/booking/BookingStepHeader";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { PatientForm } from "@/components/booking/PatientForm";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { formatFull } from "@/lib/utils/datetime";

export default async function BookConfirmPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; deptSlug: string; doctorId: string }>;
  searchParams: Promise<{ slot?: string; branch_id?: string; service_name?: string; service?: string }>;
}) {
  const { lang, deptSlug, doctorId } = await params;
  const { slot: slotDatetime, branch_id: branchIdStr, service_name: serviceName, service: childServiceSlug } = await searchParams;
  if (!hasLocale(lang)) notFound();
  if (!slotDatetime) notFound();
  const dict = await getDictionary(lang);
  const currentUser = await getCurrentUser();

  const branchId = Number(branchIdStr || "1");
  // Prefer the child service slug carried through the booking flow — that's
  // where duration_min / is_multi_visit actually live. Fall back to the
  // dept-slug lookup so older links and direct deep-links still resolve.
  const service =
    (childServiceSlug
      ? await getServiceBySlugPublic(childServiceSlug).catch(() => null)
      : null) ?? (await getServiceBySlugPublic(deptSlug).catch(() => null));
  const dept = service ? null : await getDepartmentBySlug(deptSlug);
  if (!service && !dept) notFound();

  const deptName = service
    ? (lang === "mn" ? service.name_mn : service.name_en)
    : (lang === "mn" ? dept!.name_mn : dept!.name_en);

  // Resolve dentist name from IT Doctor
  const numId = Number(doctorId);
  let dentistName = lang === "mn" ? "Дурын эмч" : "Any doctor";
  let dentistTitle = "";
  let dentistPhoto: string | null = null;

  if (!isNaN(numId) && numId > 0) {
    try {
      const dentists = await getDentists();
      const d = dentists.find((dt) => dt.id === numId);
      if (d) {
        dentistName = `${d.lastname?.charAt(0) ?? ""}. ${d.firstname}`;
        dentistTitle = d.title ?? "";
        dentistPhoto = d.avatar;
      }
    } catch {
      // Use default
    }
  }

  const { priceLabel, durationLabel } = serviceMeta(service, lang);

  // Format the slot datetime for display
  // slotDatetime is "2026-05-19 09:00:00" in UB time
  const when = formatFull(slotDatetime.replace(" ", "T") + "+08:00", lang as "mn" | "en");

  return (
    <>
      <BookingStepHeader
        current={4}
        stepWord={dict.booking.step}
        ofWord={dict.booking.of}
        labels={[
          dict.nav.services,
          dict.nav.doctors,
          dict.booking.step_slot_title.replace(/[…—-].*$/, "").trim(),
          dict.booking.step_form_title.replace(/[…—-].*$/, "").trim(),
        ]}
        backHref={`/${lang}/book/${deptSlug}/${doctorId}`}
        backLabel={dict.common.back}
        eyebrow={deptName}
        title={dict.booking.step_form_title}
        lede={dict.booking.step_form_lede}
      />
      <Container size="lg" className="py-8 sm:py-12">
        {/* Booking summary card */}
        <BookingSummary
          serviceLabel={deptName}
          doctorName={dentistName}
          doctorTitle={dentistTitle}
          photoUrl={dentistPhoto}
          when={when}
          tzNote={dict.booking.summary_tz}
          durationLabel={durationLabel}
          priceLabel={priceLabel}
          labels={{
            when: dict.booking.summary_when,
            duration: dict.booking.summary_duration,
            price: dict.booking.summary_price,
          }}
        />

        {/* Consultation banner — multi-visit services book a planning
            visit, not the procedure. Tell the customer so reception
            doesn't field "but I thought I was getting the implant today?". */}
        {service?.is_multi_visit && (
          <Card
            variant="outline"
            className="mt-8 border-amber-200 bg-amber-50/60 p-5"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
              ⓵ {dict.booking.consult_eyebrow}
            </p>
            <p className="mt-1.5 font-display text-[17px] font-bold text-amber-950">
              {dict.booking.consult_title}
            </p>
            <p className="mt-2 text-[13px] leading-6 text-amber-900">
              {dict.booking.consult_body}
            </p>
          </Card>
        )}

        {/* Form */}
        <div className="mt-8">
          <PatientForm
          lang={lang}
          slotId={slotDatetime}
          deptSlug={deptSlug}
          doctorId={doctorId}
          branchId={branchId}
          serviceName={serviceName ?? deptName}
          serviceNameMn={service?.name_mn ?? dept?.name_mn ?? serviceName ?? deptName}
          isMultiVisit={service?.is_multi_visit ?? false}
          durationMin={service?.duration_min ?? null}
          defaultName={currentUser?.name}
          defaultPhone={
            currentUser?.phone
              ? formatMongolianPhone(currentUser.phone)
              : undefined
          }
          dict={dict}
          />
        </div>
      </Container>
    </>
  );
}
