/**
 * Tiny skeleton primitives shared by every booking step's loading.tsx.
 * Keeping them stateless and dependency-free so a server-rendered loading
 * boundary can use them directly. All bits use Tailwind's `animate-pulse`.
 */

import { cn } from "@/lib/utils/cn";

export function SkeletonBox({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-primary-soft/60", className)}
    />
  );
}

export function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-full bg-primary-soft/60", className)}
    />
  );
}

/**
 * Mirrors the real `BookingStepHeader` footprint (compact step bar + a small
 * centered title block with a back line) so the loading→content swap doesn't
 * jump. Pass `back={false}` on step 1 (no back button).
 */
export function SkeletonHero({ back = true }: { back?: boolean }) {
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

      {/* StepIndicator footprint */}
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-5 pt-5 pb-4 sm:flex-row sm:justify-center sm:gap-5 sm:px-8 sm:pt-6 sm:pb-5">
        <SkeletonLine className="h-3 w-24" />
        <SkeletonLine className="hidden h-3 w-48 sm:block" />
      </div>

      {/* Title block — compact */}
      <div className="relative mx-auto max-w-3xl px-5 pb-7 pt-3 sm:px-8 sm:pb-10 sm:pt-4">
        {back && <SkeletonLine className="h-3 w-16" />}
        <div className={back ? "mt-3" : ""}>
          <SkeletonLine className="mx-auto h-3 w-28" />
          <SkeletonLine className="mx-auto mt-2 h-6 w-2/3 sm:h-8" />
          <SkeletonLine className="mx-auto mt-2.5 h-3 w-1/2" />
        </div>
      </div>
    </section>
  );
}
