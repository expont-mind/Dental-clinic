"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export function PaymentPoller({
  pendingId,
  lang,
  checkingLabel,
  expiredLabel,
  failedLabel,
}: {
  pendingId: string;
  lang: string;
  checkingLabel: string;
  expiredLabel: string;
  failedLabel: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"pending" | "paid" | "expired" | "failed">("pending");

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/qpay/check?id=${pendingId}`);
      const data = await res.json();

      if (data.status === "paid" && data.booking_result) {
        setStatus("paid");
        const r = data.booking_result;
        const params = new URLSearchParams({
          ref: r.booking_reference || "",
          dentist: r.dentist || "",
          service: r.service || "",
          branch: r.branch || "",
          date: r.date || "",
          end_date: r.end_date || "",
          name: r.customer_name || "",
          phone: r.customer_phone || "",
        });
        router.push(`/${lang}/book/success?${params.toString()}`);
      } else if (data.status === "expired") {
        setStatus("expired");
      } else if (data.status === "failed") {
        setStatus("failed");
      }
    } catch {
      // Keep polling
    }
  }, [pendingId, lang, router]);

  useEffect(() => {
    if (status !== "pending") return;
    // Poll every 3 seconds
    const interval = setInterval(poll, 3000);
    // Also poll immediately
    poll();
    return () => clearInterval(interval);
  }, [poll, status]);

  if (status === "expired" || status === "failed") {
    return (
      <div className="mt-6 rounded-2xl border border-danger/30 bg-danger/10 px-5 py-4 text-center text-[14px] text-danger">
        {status === "expired" ? expiredLabel : failedLabel}
      </div>
    );
  }

  return (
    <div className="mt-6 flex items-center justify-center gap-2 text-[14px] text-muted">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      {checkingLabel}
    </div>
  );
}
