import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import {
  getServiceBySlugPublic,
  listBookableChildServices,
  listDoctorsForService,
} from "@/lib/queries/catalog";
import { getDentists, getBranches } from "@/lib/itdoctor/client";
import { listDoctorsByITDoctorIds } from "@/lib/queries/admin";
import { BookingStepHeader } from "@/components/booking/BookingStepHeader";

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

  // Check if this parent has bookable children
  const children = await listBookableChildServices(service.id);

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
      <BookingStepHeader
        current={1}
        stepWord={dict.booking.step}
        ofWord={dict.booking.of}
        labels={[
          dict.nav.services,
          dict.nav.doctors,
          dict.booking.step_slot_title.replace(/[…—-].*$/, "").trim(),
          dict.booking.step_form_title.replace(/[…—-].*$/, "").trim(),
        ]}
        backHref={`/${lang}/book`}
        backLabel={dict.common.back}
        eyebrow={serviceName}
        title={lang === "mn" ? "Үйлчилгээ сонгох" : "Choose a service"}
        lede={
          lang === "mn"
            ? "Доорх үйлчилгээнүүдээс сонгоно уу"
            : "Select from the services below"
        }
      />

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
  // Thread the actual child service slug through to the slot picker and
  // confirm page so they can load the right duration_min / is_multi_visit.
  // Without this the confirm page falls back to the parent (e.g. "cosmetic"),
  // which has no duration set, and the ghost chain never fires.
  const serviceQs = sp.service ? `&service=${encodeURIComponent(sp.service)}` : "";
  const svcQs = `?service_name=${encodeURIComponent(selectedServiceName)}${serviceQs}${noteQs}`;

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
      // iDoctor's `/dentists` (no branch_id) returns only one branch's worth.
      // Fan out across every branch and dedupe by dentist id so multi-floor
      // clinics show all dentists, not just floor-1's first 9.
      const branches = await getBranches();
      if (branches.length === 0) {
        itDentists = await getDentists();
      } else {
        const perBranch = await Promise.all(
          branches.map((b) => getDentists(b.id).catch(() => [])),
        );
        const seen = new Map<number, (typeof perBranch)[number][number]>();
        for (const list of perBranch) {
          for (const d of list) if (!seen.has(d.id)) seen.set(d.id, d);
        }
        itDentists = Array.from(seen.values());
      }
    } catch { /* empty */ }
    try {
      dbDoctors = await listDoctorsByITDoctorIds();
    } catch { /* empty */ }
  }

  return (
    <>
      <BookingStepHeader
        current={2}
        stepWord={dict.booking.step}
        ofWord={dict.booking.of}
        labels={[
          dict.nav.services,
          dict.nav.doctors,
          dict.booking.step_slot_title.replace(/[…—-].*$/, "").trim(),
          dict.booking.step_form_title.replace(/[…—-].*$/, "").trim(),
        ]}
        backHref={sp.service ? `/${lang}/book/${slug}` : `/${lang}/book`}
        backLabel={dict.common.back}
        eyebrow={selectedServiceName}
        title={dict.booking.step_doctor_title}
        lede={dict.booking.step_doctor_lede}
      />

      <section className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8 sm:pb-28 sm:pt-14">
        {/* Doctor grid */}
        <ul className="grid gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
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
        className="flex items-center gap-4 overflow-hidden rounded-2xl bg-surface p-3 ring-1 ring-line transition-all hover:ring-primary/40 sm:block sm:rounded-[24px] sm:p-0 sm:hover:-translate-y-1 sm:hover:shadow-[0_18px_36px_-22px_rgba(26,132,120,0.3)]"
      >
        {/* Photo — small avatar on mobile, full cover on sm+ */}
        <div className="relative h-24 w-[76px] shrink-0 overflow-hidden rounded-xl bg-primary-soft sm:aspect-[4/5] sm:h-auto sm:w-full sm:rounded-none">
          {avatar ? (
            <Image
              src={avatar}
              alt={name}
              fill
              sizes="(max-width: 640px) 76px, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-display text-2xl text-muted-2 sm:text-6xl">
              {name.charAt(0)}
            </div>
          )}
          <span className="absolute right-3 top-3 hidden items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ink backdrop-blur sm:inline-flex">
            {badge}
          </span>
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1 sm:p-5">
          <h3 className="font-display text-[17px] font-bold leading-tight tracking-tight text-ink transition-colors group-hover:text-primary sm:text-[18px]">
            {name}
          </h3>
          {title && <p className="mt-1 text-[12px] text-muted">{title}</p>}
        </div>

        {/* Chevron — mobile only */}
        <svg
          aria-hidden
          className="shrink-0 text-muted-2 sm:hidden"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </Link>
    </li>
  );
}
