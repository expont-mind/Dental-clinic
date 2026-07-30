import { SkeletonBox, SkeletonHero, SkeletonLine } from "@/components/booking/SkeletonBits";

export default function BookStartLoading() {
  return (
    <>
      <SkeletonHero back={false} />
      <section className="mx-auto max-w-2xl px-5 py-8 sm:px-8 sm:py-12 lg:py-14">
        <ul className="divide-y divide-line overflow-hidden rounded-[20px] bg-surface ring-1 ring-line">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3.5 px-5 py-4 sm:px-6">
              <SkeletonBox className="h-10 w-10 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonLine className="h-4 w-2/5" />
                <SkeletonLine className="h-3 w-1/4" />
              </div>
              <SkeletonLine className="h-3 w-14 shrink-0" />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
