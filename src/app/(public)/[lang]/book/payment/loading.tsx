import { SkeletonBox, SkeletonLine } from "@/components/booking/SkeletonBits";

export default function PaymentLoading() {
  return (
    <div className="mx-auto max-w-lg px-5 py-12 sm:px-8 sm:py-20">
      <div className="flex flex-col items-center gap-3 text-center">
        <SkeletonBox className="h-14 w-14 rounded-full" />
        <SkeletonLine className="h-8 w-40" />
        <SkeletonLine className="h-3 w-56" />
      </div>
      <div className="mt-6 flex justify-center">
        <SkeletonLine className="h-8 w-32 rounded-full" />
      </div>
      <div className="mt-8 flex justify-center">
        <SkeletonBox className="h-[296px] w-[296px] rounded-3xl" />
      </div>
      <div className="mt-6 flex items-center justify-center gap-2">
        <SkeletonBox className="h-4 w-4 rounded-full" />
        <SkeletonLine className="h-3 w-40" />
      </div>
    </div>
  );
}
