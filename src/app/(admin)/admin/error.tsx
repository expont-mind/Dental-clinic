"use client";

import { useEffect } from "react";
import Link from "next/link";
import { translateError } from "@/lib/utils/translate-error";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] route error:", error);
  }, [error]);

  return (
    <div className="relative min-h-[60vh] overflow-hidden bg-primary-soft">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/40 blur-3xl"
      />
      <div className="relative mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 py-20 text-center sm:px-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
          ◦ Admin
        </p>
        <h1 className="mt-3 text-[32px] font-extrabold uppercase leading-[1.05] tracking-tight text-ink sm:text-[44px]">
          Алдаа гарлаа
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[14px] leading-7 text-muted sm:text-[15px]">
          {translateError(error)}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[14px] font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            Дахин оролдох
          </button>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-full border border-ink px-5 py-2.5 text-[13px] font-semibold text-ink hover:bg-ink hover:text-white transition-colors"
          >
            Хяналт →
          </Link>
        </div>
      </div>
    </div>
  );
}
