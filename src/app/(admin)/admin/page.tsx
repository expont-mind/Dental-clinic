import Link from "next/link";
import { requireAdminUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const user = await requireAdminUser();
  const supabase = await createSupabaseServer();

  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  const inSevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const [todayCountRes, weekCountRes, openSlotsRes, doctorsRes] =
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
    ]);

  const stats = [
    { label: "Өнөөдрийн захиалга", value: todayCountRes.count ?? 0 },
    { label: "7 хоногийн захиалга", value: weekCountRes.count ?? 0 },
    { label: "Чөлөөт цаг (7 хоног)", value: openSlotsRes.count ?? 0 },
    { label: "Идэвхтэй эмч", value: doctorsRes.count ?? 0 },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">
        Сайн байна уу,
      </p>
      <h1 className="font-display mt-1 text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
        {user.email}
      </h1>

      <ul className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line lg:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label} className="bg-surface p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-2">
              {s.label}
            </p>
            <p className="font-display mt-2 text-4xl font-medium tracking-tight">
              {s.value}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <Link
          href="/admin/appointments"
          className="group rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-primary/40"
        >
          <h2 className="font-display text-xl font-medium tracking-tight">
            Захиалгуудыг харах
          </h2>
          <p className="mt-2 text-sm text-muted">
            Орж ирсэн захиалгуудыг харах, статусыг өөрчлөх.
          </p>
          <span className="mt-4 inline-flex items-center text-sm font-medium text-primary">
            Үргэлжлүүлэх <span className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
          </span>
        </Link>
        <Link
          href="/admin/slots"
          className="group rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-primary/40"
        >
          <h2 className="font-display text-xl font-medium tracking-tight">
            Чөлөөт цаг үүсгэх
          </h2>
          <p className="mt-2 text-sm text-muted">
            Тодорхой эмчийн долоо хоногийн чөлөөт цагуудыг бөөнөөр үүсгэх.
          </p>
          <span className="mt-4 inline-flex items-center text-sm font-medium text-primary">
            Үргэлжлүүлэх <span className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
