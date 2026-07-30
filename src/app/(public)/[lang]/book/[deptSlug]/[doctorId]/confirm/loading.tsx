import { SkeletonBox, SkeletonHero, SkeletonLine } from "@/components/booking/SkeletonBits";

/**
 * Confirm page: booking summary card + patient form. The step title now lives
 * in the header, so there is no mid-page heading to skeletonize.
 */
export default function BookConfirmLoading() {
  return (
    <>
      <SkeletonHero />
      <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
        {/* Booking summary card */}
        <div className="rounded-2xl border border-line bg-surface">
          <div className="flex items-center gap-4 p-5">
            <SkeletonBox className="h-14 w-14 shrink-0 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <SkeletonLine className="h-3 w-24" />
              <SkeletonLine className="h-4 w-40" />
              <SkeletonLine className="h-3 w-20" />
            </div>
          </div>
          <div className="flex gap-2 border-t border-line px-5 py-4">
            <SkeletonLine className="h-6 w-20" />
            <SkeletonLine className="h-6 w-24" />
          </div>
          <div className="space-y-2 border-t border-line px-5 py-4">
            <SkeletonLine className="h-3 w-12" />
            <SkeletonLine className="h-4 w-40" />
          </div>
        </div>

        {/* Patient form */}
        <div className="mt-8 grid gap-5">
          <SkeletonBox className="h-11 w-full" />
          <SkeletonBox className="h-11 w-full" />
          <SkeletonLine className="h-4 w-40" />
          <SkeletonBox className="h-24 w-full" />
          <SkeletonBox className="h-14 w-full rounded-2xl sm:w-40" />
        </div>
      </div>
    </>
  );
}
