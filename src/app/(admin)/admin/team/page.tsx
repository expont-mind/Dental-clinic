import Image from "next/image";
import Link from "next/link";
import { requireAdminUser, isSupabaseConfigured } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase/server";
import { listDoctors } from "@/lib/queries/catalog";

type DoctorStats = {
  appointments: number;
  revenue: number;
};

async function fetchDoctorStats(): Promise<Map<string, DoctorStats>> {
  const stats = new Map<string, DoctorStats>();
  if (!isSupabaseConfigured()) return stats;
  try {
    const supabase = await createSupabaseServer();
    const { data } = await supabase
      .from("appointments")
      .select(
        "id,status,time_slot:time_slots!appointments_time_slot_id_fkey(doctor_id)",
      )
      .limit(2000);
    type Row = {
      id: string;
      status: string;
      time_slot: { doctor_id: string } | null;
    };
    for (const r of (data ?? []) as unknown as Row[]) {
      const docId = r.time_slot?.doctor_id;
      if (!docId) continue;
      const prev = stats.get(docId) ?? { appointments: 0, revenue: 0 };
      stats.set(docId, {
        appointments: prev.appointments + 1,
        revenue:
          r.status === "completed" ? prev.revenue + 60000 : prev.revenue,
      });
    }
  } catch {
    // ignore
  }
  return stats;
}

export default async function AdminTeamPage() {
  await requireAdminUser();
  const doctors = await listDoctors();
  const stats = await fetchDoctorStats();

  return (
    <div>
      {/* Top bar */}
      <header className="flex items-center justify-between gap-4 border-b border-line bg-white/90 px-5 py-3.5 backdrop-blur sm:px-8">
        <h1 className="font-display text-[16px] font-extrabold uppercase tracking-tight text-[#0f172a] sm:text-[20px]">
          Манай хамт олон
        </h1>
        <p className="hidden text-[12px] text-[#6b7280] sm:block">
          Нийт {doctors.length} эмч
        </p>
      </header>

      <div className="space-y-4 px-5 py-5 sm:px-8 sm:py-6">
        {/* Section header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-[16px] font-extrabold tracking-tight text-[#0f172a] sm:text-[20px]">
            Эмч нар
          </h2>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-[11px] font-bold text-white">
              Жагсаалт
            </span>
            <Link
              href="/admin/team/new"
              className="text-[11px] font-bold text-[#0f172a] hover:text-primary transition-colors"
            >
              + Бүртгүүлэх
            </Link>
          </div>
        </div>

        {/* Doctor grid */}
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((d) => {
            const name = d.name_mn;
            const title = d.title_mn;
            const deptName = d.department.name_mn;
            const s = stats.get(d.id) ?? { appointments: 0, revenue: 0 };
            return (
              <li
                key={d.id}
                className="rounded-[14px] bg-white p-4 shadow-[0_6px_18px_-12px_rgba(15,23,42,0.15)] ring-1 ring-line"
              >
                {/* Photo (square) + name + role */}
                <div className="flex items-start gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-primary-soft ring-1 ring-line">
                    {d.photo_url ? (
                      <Image
                        src={d.photo_url}
                        alt={name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center font-display text-lg font-bold text-primary">
                        {name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <h3 className="font-display text-[13px] font-extrabold leading-tight text-[#0f172a]">
                      {name}
                    </h3>
                    <p className="mt-1 text-[11px] font-bold text-primary line-clamp-2">
                      {title || deptName}
                    </p>
                  </div>
                </div>

                {/* Stats — appointments | revenue */}
                <div className="mt-3 grid grid-cols-2 overflow-hidden rounded-lg bg-[#fafbff] ring-1 ring-line">
                  <div className="px-2 py-2 text-center">
                    <p className="font-display text-[14px] font-extrabold leading-none text-[#0f172a]">
                      {s.appointments}
                    </p>
                    <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#9ca3af]">
                      Захиалга
                    </p>
                  </div>
                  <div className="border-l border-line px-2 py-2 text-center">
                    <p className="font-display text-[14px] font-extrabold leading-none text-emerald-600">
                      {s.revenue > 0
                        ? `${(s.revenue / 1000).toFixed(0)}K₮`
                        : "0₮"}
                    </p>
                    <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#9ca3af]">
                      Орлого
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 flex items-center gap-3 border-t border-line pt-2.5 text-[10.5px] font-bold">
                  <Link
                    href={`/mn/doctors/${d.slug}`}
                    target="_blank"
                    className="text-primary hover:underline"
                  >
                    Дэлгэрэнгүй
                  </Link>
                  <button
                    type="button"
                    className="text-[#6b7280] hover:text-[#0f172a] transition-colors"
                  >
                    Засах
                  </button>
                  <button
                    type="button"
                    className="ml-auto text-rose-600 hover:text-rose-700 transition-colors"
                  >
                    Устгах
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        {doctors.length === 0 && (
          <div className="grid place-items-center rounded-[22px] bg-white p-16 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.18)] text-center">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary-soft text-primary">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
              </svg>
            </span>
            <p className="mt-5 font-display text-[18px] font-bold text-[#0f172a]">
              Эмч бүртгэгдээгүй байна
            </p>
            <p className="mt-2 max-w-sm text-[13px] leading-6 text-[#6b7280]">
              Шинэ эмч нэмж бүртгэхийн тулд &ldquo;Бүртгүүлэх&rdquo; товчийг
              ашиглана уу.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
