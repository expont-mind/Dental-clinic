import { notFound } from "next/navigation";
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n/dictionaries";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { PaymentPoller } from "@/components/booking/PaymentPoller";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { formatFull } from "@/lib/utils/datetime";

export default async function PaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ id?: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  const sp = await searchParams;
  if (!sp.id) notFound();

  // Load the pending booking server-side so we never need to round-trip the
  // QR PNG through the URL. URL stays short → no more HTTP 431.
  const supabase = createSupabaseAdmin();
  const { data: pending, error } = await supabase
    .from("pending_bookings")
    .select("qr_image, amount_cents, service_name, status, slot_datetime, duration_min")
    .eq("id", sp.id)
    .maybeSingle();

  if (error || !pending || !pending.qr_image) notFound();

  const amountMnt = Math.round((pending.amount_cents ?? 0) / 100);
  const serviceLabel = pending.service_name ?? "";
  const when = pending.slot_datetime
    ? formatFull(pending.slot_datetime, lang as Locale)
    : "";
  const durationLabel =
    pending.duration_min && pending.duration_min > 0
      ? `${pending.duration_min} ${lang === "mn" ? "мин" : "min"}`
      : "";

  return (
    <Container size="sm" className="py-12 sm:py-20">
      <div className="text-center">
        <span
          aria-hidden
          className="inline-grid h-14 w-14 place-items-center rounded-full bg-accent/20 text-accent"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
          </svg>
        </span>
        <h1 className="font-display mt-5 text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
          {dict.booking.pay_title}
        </h1>
        <p className="mt-2 text-muted">{dict.booking.pay_lede}</p>
      </div>

      {/* What you're paying for */}
      {(serviceLabel || when) && (
        <Card variant="muted" className="mt-6 p-5">
          {serviceLabel && (
            <p className="font-display text-[16px] font-bold text-ink">
              {serviceLabel}
            </p>
          )}
          {when && <p className="mt-1 text-[13px] text-muted">{when}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {amountMnt > 0 && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3.5 py-1.5 text-[15px] font-bold text-primary">
                {amountMnt.toLocaleString()}₮
              </span>
            )}
            {durationLabel && (
              <span className="inline-flex items-center rounded-full bg-surface-2 px-3 py-1 text-[12px] font-semibold text-ink-2">
                {durationLabel}
              </span>
            )}
          </div>
        </Card>
      )}

      {/* QR Code */}
      <div className="mt-6 flex justify-center">
        <div className="overflow-hidden rounded-3xl border border-line bg-white p-4 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/png;base64,${pending.qr_image}`}
            alt="QPay QR Code"
            width={280}
            height={280}
            className="h-[280px] w-[280px] max-w-full"
          />
        </div>
      </div>

      {/* Payment status poller */}
      <PaymentPoller
        pendingId={sp.id}
        lang={lang}
        checkingLabel={dict.booking.pay_checking}
        expiredLabel={dict.booking.pay_expired}
        failedLabel={dict.booking.pay_failed}
      />

      <p className="mt-8 text-center text-[12px] leading-6 text-muted">
        {dict.booking.pay_deadline}
      </p>
      <p className="mt-2 text-center text-[12px] leading-6 text-muted-2">
        {dict.booking.pay_after}
      </p>
    </Container>
  );
}
