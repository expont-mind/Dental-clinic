import { SkeletonBox, SkeletonHero, SkeletonLine } from "@/components/booking/SkeletonBits";

/**
 * Slot-picker page: booking summary card + date rail + time-slot grid.
 * Mirrors the real BookingSummary + SlotPicker layout so the skeleton→content
 * transition stays visually still.
 */
export default function BookSlotLoading() {
  return (
    <>
      <SkeletonHero />
      <section className="mx-auto max-w-4xl px-5 pb-20 pt-10 sm:px-8 sm:pb-28 sm:pt-12">
        {/* Booking summary card */}
        <div className="rounded-2xl border border-line bg-surface">
          <div className="flex items-center gap-4 p-5">
            <SkeletonBox className="h-14 w-14 shrink-0 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <SkeletonLine className="h-3 w-24" />
              <SkeletonLine className="h-4 w-44" />
              <SkeletonLine className="h-3 w-28" />
            </div>
          </div>
          <div className="flex gap-2 border-t border-line px-5 py-4">
            <SkeletonLine className="h-6 w-20" />
            <SkeletonLine className="h-6 w-24" />
          </div>
        </div>

        {/* Date rail */}
        <div className="mt-8 flex gap-2 overflow-hidden">
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonBox key={i} className="h-[72px] w-[76px] shrink-0 rounded-2xl" />
          ))}
        </div>

        {/* Time-slot grid */}
        <div className="mt-8 grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonBox key={i} className="h-13 w-full rounded-xl" />
          ))}
        </div>
      </section>
    </>
  );
}
