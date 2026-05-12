import Link from "next/link";
import { requireAdminUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/auth";

const STAT_TONES: Record<
  string,
  { from: string; to: string; bgBlob: string }
> = {
  violet: {
    from: "#7c4ff5",
    to: "#a486ff",
    bgBlob: "rgba(124,79,245,0.15)",
  },
  pink: {
    from: "#ec4899",
    to: "#f472b6",
    bgBlob: "rgba(236,72,153,0.15)",
  },
  blue: {
    from: "#3b82f6",
    to: "#60a5fa",
    bgBlob: "rgba(59,130,246,0.15)",
  },
  green: {
    from: "#10b981",
    to: "#34d399",
    bgBlob: "rgba(16,185,129,0.15)",
  },
  orange: {
    from: "#f97316",
    to: "#fb923c",
    bgBlob: "rgba(249,115,22,0.18)",
  },
  magenta: {
    from: "#c026d3",
    to: "#e879f9",
    bgBlob: "rgba(192,38,211,0.15)",
  },
};

type StatTone = keyof typeof STAT_TONES;

function StatCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string | number;
  tone: StatTone;
  icon: string;
}) {
  const t = STAT_TONES[tone];
  return (
    <div className="relative overflow-hidden rounded-[16px] bg-white p-4 shadow-[0_8px_20px_-14px_rgba(15,23,42,0.15)] sm:p-5">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl"
        style={{ background: t.bgBlob }}
      />
      <span
        className="relative grid h-9 w-9 place-items-center rounded-xl text-white shadow-sm"
        style={{
          background: `linear-gradient(135deg, ${t.from}, ${t.to})`,
        }}
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={icon} />
        </svg>
      </span>
      <p className="relative mt-3 text-[11px] font-medium text-[#6b7280]">
        {label}
      </p>
      <p className="relative mt-1 font-display text-[22px] font-extrabold leading-none text-[#0f172a]">
        {value}
      </p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const user = await requireAdminUser();

  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  const inSevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  let appointmentsToday = 0;
  let appointmentsWeek = 0;
  let openSlots = 0;
  let activeDoctors = 0;
  let appointmentsMonth = 0;
  let appointmentsAll = 0;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServer();
      const [todayRes, weekRes, openRes, doctorsRes, monthRes, allRes] =
        await Promise.all([
          supabase
            .from("appointments")
            .select("id", { count: "exact", head: true })
            .gte("created_at", startOfDay.toISOString())
            .lte("created_at", endOfDay.toISOString()),
          supabase
            .from("appointments")
            .select("id", { count: "exact", head: true })
            .gte("created_at", startOfDay.toISOString()),
          supabase
            .from("time_slots")
            .select("id", { count: "exact", head: true })
            .eq("is_booked", false)
            .gte("slot_start", new Date().toISOString())
            .lte("slot_start", inSevenDays.toISOString()),
          supabase
            .from("doctors")
            .select("id", { count: "exact", head: true })
            .eq("is_active", true),
          supabase
            .from("appointments")
            .select("id", { count: "exact", head: true })
            .gte("created_at", monthStart.toISOString()),
          supabase
            .from("appointments")
            .select("id", { count: "exact", head: true }),
        ]);
      appointmentsToday = todayRes.count ?? 0;
      appointmentsWeek = weekRes.count ?? 0;
      openSlots = openRes.count ?? 0;
      activeDoctors = doctorsRes.count ?? 0;
      appointmentsMonth = monthRes.count ?? 0;
      appointmentsAll = allRes.count ?? 0;
    } catch {
      // dev bypass — supabase not connected; show zeros
    }
  }

  const dateLabel = today.toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <div>
      {/* Top bar */}
      <header className="flex items-center justify-between gap-4 border-b border-line bg-white/90 px-5 py-3.5 backdrop-blur sm:px-8">
        <h1 className="font-display text-[16px] font-extrabold uppercase tracking-tight text-[#0f172a] sm:text-[20px]">
          Хянах самбар
        </h1>
        <button
          aria-label="Theme"
          className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#0c7b6e] shadow-sm ring-1 ring-line hover:bg-[#f3f4f6] transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </header>

      <div className="space-y-4 px-5 py-5 sm:px-8 sm:py-6">
        {/* Greeting banner */}
        <section
          className="rounded-[16px] bg-white p-5 shadow-[0_8px_20px_-14px_rgba(15,23,42,0.15)] sm:p-6"
          style={{
            background:
              "linear-gradient(120deg, #ffffff 0%, #f5f3ff 60%, #fff1f8 100%)",
          }}
        >
          <h2 className="font-display text-[18px] font-extrabold leading-tight text-[#0f172a] sm:text-[22px]">
            Сайн байна уу!{" "}
            <span aria-hidden className="inline-block">
              👋
            </span>
          </h2>
          <p className="mt-1.5 text-[12px] text-[#6b7280]">
            Өнөөдрийн тойм —{" "}
            <span className="font-semibold text-[#374151]">{dateLabel}</span>
            {user.email && (
              <span className="text-[#9ca3af]"> · {user.email}</span>
            )}
          </p>
        </section>

        {/* Stats */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Идэвхтэй эмч"
            value={activeDoctors}
            tone="violet"
            icon="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M18 3.1a4 4 0 0 1 0 7.8"
          />
          <StatCard
            label="Чөлөөт цаг (7 хоног)"
            value={openSlots}
            tone="pink"
            icon="M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
          />
          <StatCard
            label="Өнөөдрийн захиалга"
            value={appointmentsToday}
            tone="blue"
            icon="M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11"
          />
          <StatCard
            label="Энэ сарын захиалга"
            value={appointmentsMonth}
            tone="green"
            icon="M3 17l6-6 4 4 8-8M14 7h7v7"
          />
          <StatCard
            label="7 хоногийн захиалга"
            value={appointmentsWeek}
            tone="orange"
            icon="M3 7h18M3 12h18M3 17h12"
          />
          <StatCard
            label="Нийт захиалга"
            value={appointmentsAll}
            tone="magenta"
            icon="M3 21V8l9-5 9 5v13M9 21V12h6v9"
          />
        </section>

        {/* Bottom quick links */}
        <section className="grid gap-3 lg:grid-cols-2">
          <Link
            href="/admin/appointments"
            className="group relative overflow-hidden rounded-[16px] bg-white p-5 shadow-[0_8px_20px_-14px_rgba(15,23,42,0.15)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-14px_rgba(12,123,110,0.2)]"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[15px] font-extrabold text-[#0f172a]">
                Удахгүй болох захиалга
              </h3>
              <span className="text-[12px] font-bold text-[#0c7b6e] group-hover:translate-x-0.5 transition-transform">
                Бүгдийг харах →
              </span>
            </div>
            <p className="mt-6 text-center text-[12px] text-[#9ca3af]">
              Захиалгуудын дэлгэрэнгүй жагсаалт
            </p>
          </Link>

          <Link
            href="/admin/slots"
            className="group relative overflow-hidden rounded-[16px] bg-white p-5 shadow-[0_8px_20px_-14px_rgba(15,23,42,0.15)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-14px_rgba(236,72,153,0.2)]"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[15px] font-extrabold text-[#0f172a]">
                Өнөөдөр болох захиалга
              </h3>
              <span className="text-[12px] font-bold text-[#ec4899] group-hover:translate-x-0.5 transition-transform">
                Харах →
              </span>
            </div>
            <p className="mt-6 text-center text-[12px] text-[#9ca3af]">
              Нийт {appointmentsToday} захиалга
            </p>
          </Link>
        </section>
      </div>
    </div>
  );
}
