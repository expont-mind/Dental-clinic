import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/Button";
import { formatFull } from "@/lib/utils/datetime";

export default async function BookSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{
    ref?: string;
    dentist?: string;
    service?: string;
    branch?: string;
    date?: string;
    end_date?: string;
    name?: string;
    phone?: string;
  }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const sp = await searchParams;

  const when = sp.date
    ? formatFull(sp.date.replace(" ", "T") + "+08:00", lang as "mn" | "en")
    : "";

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8 sm:py-24">
      <div className="text-center">
        <span
          aria-hidden
          className="inline-grid h-14 w-14 place-items-center rounded-full bg-primary text-white"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="m5 12 5 5L20 7"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h1 className="font-display mt-6 text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
          {dict.booking.success_title}
        </h1>
        <p className="mt-3 text-lg text-muted">{dict.booking.success_lede}</p>
      </div>

      <dl className="mt-12 overflow-hidden rounded-3xl border border-line bg-surface">
        <Row
          label={dict.booking.success_appointment_id}
          value={sp.ref ?? "—"}
          mono
        />
        {sp.dentist && (
          <Row label={dict.nav.doctors} value={sp.dentist} />
        )}
        {sp.service && (
          <Row label={dict.nav.services} value={sp.service} />
        )}
        {sp.branch && (
          <Row
            label={lang === "mn" ? "Салбар" : "Branch"}
            value={sp.branch}
          />
        )}
        {when && (
          <Row
            label={dict.booking.step_slot_title.split(" ")[0]}
            value={when}
          />
        )}
        {sp.name && (
          <Row label={dict.booking.field_name} value={sp.name} />
        )}
        {sp.phone && (
          <Row label={dict.booking.field_phone} value={sp.phone} />
        )}
      </dl>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link href={`/${lang}`}>{dict.booking.success_home}</Link>
        </Button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 border-b border-line p-5 last:border-b-0 sm:grid-cols-4">
      <dt className="col-span-1 text-xs uppercase tracking-[0.18em] text-muted-2">
        {label}
      </dt>
      <dd
        className={
          (mono ? "font-mono text-sm " : "text-base ") +
          "col-span-2 text-ink-2 sm:col-span-3"
        }
      >
        {value}
      </dd>
    </div>
  );
}
