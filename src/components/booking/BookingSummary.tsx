import Image from "next/image";
import { Card } from "@/components/ui/Card";

type Props = {
  /** Small eyebrow above the name — the service / department label. */
  serviceLabel: string;
  doctorName: string;
  doctorTitle?: string;
  photoUrl?: string | null;
  /** Formatted date-time string. Omit on the slot step (nothing picked yet). */
  when?: string | null;
  /** e.g. "Улаанбаатар · UTC+8". Shown only alongside `when`. */
  tzNote?: string;
  durationLabel?: string | null;
  priceLabel?: string | null;
  labels: { when: string; duration: string; price: string };
  className?: string;
};

/**
 * The canonical "what you're booking" card, shared across the slot, confirm and
 * payment steps. Purely presentational and server-safe — every value arrives as
 * an already-formatted string; this component never fetches or formats data.
 */
export function BookingSummary({
  serviceLabel,
  doctorName,
  doctorTitle,
  photoUrl,
  when,
  tzNote,
  durationLabel,
  priceLabel,
  labels,
  className,
}: Props) {
  const hasMeta = Boolean(durationLabel || priceLabel);

  return (
    <Card className={className}>
      <div className="flex items-center gap-4 p-5">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-primary-soft">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={doctorName}
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-display text-2xl text-muted-2">
              {doctorName.charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            {serviceLabel}
          </p>
          <p className="mt-0.5 truncate font-display text-[18px] font-bold leading-tight text-ink">
            {doctorName}
          </p>
          {doctorTitle && (
            <p className="mt-0.5 truncate text-[12px] text-muted">
              {doctorTitle}
            </p>
          )}
        </div>
      </div>

      {hasMeta && (
        <div className="flex flex-wrap gap-2 border-t border-line px-5 py-4">
          {durationLabel && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-[12px] font-semibold text-ink-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <span className="sr-only">{labels.duration}: </span>
              {durationLabel}
            </span>
          )}
          {priceLabel && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-[12px] font-bold text-primary-ink">
              <span className="sr-only">{labels.price}: </span>
              {priceLabel}
            </span>
          )}
        </div>
      )}

      {when && (
        <div className="border-t border-line px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-2">
            {labels.when}
          </p>
          <p className="mt-1 font-display text-[16px] font-medium text-ink">
            {when}
          </p>
          {tzNote && <p className="mt-0.5 text-[12px] text-muted">{tzNote}</p>}
        </div>
      )}
    </Card>
  );
}
