import Link from "next/link";
import { StepIndicator } from "./StepIndicator";

type Props = {
  current: 1 | 2 | 3 | 4;
  stepWord: string;
  ofWord: string;
  labels: [string, string, string, string];
  /** Omit on step 1 (nothing to go back to). */
  backHref?: string;
  backLabel?: string;
  eyebrow?: string;
  title: string;
  lede?: string;
};

/**
 * The single header used by every booking step. One compact hero + step bar +
 * a back button in a consistent top-left slot, so all four steps share the same
 * vertical rhythm and the layout never jumps between steps. Deliberately
 * compact on mobile — small title, tight padding — so the form/slots sit near
 * the top instead of below a screen-filling hero.
 */
export function BookingStepHeader({
  current,
  stepWord,
  ofWord,
  labels,
  backHref,
  backLabel,
  eyebrow,
  title,
  lede,
}: Props) {
  return (
    <section className="relative overflow-hidden bg-primary-soft">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-accent/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl"
      />

      <StepIndicator
        variant="onSoft"
        current={current}
        stepWord={stepWord}
        ofWord={ofWord}
        labels={labels}
      />

      <div className="relative mx-auto max-w-3xl px-5 pb-7 pt-3 sm:px-8 sm:pb-10 sm:pt-4">
        {backHref && (
          <Link
            href={backHref}
            className="mb-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted hover:text-ink"
          >
            ← {backLabel}
          </Link>
        )}
        <div className="text-center">
          {eyebrow && (
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-1.5 font-display text-[22px] font-extrabold uppercase leading-[1.12] tracking-tight text-ink sm:text-[32px]">
            {title}
          </h1>
          {lede && (
            <p className="mx-auto mt-2.5 max-w-md text-[13px] leading-6 text-muted sm:text-[14px]">
              {lede}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
