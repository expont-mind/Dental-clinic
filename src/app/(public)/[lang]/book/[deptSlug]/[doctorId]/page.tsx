import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import { getDepartmentBySlug } from "@/lib/queries/catalog";
import { getDentists, getBranches } from "@/lib/itdoctor/client";
import { listDoctorsByITDoctorIds } from "@/lib/queries/admin";
import { StepIndicator } from "@/components/booking/StepIndicator";
import { SlotPicker } from "@/components/booking/SlotPicker";

export default async function BookPickSlotPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; deptSlug: string; doctorId: string }>;
  searchParams: Promise<{ service_id?: string; service_name?: string; note?: string }>;
}) {
  const { lang, deptSlug, doctorId } = await params;
  const { service_id: serviceId, service_name: serviceName, note: prefillNote } = await searchParams;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  // Try service slug first, fall back to department
  const service = await import("@/lib/queries/catalog").then(m => m.getServiceBySlugPublic(deptSlug)).catch(() => null);
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

  try {
    const branches = await getBranches();
    if (branches.length > 0) itBranchId = branches[0].id;
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

  return (
    <>
      {/* Hero + step bar */}
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
          current={3}
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
            href={`/${lang}/book/${deptSlug}`}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted hover:text-ink"
          >
            ← {dict.common.back}
          </Link>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            ◦ {displayName}
          </p>
          <h1 className="mt-2 text-[32px] font-extrabold uppercase leading-[1.05] tracking-tight text-ink sm:text-[44px]">
            {dict.booking.step_slot_title}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[14px] leading-7 text-muted sm:text-[15px]">
            {dict.booking.step_slot_lede}
          </p>
        </div>
      </section>

      {/* Doctor summary + slot picker */}
      <section className="mx-auto max-w-4xl px-5 pb-20 pt-10 sm:px-8 sm:pb-28 sm:pt-12">
        <div className="flex items-center gap-4 rounded-[20px] bg-surface p-4 ring-1 ring-line shadow-[0_8px_20px_-12px_rgba(26,132,120,0.18)]">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-primary-soft">
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={name}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-display text-2xl text-muted-2">
                {name.charAt(0)}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              {displayName}
            </p>
            <p className="font-display mt-0.5 truncate text-[18px] font-bold leading-tight text-ink">
              {name}
            </p>
            {title && (
              <p className="mt-0.5 truncate text-[12px] text-muted">{title}</p>
            )}
          </div>
        </div>

        <SlotPicker
          dentistId={itDentistId}
          branchId={itBranchId}
          serviceName={displayName}
          confirmHrefPrefix={`/${lang}/book/${deptSlug}/${doctorId}/confirm`}
          emptyLabel={dict.booking.no_slots}
          lang={lang}
        />
      </section>
    </>
  );
}
