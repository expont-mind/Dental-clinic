import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import {
  getServiceBySlugPublic,
  listChildServices,
  listDoctorsForService,
} from "@/lib/queries/catalog";
import { getDentists, getBranches } from "@/lib/itdoctor/client";
import { listDoctorsByITDoctorIds } from "@/lib/queries/admin";
import { StepIndicator } from "@/components/booking/StepIndicator";

export default async function BookServiceOrDoctorPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; deptSlug: string }>;
  searchParams: Promise<{ service?: string; service_name?: string; doctor?: string; note?: string }>;
}) {
  const { lang, deptSlug: slug } = await params;
  const sp = await searchParams;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  // Find this service
  const service = await getServiceBySlugPublic(slug);
  if (!service) notFound();

  const serviceName = lang === "mn" ? service.name_mn : service.name_en;

  // If a specific child service was already selected (via ?service=slug), go to doctor selection
  if (sp.service) {
    return renderDoctorSelection({ lang, slug, sp, dict, parentName: serviceName });
  }

  // Check if this parent has children
  const children = await listChildServices(service.id);

  if (children.length === 0) {
    // No children — this is a leaf service, go straight to doctor selection
    return renderDoctorSelection({
      lang,
      slug,
      sp: { ...sp, service: slug, service_name: serviceName },
      dict,
      parentName: serviceName,
    });
  }

  // Show children grid (Step 1.5: pick a specific sub-service)
  return (
    <>
      <section className="relative overflow-hidden bg-primary-soft">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/40 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />

        <StepIndicator
          variant="onSoft"
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

        <div className="relative mx-auto max-w-3xl px-5 pt-10 pb-14 text-center sm:px-8 sm:pt-12 sm:pb-16">
          <Link
            href={`/${lang}/book`}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted hover:text-ink"
          >
            ← {dict.common.back}
          </Link>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            ◦ {serviceName}
          </p>
          <h1 className="mt-2 text-[32px] font-extrabold uppercase leading-[1.05] tracking-tight text-ink sm:text-[44px]">
            {lang === "mn" ? "Үйлчилгээ сонгох" : "Choose a service"}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[14px] leading-7 text-muted sm:text-[15px]">
            {lang === "mn"
              ? "Доорх үйлчилгээнүүдээс сонгоно уу"
              : "Select from the services below"}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-20 pt-10 sm:px-8 sm:pb-28 sm:pt-14">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => {
            const name = lang === "mn" ? child.name_mn : child.name_en;
            const price = child.price_cents
              ? `${(child.price_cents / 100).toLocaleString()}₮`
              : child.price_text_mn ?? null;

            return (
              <li key={child.id}>
                <Link
                  href={`/${lang}/book/${slug}?service=${child.slug}&service_name=${encodeURIComponent(name)}`}
                  className="group flex h-full items-center justify-between gap-3 rounded-[18px] bg-surface p-4 ring-1 ring-line transition-all hover:-translate-y-0.5 hover:ring-primary/40 hover:shadow-[0_12px_28px_-16px_rgba(26,132,120,0.25)] sm:p-5"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[13px] font-bold text-ink group-hover:text-primary transition-colors">
                      {name}
                    </h3>
                    {child.description_mn && (
                      <p className="mt-1 text-[11px] text-muted line-clamp-2">
                        {lang === "mn" ? child.description_mn : child.description_en}
                      </p>
                    )}
                  </div>
                  {price && (
                    <span className="shrink-0 text-[13px] font-bold text-primary">
                      {price}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}

// ---------- Doctor selection (step 2) ----------

async function renderDoctorSelection({
  lang,
  slug,
  sp,
  dict,
  parentName,
}: {
  lang: string;
  slug: string;
  sp: { service?: string; service_name?: string; doctor?: string; note?: string };
  dict: Awaited<ReturnType<typeof import("@/lib/i18n/dictionaries").getDictionary>>;
  parentName: string;
}) {
  const selectedServiceName = sp.service_name || parentName;
  const noteQs = sp.note ? `&note=${encodeURIComponent(sp.note)}` : "";
  const svcQs = `?service_name=${encodeURIComponent(selectedServiceName)}${noteQs}`;

  // If doctor query param, skip to slot picker
  if (sp.doctor) {
    redirect(`/${lang}/book/${slug}/${sp.doctor}${svcQs}`);
  }

  // Try to find service for doctor filtering
  let serviceForFilter: Awaited<ReturnType<typeof getServiceBySlugPublic>> | null = null;
  if (sp.service) {
    serviceForFilter = await getServiceBySlugPublic(sp.service);
  }

  // Get doctors assigned to this service
  let doctors: Awaited<ReturnType<typeof listDoctorsForService>> = [];
  if (serviceForFilter) {
    doctors = await listDoctorsForService(serviceForFilter.id);
  }

  // Fallback: if no assigned doctors, show all IT Doctor dentists
  let itDentists: Awaited<ReturnType<typeof getDentists>> = [];
  let dbDoctors: Awaited<ReturnType<typeof listDoctorsByITDoctorIds>> = [];

  if (doctors.length === 0) {
    try {
      const branches = await getBranches();
      itDentists = await getDentists(branches[0]?.id);
    } catch { /* empty */ }
    try {
      dbDoctors = await listDoctorsByITDoctorIds();
    } catch { /* empty */ }
  }

  return (
    <>
      <section className="relative overflow-hidden bg-primary-soft">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/40 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />

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
            href={sp.service ? `/${lang}/book/${slug}` : `/${lang}/book`}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted hover:text-ink"
          >
            ← {dict.common.back}
          </Link>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            ◦ {selectedServiceName}
          </p>
          <h1 className="mt-2 text-[32px] font-extrabold uppercase leading-[1.05] tracking-tight text-ink sm:text-[44px]">
            {dict.booking.step_doctor_title}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[14px] leading-7 text-muted sm:text-[15px]">
            {dict.booking.step_doctor_lede}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8 sm:pb-28 sm:pt-14">
        {/* Any doctor option */}
        <Link
          href={`/${lang}/book/${slug}/0${svcQs}`}
          className="mb-6 block overflow-hidden rounded-[24px] bg-surface ring-1 ring-line transition-all hover:-translate-y-1 hover:ring-primary/40 hover:shadow-[0_18px_36px_-22px_rgba(26,132,120,0.3)]"
        >
          <div className="flex items-center gap-4 p-5 sm:p-6">
            <span className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-[14px] font-extrabold uppercase tracking-wide text-ink">
                {lang === "mn" ? "Дурын эмч" : "Any available doctor"}
              </h2>
              <p className="mt-1 text-[12.5px] leading-6 text-muted">
                {lang === "mn"
                  ? "Хамгийн ойрын боломжит цагийг автоматаар сонгоно"
                  : "Automatically picks the earliest available slot"}
              </p>
            </div>
            <span className="text-[11px] font-bold text-primary">{dict.common.select} →</span>
          </div>
        </Link>

        {/* Doctor grid */}
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.length > 0
            ? doctors.map((d) => {
                const name = lang === "mn" ? d.name_mn : d.name_en;
                const title = lang === "mn" ? d.title_mn : d.title_en;
                const doctorUrlId = d.itdoctor_dentist_id ?? d.id;
                return (
                  <DoctorCard
                    key={d.id}
                    href={`/${lang}/book/${slug}/${doctorUrlId}${svcQs}`}
                    name={name}
                    title={title}
                    avatar={d.photo_url}
                    badge={selectedServiceName}
                  />
                );
              })
            : itDentists.map((d) => {
                const match = dbDoctors.find((db) => db.itdoctor_dentist_id === d.id);
                const name = match
                  ? lang === "mn" ? match.name_mn : match.name_en
                  : `${d.lastname?.charAt(0) ?? ""}. ${d.firstname}`;
                const title = match
                  ? (lang === "mn" ? match.title_mn : match.title_en)
                  : d.title;
                return (
                  <DoctorCard
                    key={d.id}
                    href={`/${lang}/book/${slug}/${d.id}${svcQs}`}
                    name={name}
                    title={title}
                    avatar={match?.photo_url ?? d.avatar}
                    badge={selectedServiceName}
                  />
                );
              })}
        </ul>
        {doctors.length === 0 && itDentists.length === 0 && (
          <p className="mt-12 text-center text-muted">{dict.common.empty}</p>
        )}
      </section>
    </>
  );
}

function DoctorCard({
  href,
  name,
  title,
  avatar,
  badge,
}: {
  href: string;
  name: string;
  title: string | null;
  avatar: string | null;
  badge: string;
}) {
  return (
    <li className="group">
      <Link
        href={href}
        className="block overflow-hidden rounded-[24px] bg-surface ring-1 ring-line transition-all hover:-translate-y-1 hover:ring-primary/40 hover:shadow-[0_18px_36px_-22px_rgba(26,132,120,0.3)]"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-primary-soft">
          {avatar ? (
            <Image
              src={avatar}
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
            {badge}
          </span>
        </div>
        <div className="p-4 sm:p-5">
          <h3 className="font-display text-[18px] font-bold leading-tight tracking-tight text-ink group-hover:text-primary transition-colors">
            {name}
          </h3>
          {title && <p className="mt-1 text-[12px] text-muted">{title}</p>}
        </div>
      </Link>
    </li>
  );
}
