import { SkeletonBox, SkeletonLine } from "@/components/booking/SkeletonBits";

export default function SuccessLoading() {
  return (
    <div className="mx-auto max-w-lg px-5 py-12 sm:px-8 sm:py-20">
      <div className="flex flex-col items-center gap-3 text-center">
        <SkeletonBox className="h-16 w-16 rounded-full" />
        <SkeletonLine className="h-8 w-3/4" />
        <SkeletonLine className="h-3 w-2/3" />
      </div>
      <div className="mt-10 space-y-3 rounded-3xl border border-line bg-surface p-6">
        <SkeletonLine className="h-4 w-1/2" />
        <SkeletonLine className="h-4 w-2/3" />
        <SkeletonLine className="h-4 w-1/3" />
        <SkeletonLine className="h-4 w-1/2" />
      </div>
    </div>
  );
}
