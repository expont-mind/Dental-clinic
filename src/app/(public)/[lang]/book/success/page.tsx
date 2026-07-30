import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
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
    ? formatFull(sp.date.replace(" ", "T") + "+08:00", lang as Locale)
    : "";

  return (
    <Container size="md" className="py-16 sm:py-24">
      <div className="text-center">
        <span
          aria-hidden
          className="inline-grid h-16 w-16 place-items-center rounded-full bg-primary text-white shadow-[0_10px_30px_-10px_rgb(13_110_114/0.7)]"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
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

      <Card className="mt-10 overflow-hidden">
        <dl>
          <Row
            label={dict.booking.success_appointment_id}
            value={sp.ref ?? "—"}
            mono
          />
          {sp.dentist && <Row label={dict.nav.doctors} value={sp.dentist} />}
          {sp.service && <Row label={dict.nav.services} value={sp.service} />}
          {sp.branch && (
            <Row label={lang === "mn" ? "Салбар" : "Branch"} value={sp.branch} />
          )}
          {when && (
            <Row label={dict.booking.summary_when} value={when} />
          )}
          {sp.name && <Row label={dict.booking.field_name} value={sp.name} />}
          {sp.phone && <Row label={dict.booking.field_phone} value={sp.phone} />}
        </dl>
      </Card>

      {/* Manage / cancel — routes through login when logged out. */}
      <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
        <Button asChild size="lg">
          <Link href={`/${lang}/account`}>{dict.account.title}</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href={`/${lang}/book`}>{dict.booking.success_book_another}</Link>
        </Button>
      </div>
      <p className="mt-4 text-center text-[13px] leading-6 text-muted">
        {dict.booking.success_manage_note}
      </p>
      <div className="mt-6 text-center">
        <Link
          href={`/${lang}`}
          className="text-[13px] font-semibold text-muted hover:text-primary transition-colors"
        >
          {dict.booking.success_home}
        </Link>
      </div>
    </Container>
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
