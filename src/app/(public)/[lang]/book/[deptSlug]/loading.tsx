import { SkeletonBox, SkeletonHero, SkeletonLine } from "@/components/booking/SkeletonBits";

/**
 * Serves both real layouts at this route (sub-service picker + doctor list).
 * Mirrors the doctor cards, which are compact horizontal rows on mobile and
 * vertical photo cards on sm+ — matching the real DoctorCard so nothing jumps.
 */
export default function BookDeptLoading() {
  return (
    <>
      <SkeletonHero />
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8 sm:pb-28 sm:pt-14">
        <ul className="grid gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i}>
              <div className="flex items-center gap-4 rounded-2xl bg-surface p-3 ring-1 ring-line sm:block sm:rounded-[24px] sm:p-0">
                <SkeletonBox className="h-24 w-[76px] shrink-0 rounded-xl sm:aspect-[4/5] sm:h-auto sm:w-full sm:rounded-none sm:rounded-t-[24px]" />
                <div className="min-w-0 flex-1 space-y-2 sm:p-5">
                  <SkeletonLine className="h-4 w-3/4" />
                  <SkeletonLine className="h-3 w-1/2" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
