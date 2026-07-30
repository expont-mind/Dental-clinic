import { notFound, redirect } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import { getDepartmentBySlug, getServiceBySlugPublic } from "@/lib/queries/catalog";
import { getDentists, getBranches, resolveDentistBranch } from "@/lib/itdoctor/client";
import { listDoctorsByITDoctorIds } from "@/lib/queries/admin";
import { serviceMeta } from "@/lib/utils/service-format";
import { BookingStepHeader } from "@/components/booking/BookingStepHeader";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { SlotPicker } from "@/components/booking/SlotPicker";

export default async function BookPickSlotPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; deptSlug: string; doctorId: string }>;
  searchParams: Promise<{ service?: string; service_id?: string; service_name?: string; note?: string }>;
}) {
  const { lang, deptSlug, doctorId } = await params;
  const { service: childServiceSlug, service_name: serviceName, note: prefillNote } = await searchParams;
  if (!hasLocale(lang)) notFound();

  // "Any doctor" was retired — every booking must target a specific dentist
  // so the ghost chain stays pinned to one person. Old deep-links with
  // doctorId=0 redirect back to the doctor picker preserving service params.
  if (doctorId === "0") {
    const qs = new URLSearchParams();
    if (childServiceSlug) qs.set("service", childServiceSlug);
    if (serviceName) qs.set("service_name", serviceName);
    if (prefillNote) qs.set("note", prefillNote);
    const tail = qs.toString() ? `?${qs.toString()}` : "";
    redirect(`/${lang}/book/${deptSlug}${tail}`);
  }

  const dict = await getDictionary(lang);

  // Prefer the child service slug carried through the booking flow — that's
  // where duration_min / is_multi_visit actually live, and the slot picker
  // needs the real duration to hide starts that can't fit the full window.
  // Fall back to the dept-slug lookup so older links still resolve. MUST match
  // the confirm page's resolution, or the picker filters on the wrong duration
  // and offers slots the booking then rejects.
  const service =
    (childServiceSlug
      ? await getServiceBySlugPublic(childServiceSlug).catch(() => null)
      : null) ?? (await getServiceBySlugPublic(deptSlug).catch(() => null));
  const dept = service ? null : await getDepartmentBySlug(deptSlug);
  if (!service && !dept) notFound();

  const displayName = serviceName || (service ? (lang === "mn" ? service.name_mn : service.name_en) : (lang === "mn" ? dept!.name_mn : dept!.name_en));

  // Resolve IT Doctor dentist ID and branch
  let itDentistId = 0;
  let itBranchId = 1;

  const numId = Number(doctorId);
  if (!isNaN(numId) && numId > 0) {
    itDentistId = numId;
  }

  // Ask iDoctor which branch this dentist actually works at. Falls back to
  // the first branch (or hardcoded 1) so the slot picker never sees 0.
  try {
    if (itDentistId > 0) {
      itBranchId = await resolveDentistBranch(itDentistId);
    } else {
      const branches = await getBranches();
      if (branches.length > 0) itBranchId = branches[0].id;
    }
  } catch {
    // Use default
  }

  // Resolve display info: try Supabase match first, then IT Doctor API
  let name = "";
  let title = "";
  let photoUrl: string | null = null;

  // Check Supabase for enriched doctor data
  if (itDentistId > 0) {
    try {
      const dbDoctors = await listDoctorsByITDoctorIds();
      const match = dbDoctors.find((d) => d.itdoctor_dentist_id === itDentistId);
      if (match) {
        name = lang === "mn" ? match.name_mn : match.name_en;
        title = (lang === "mn" ? match.title_mn : match.title_en) ?? "";
        photoUrl = match.photo_url;
      }
    } catch {
      // No enrichment
    }
  }

  // Fallback to IT Doctor API data
  if (!name && itDentistId > 0) {
    try {
      const dentists = await getDentists();
      const d = dentists.find((dt) => dt.id === itDentistId);
      if (d) {
        name = `${d.lastname?.charAt(0) ?? ""}. ${d.firstname}`;
        title = d.title ?? "";
        photoUrl = d.avatar;
      }
    } catch {
      // Fallback
    }
  }

  if (!name) {
    name = lang === "mn" ? "Дурын эмч" : "Any doctor";
  }

  const { priceLabel, durationLabel } = serviceMeta(service, lang);

  return (
    <>
      <BookingStepHeader
        current={3}
        stepWord={dict.booking.step}
        ofWord={dict.booking.of}
        labels={[
          dict.nav.services,
          dict.nav.doctors,
          dict.booking.step_slot_title.replace(/[…—-].*$/, "").trim(),
          dict.booking.step_form_title.replace(/[…—-].*$/, "").trim(),
        ]}
        backHref={`/${lang}/book/${deptSlug}`}
        backLabel={dict.common.back}
        eyebrow={displayName}
        title={dict.booking.step_slot_title}
        lede={dict.booking.step_slot_lede}
      />

      {/* Doctor summary + slot picker */}
      <section className="mx-auto max-w-4xl px-5 pb-20 pt-10 sm:px-8 sm:pb-28 sm:pt-12">
        <BookingSummary
          serviceLabel={displayName}
          doctorName={name}
          doctorTitle={title}
          photoUrl={photoUrl}
          durationLabel={durationLabel}
          priceLabel={priceLabel}
          labels={{
            when: dict.booking.summary_when,
            duration: dict.booking.summary_duration,
            price: dict.booking.summary_price,
          }}
        />

        <SlotPicker
          dentistId={itDentistId}
          branchId={itBranchId}
          durationMin={service?.duration_min ?? null}
          serviceName={displayName}
          serviceSlug={childServiceSlug ?? null}
          confirmHrefPrefix={`/${lang}/book/${deptSlug}/${doctorId}/confirm`}
          emptyLabel={dict.booking.no_slots}
          lang={lang}
        />
      </section>
    </>
  );
}
