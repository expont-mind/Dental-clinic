import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n/dictionaries";
import { getCurrentUser, userSignOutAction } from "@/lib/actions/auth";
import { listBookingsByPhone } from "@/lib/queries/admin";
import { formatFull } from "@/lib/utils/datetime";
import { formatMongolianPhone } from "@/lib/utils/phone";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { CancelMyBookingButton } from "@/components/account/CancelMyBookingButton";
import type { PendingBookingStatus } from "@/lib/supabase/types";

type Tone = "primary" | "success" | "neutral" | "danger";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  const a = dict.account;

  const user = await getCurrentUser();
  if (!user) redirect(`/${lang}/login`);

  const bookings = user.phone8
    ? await listBookingsByPhone(user.phone8).catch(() => [])
    : [];

  const statusMeta: Record<PendingBookingStatus, { label: string; tone: Tone }> = {
    paid: { label: a.status_paid, tone: "success" },
    pending: { label: a.status_pending, tone: "primary" },
    processing: { label: a.status_pending, tone: "primary" },
    cancelled: { label: a.status_cancelled, tone: "neutral" },
    expired: { label: a.status_expired, tone: "neutral" },
    failed: { label: a.status_failed, tone: "danger" },
  };

  // Dynamic page (reads the session cookie); the "future booking" gate below is
  // cosmetic — cancelMyBookingAction re-checks it authoritatively on submit.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  return (
    <Container size="lg" className="py-10 sm:py-14">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold text-muted">
            {a.greeting}, {user.name}
            {user.phone ? ` · ${formatMongolianPhone(user.phone)}` : ""}
          </p>
          <h1 className="font-display mt-1 text-[26px] font-extrabold tracking-tight text-ink sm:text-[32px]">
            {a.title}
          </h1>
          <p className="mt-1.5 text-[13px] text-muted">{a.lede}</p>
        </div>
        <form action={userSignOutAction}>
          <input type="hidden" name="lang" value={lang} />
          <button
            type="submit"
            className="rounded-full border border-line bg-white px-4 py-2 text-[12px] font-bold text-ink hover:bg-primary-soft transition-colors"
          >
            {a.logout}
          </button>
        </form>
      </div>

      {/* Bookings */}
      <div className="mt-8 space-y-3">
        {bookings.length === 0 && (
          <EmptyState
            title={a.empty}
            action={
              <Button asChild>
                <Link href={`/${lang}/book`}>
                  {a.book_cta}
                  <span aria-hidden>→</span>
                </Link>
              </Button>
            }
          />
        )}

        {bookings.map((b) => {
          const meta = statusMeta[b.status];
          const dentist =
            (b.booking_result as { dentist?: string } | null)?.dentist ?? null;
          const startsAt = new Date(
            b.slot_datetime.replace(" ", "T") + "+08:00",
          ).getTime();
          const canCancel =
            b.status === "paid" &&
            Boolean(b.booking_reference) &&
            startsAt > now;

          return (
            <Card
              key={b.id}
              className="flex flex-wrap items-start justify-between gap-4 p-5"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-ink">
                    {b.service_name ?? b.dept_slug ?? "—"}
                  </p>
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                </div>
                <p className="mt-1 text-[13px] text-muted">
                  {formatFull(b.slot_datetime, lang as Locale)}
                </p>
                {dentist && (
                  <p className="mt-0.5 text-[12px] text-muted-2">{dentist}</p>
                )}
                {b.booking_reference && (
                  <p className="mt-1 font-mono text-[11px] text-muted-2">
                    {a.ref}: {b.booking_reference.slice(0, 8)}…
                  </p>
                )}
              </div>

              {canCancel && (
                <CancelMyBookingButton
                  id={b.id}
                  lang={lang}
                  label={a.cancel}
                  loadingLabel={a.cancelling}
                  confirmText={a.cancel_confirm}
                />
              )}
            </Card>
          );
        })}
      </div>
    </Container>
  );
}
