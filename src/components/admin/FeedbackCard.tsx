"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { resolveFeedbackAction } from "@/lib/actions/feedback";

export type FeedbackItem = {
  id: string;
  name: string | null;
  phone: string | null;
  message: string;
  status: "new" | "read" | "resolved" | string;
  created_at: string;
  source: "supabase" | "local";
};

type Props = {
  row: FeedbackItem;
  formattedDate: string;
  statusLabel: string;
  statusDotClass: string;
};

export function FeedbackCard({
  row,
  formattedDate,
  statusLabel,
  statusDotClass,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const initial = (row.name ?? "?").charAt(0).toUpperCase();
  const preview =
    row.message.length > 60 ? row.message.slice(0, 60) + "…" : row.message;

  // Close on Escape; lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group w-full rounded-[22px] bg-white p-6 text-left shadow-[0_10px_30px_-18px_rgba(15,23,42,0.18)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_-18px_rgba(15,23,42,0.25)] sm:p-7"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/15 font-display text-[14px] font-extrabold text-primary">
              {initial}
            </span>
            <div>
              <p className="font-display text-[15px] font-bold tracking-tight text-[#0f172a]">
                {row.name || "Нэргүй"}
              </p>
              <p className="font-mono text-[11px] text-[#6b7280]">
                {row.phone ?? "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {row.source === "local" && (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-800">
                Локал
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fafbff] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#374151] ring-1 ring-line">
              <span
                className={"inline-block h-1.5 w-1.5 rounded-full " + statusDotClass}
              />
              {statusLabel}
            </span>
          </div>
        </div>
        <p className="mt-4 truncate text-[13.5px] leading-6 text-[#6b7280]">
          {preview}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
          <p className="text-[11px] text-[#9ca3af]">{formattedDate}</p>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary group-hover:translate-x-0.5 transition-transform">
            Дэлгэрэнгүй →
          </span>
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center px-4 pb-4 sm:items-center sm:p-6"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-lg rounded-[24px] bg-white p-6 shadow-2xl ring-1 ring-line sm:p-8">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/15 font-display text-[16px] font-extrabold text-primary">
                  {initial}
                </span>
                <div>
                  <p className="font-display text-[18px] font-bold tracking-tight text-[#0f172a]">
                    {row.name || "Нэргүй"}
                  </p>
                  {row.phone && (
                    <a
                      href={`tel:${row.phone}`}
                      className="font-mono text-[12px] text-primary hover:underline"
                    >
                      {row.phone}
                    </a>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fafbff] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#374151] ring-1 ring-line">
                <span
                  className={
                    "inline-block h-1.5 w-1.5 rounded-full " + statusDotClass
                  }
                />
                {statusLabel}
              </span>
              {row.source === "local" && (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-800">
                  Локал
                </span>
              )}
              <span className="text-[11px] text-[#9ca3af]">
                {formattedDate}
              </span>
            </div>

            <div className="mt-5 max-h-[50vh] overflow-y-auto rounded-2xl bg-[#fafbff] p-5 ring-1 ring-line">
              <p className="whitespace-pre-line text-[14px] leading-7 text-[#0f172a]">
                {row.message}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
              {row.status !== "resolved" && (
                <div className="flex flex-1 flex-col items-end gap-2 sm:flex-row sm:items-center">
                  {resolveError && (
                    <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-1.5 text-[11px] text-danger">
                      {resolveError}
                    </p>
                  )}
                  <form
                    action={async (fd: FormData) => {
                      setResolving(true);
                      setResolveError(null);
                      try {
                        const result = await resolveFeedbackAction(fd);
                        if (result?.ok) {
                          setOpen(false);
                          router.refresh();
                        } else {
                          setResolveError(
                            result?.error ?? "Шинэчлэхэд алдаа гарлаа.",
                          );
                        }
                      } catch (err) {
                        setResolveError(String(err));
                      } finally {
                        setResolving(false);
                      }
                    }}
                  >
                    <input type="hidden" name="id" value={row.id} />
                    <button
                      type="submit"
                      disabled={resolving}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[13px] font-bold text-white hover:bg-primary-hover transition-colors disabled:opacity-60"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M5 12l5 5 9-11"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {resolving ? "Хадгалж байна…" : "Шийдсэн"}
                    </button>
                  </form>
                </div>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-[13px] font-bold text-[#0f172a] hover:bg-[#f3f4f6] transition-colors"
              >
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
