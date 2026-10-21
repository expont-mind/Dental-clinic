import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import {
  listBookableChildServices,
  listBookableParentServicesPublic,
} from "@/lib/queries/catalog";
import { BookingStepHeader } from "@/components/booking/BookingStepHeader";
import { getClinicContact } from "@/lib/queries/clinic";

const ICON_PATHS: Record<string, string> = {
  implant: "M12 2v10M9 5h6M8 12h8l-1 8a3 3 0 0 1-3 3h-0a3 3 0 0 1-3-3l-1-8z",
  braces: "M4 8h16v3a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4V8zM8 8v7M12 8v7M16 8v7",
  surgery: "M8 3c-2 0-4 1.5-4 4 0 1 .3 2 .8 3.2.7 1.8 1.2 3.3 1.7 5.8.4 2 1 4 2 4 1.2 0 1.5-2 1.7-3.5.1-1 .8-1.5 1.8-1.5s1.7.5 1.8 1.5c.2 1.5.5 3.5 1.7 3.5 1 0 1.6-2 2-4M16 4l4 4-3 3-4-4z",
  kid: "M8 3c-2 0-4 1.5-4 4 0 1 .3 2 .8 3.2.7 1.8 1.2 3.3 1.7 5.8.4 2 1 4 2 4 1.2 0 1.5-2 1.7-3.5.1-1 .8-1.5 1.8-1.5s1.7.5 1.8 1.5c.2 1.5.5 3.5 1.7 3.5 1 0 1.6-2 2-4 .5-2.5 1-4 1.7-5.8.5-1.2.8-2.2.8-3.2 0-2.5-2-4-4-4M9 12h.01M15 12h.01",
  routine: "M8 3c-2 0-4 1.5-4 4 0 1 .3 2 .8 3.2.7 1.8 1.2 3.3 1.7 5.8.4 2 1 4 2 4 1.2 0 1.5-2 1.7-3.5.1-1 .8-1.5 1.8-1.5s1.7.5 1.8 1.5c.2 1.5.5 3.5 1.7 3.5 1 0 1.6-2 2-4M9 10l2 2 4-4",
  hygiene: "M3 21l4-4 6-6 5 5-6 6-4 4zM13 11l4-4 3 3-4 4M14 6l4 4",
  crown: "M3 18h18l-1.5-9-4 4-3.5-7-3.5 7-4-4z",
  gum: "M4 12c0-4 3-7 8-7s8 3 8 7v6H4zM8 18l-1 4M16 18l1 4M12 18v4",
  smile: "M8 3c-2 0-4 1.5-4 4 0 1 .3 2 .8 3.2.7 1.8 1.2 3.3 1.7 5.8.4 2 1 4 2 4 1.2 0 1.5-2 1.7-3.5.1-1 .8-1.5 1.8-1.5s1.7.5 1.8 1.5c.2 1.5.5 3.5 1.7 3.5 1 0 1.6-2 2-4M19 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1z",
};

const DEFAULT_ICON =
  "M8 3c-2 0-4 1.5-4 4 0 1 .3 2 .8 3.2.7 1.8 1.2 3.3 1.7 5.8.4 2 1 4 2 4 1.2 0 1.5-2 1.7-3.5.1-1 .8-1.5 1.8-1.5s1.7.5 1.8 1.5c.2 1.5.5 3.5 1.7 3.5 1 0 1.6-2 2-4M9 10l2 2 4-4";

// Top-visited service slugs — shown with a "popular" badge
const POPULAR_SLUGS = new Set(["general", "orthodontics", "implant"]);

export default async function BookStartPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const isMn = lang === "mn";

  const [services, contact] = await Promise.all([
    listBookableParentServicesPublic(),
    getClinicContact(lang),
  ]);

  // Enrich with child count + min price
  const enriched = await Promise.all(
    services.map(async (s) => {
      const children = await listBookableChildServices(s.id);
      const prices = children
        .map((c) => c.price_cents)
        .filter((v): v is number => v != null && v > 0);
      return {
        ...s,
        childCount: children.length,
        minPrice: prices.length > 0 ? Math.min(...prices) : null,
      };
    }),
  );

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
        title={dict.booking.book_title}
        lede={
          isMn
            ? "Үйлчилгээгээ сонгоод цаг захиалаарай"
            : "Select a service to book your appointment"
        }
      />

      {/* Compact service list */}
      <section className="mx-auto max-w-2xl px-5 py-8 sm:px-8 sm:py-12 lg:py-14">
        {services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-surface/60 p-10 text-center">
            <p className="text-muted">
              {isMn
                ? "Одоогоор үйлчилгээ бүртгэгдээгүй байна."
                : "No services available at the moment."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-[20px] bg-surface ring-1 ring-line">
            {enriched.map((s) => {
              const title = isMn ? s.name_mn : s.name_en;
              const iconPath = ICON_PATHS[s.icon_key ?? ""] ?? DEFAULT_ICON;
              const isPopular = POPULAR_SLUGS.has(s.slug);
              const priceLabel = s.price_text_mn
                ? isMn
                  ? s.price_text_mn
                  : s.price_text_en
                : s.minPrice
                  ? `${(s.minPrice / 100).toLocaleString()}₮~`
                  : null;

              return (
                <li key={s.id}>
                  <Link
                    href={`/${lang}/book/${s.slug}`}
                    className="group flex items-center gap-3.5 px-5 py-4 transition-colors hover:bg-primary-soft/40 sm:px-6"
                  >
                    {/* Icon */}
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d={iconPath} />
                      </svg>
                    </span>

                    {/* Name + badges */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-[14px] font-bold text-ink group-hover:text-primary transition-colors truncate">
                          {title}
                        </h2>
                        {isPopular && (
                          <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent-ink">
                            {isMn ? "Түгээмэл" : "Popular"}
                          </span>
                        )}
                      </div>
                      {s.childCount > 0 && (
                        <p className="mt-0.5 text-[11px] text-muted">
                          {s.childCount} {isMn ? "үйлчилгээ" : "services"}
                        </p>
                      )}
                    </div>

                    {/* Price + arrow */}
                    <div className="flex shrink-0 items-center gap-3">
                      {priceLabel && (
                        <span className="text-[13px] font-semibold text-primary">
                          {priceLabel}
                        </span>
                      )}
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary transition-transform group-hover:translate-x-0.5">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {/* Link to full services page */}
        <p className="mt-5 text-center">
          <Link
            href={`/${lang}/services`}
            className="text-[12px] font-semibold text-primary hover:underline"
          >
            {isMn
              ? "Үйлчилгээний дэлгэрэнгүй мэдээлэл →"
              : "View detailed service information →"}
          </Link>
        </p>
      </section>

      {/* Help band */}
      <section className="px-5 pb-16 sm:px-8 sm:pb-24">
        <div className="mx-auto max-w-2xl rounded-[22px] bg-forest-grain p-6 text-white sm:p-8">
          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-[17px] font-extrabold leading-tight tracking-tight sm:text-[20px]">
                {dict.booking.book_help_title}
              </h2>
              <p className="mt-1.5 text-[12px] leading-5 text-white/60">
                {dict.booking.book_help_body}
              </p>
            </div>
            {contact.phone && contact.phoneHref && (
              <a
                href={contact.phoneHref}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary py-2 pl-5 pr-2 text-[13px] font-bold text-white hover:bg-primary-hover transition-colors"
              >
                {contact.phone}
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-primary">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2 2A14 14 0 0 1 3 6a2 2 0 0 1 2-2z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
