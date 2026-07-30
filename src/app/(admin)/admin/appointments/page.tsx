import Link from "next/link";
import { requireAdminUser } from "@/lib/auth";
import {
  listPendingBookingsAdmin,
  type PendingBookingFilter,
} from "@/lib/queries/admin";
import { formatFull } from "@/lib/utils/datetime";
import { Badge } from "@/components/ui/Badge";
import {
  ConfirmAppointmentButton,
  CancelAppointmentButton,
} from "@/components/admin/ConfirmAppointmentButton";
import type { PendingBookingStatus } from "@/lib/supabase/types";

const STATUS_TONES: Record<PendingBookingStatus, "primary" | "success" | "neutral" | "danger"> = {
  pending: "primary",
  processing: "primary",
  paid: "success",
  expired: "neutral",
  failed: "danger",
  cancelled: "neutral",
};

const STATUS_LABEL: Record<PendingBookingStatus, string> = {
  pending: "Хүлээгдэж буй",
  processing: "Боловсруулж буй",
  paid: "Төлөгдсөн",
  expired: "Хугацаа дууссан",
  failed: "Алдаатай",
  cancelled: "Цуцлагдсан",
};

type TabKey = "all" | "paid" | "pending_any" | "expired" | "failed" | "cancelled";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "all", label: "Бүгд" },
  { key: "paid", label: "Төлөгдсөн" },
  { key: "pending_any", label: "Хүлээгдэж буй" },
  { key: "expired", label: "Хугацаа дууссан" },
  { key: "failed", label: "Алдаатай" },
  { key: "cancelled", label: "Цуцлагдсан" },
];

function normalizeFilter(raw: string | undefined): {
  tab: TabKey;
  queryFilter: PendingBookingFilter;
} {
  switch (raw) {
    case "paid":
      return { tab: "paid", queryFilter: "paid" };
    case "pending":
    case "pending_any":
      return { tab: "pending_any", queryFilter: "pending_any" };
    case "expired":
      return { tab: "expired", queryFilter: "expired" };
    case "failed":
      return { tab: "failed", queryFilter: "failed" };
    case "cancelled":
      return { tab: "cancelled", queryFilter: "cancelled" };
    default:
      return { tab: "all", queryFilter: "all" };
  }
}

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdminUser();
  const { status } = await searchParams;
  const { tab, queryFilter } = normalizeFilter(status);

  let rows: Awaited<ReturnType<typeof listPendingBookingsAdmin>> = [];
  let errorMessage: string | null = null;
  try {
    rows = await listPendingBookingsAdmin(queryFilter);
  } catch (e) {
    console.error("[admin/appointments] listPendingBookingsAdmin failed:", e);
    errorMessage = e instanceof Error ? e.message : "Захиалгуудыг ачаалахад алдаа гарлаа.";
  }

  return (
    <div>
      <header className="flex items-center justify-between gap-4 border-b border-line bg-white/90 px-6 py-5 backdrop-blur sm:px-10">
        <h1 className="font-display text-[20px] font-extrabold uppercase tracking-tight text-[#0f172a] sm:text-[24px]">
          Захиалгууд
        </h1>
        <p className="hidden text-[12px] text-[#6b7280] sm:block">
          Сүүлийн 200 захиалга
        </p>
      </header>

      <div className="space-y-6 px-6 py-8 sm:px-10 sm:py-10">
        {/* Filter tabs */}
        <nav className="flex flex-wrap gap-2">
          {TABS.map((t) => {
            const active = t.key === tab;
            const href =
              t.key === "all" ? "/admin/appointments" : `/admin/appointments?status=${t.key}`;
            return (
              <Link
                key={t.key}
                href={href}
                className={
                  "rounded-full px-4 py-1.5 text-[12px] font-semibold transition-colors " +
                  (active
                    ? "bg-[#0f172a] text-white"
                    : "bg-white text-[#6b7280] ring-1 ring-line hover:bg-[#fafbff]")
                }
              >
                {t.label}
              </Link>
            );
          })}
        </nav>

        {errorMessage && (
          <p className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-[13px] text-danger">
            {errorMessage}
          </p>
        )}

        <div className="overflow-x-auto rounded-[22px] bg-white shadow-[0_10px_30px_-18px_rgba(15,23,42,0.18)]">
          <table className="w-full min-w-[840px] text-left text-[13px]">
            <thead className="border-b border-line bg-[#fafbff] text-[10px] uppercase tracking-[0.18em] text-[#6b7280]">
              <tr>
                <th className="px-5 py-4 font-bold">Үйлчлүүлэгч</th>
                <th className="px-5 py-4 font-bold">Утас</th>
                <th className="px-5 py-4 font-bold">Үйлчилгээ</th>
                <th className="px-5 py-4 font-bold">Цаг</th>
                <th className="px-5 py-4 font-bold">Статус</th>
                <th className="px-5 py-4 font-bold">iDoctor ref</th>
                <th className="px-5 py-4 text-right font-bold">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="align-top transition-colors hover:bg-[#fafbff]"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#0f172a]">{r.customer_name}</p>
                    {r.note && (
                      <p className="mt-1 max-w-xs whitespace-pre-line text-[12px] text-[#6b7280] line-clamp-3">
                        {r.note}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 font-mono text-[12px] text-[#374151]">
                    {r.customer_phone}
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-[#0f172a]">
                      {r.service_name ?? r.dept_slug ?? "—"}
                    </p>
                    <p className="text-[11px] text-[#9ca3af]">
                      {formatFull(r.created_at, "mn")}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-[12px] text-[#374151]">
                    {formatFull(r.slot_datetime, "mn")}
                  </td>
                  <td className="px-5 py-4">
                    <Badge tone={STATUS_TONES[r.status]}>
                      {STATUS_LABEL[r.status]}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 font-mono text-[11px] text-[#6b7280]">
                    {r.booking_reference ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span title={r.booking_reference}>
                          {r.booking_reference.slice(0, 8)}…
                        </span>
                        {r.ghost_booking_refs &&
                          r.ghost_booking_refs.length > 0 && (
                            <span
                              title={`Ghost slots: ${r.ghost_booking_refs.length} нэмэлт цаг блоклосон`}
                              className="inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 font-sans text-[9px] font-bold text-amber-800"
                            >
                              +{r.ghost_booking_refs.length} ghost
                            </span>
                          )}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {/* Paid → can cancel. Pending/processing/expired → admin
                        can force-confirm (override QPay). Failed and cancelled
                        are terminal: the booking has been cancelled or rolled
                        back, and re-confirming would create a duplicate iDoctor
                        booking next to the dead reference. */}
                    {r.status === "paid" ? (
                      <CancelAppointmentButton
                        id={r.id}
                        hasReference={Boolean(r.booking_reference)}
                      />
                    ) : r.status === "failed" || r.status === "cancelled" ? (
                      <span className="text-[11px] text-[#9ca3af]">—</span>
                    ) : (
                      <ConfirmAppointmentButton id={r.id} />
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !errorMessage && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-16 text-center text-[14px] text-[#9ca3af]"
                  >
                    Одоогоор захиалга алга.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
