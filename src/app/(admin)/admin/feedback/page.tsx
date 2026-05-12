import Link from "next/link";
import { requireAdminUser, isSupabaseConfigured } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase/server";
import { translateError } from "@/lib/utils/translate-error";
import { listLocalFeedback } from "@/lib/data/feedback-store";
import { FeedbackCard } from "@/components/admin/FeedbackCard";

/** Format an ISO timestamp as `YYYY.MM.DD HH:MM` in Ulaanbaatar time. */
function formatNumeric(iso: string): string {
  const date = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ulaanbaatar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}.${get("month")}.${get("day")} ${get("hour")}:${get("minute")}`;
}

type FeedbackRow = {
  id: string;
  name: string | null;
  phone: string | null;
  message: string;
  status: "new" | "read" | "resolved" | string;
  created_at: string;
  source: "supabase" | "local";
};

const STATUS_LABEL: Record<string, string> = {
  new: "Шинэ",
  read: "Уншсан",
  resolved: "Шийдсэн",
};

const STATUS_DOT: Record<string, string> = {
  new: "bg-rose-500",
  read: "bg-amber-500",
  resolved: "bg-emerald-500",
};

function isTableMissing(error: { code?: string; message?: string; hint?: string }) {
  const msg = `${error.code ?? ""} ${error.message ?? ""} ${error.hint ?? ""}`.toLowerCase();
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    msg.includes("does not exist") ||
    msg.includes("could not find") ||
    msg.includes("schema cache")
  );
}

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireAdminUser();
  const sp = await searchParams;
  const activeTab: "new" | "resolved" =
    sp.tab === "resolved" ? "resolved" : "new";

  let supabaseRows: FeedbackRow[] = [];
  let errorMessage: string | null = null;
  let tableMissing = false;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServer();
      const { data, error } = await supabase
        .from("feedback")
        .select("id,name,phone,message,status,created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) {
        if (isTableMissing(error)) {
          tableMissing = true;
        } else {
          errorMessage = translateError(error);
        }
      } else if (data) {
        supabaseRows = data.map((r) => ({
          ...r,
          source: "supabase" as const,
        }));
      }
    } catch {
      // ignore, fall through to local
    }
  }

  const localRaw = await listLocalFeedback();
  const localRows: FeedbackRow[] = localRaw.map((r) => ({
    ...r,
    source: "local" as const,
  }));

  const allRows: FeedbackRow[] = [...supabaseRows, ...localRows].sort((a, b) =>
    a.created_at < b.created_at ? 1 : -1,
  );

  const newRows = allRows.filter((r) => r.status !== "resolved");
  const resolvedRows = allRows.filter((r) => r.status === "resolved");
  const rows = activeTab === "resolved" ? resolvedRows : newRows;

  return (
    <div>
      {/* Top bar */}
      <header className="flex items-center justify-between gap-4 border-b border-line bg-white/90 px-6 py-5 backdrop-blur sm:px-10">
        <h1 className="font-display text-[20px] font-extrabold uppercase tracking-tight text-[#0f172a] sm:text-[24px]">
          Санал хүсэлт
        </h1>
        <p className="hidden text-[12px] text-[#6b7280] sm:block">
          Шинэ: {newRows.length} · Шийдсэн: {resolvedRows.length}
        </p>
      </header>

      {/* Tabs */}
      <nav className="border-b border-line bg-white px-6 sm:px-10">
        <div className="flex gap-1">
          <Link
            href="/admin/feedback?tab=new"
            scroll={false}
            className={
              "relative -mb-px inline-flex items-center gap-2 border-b-2 px-4 py-3 text-[13px] font-bold transition-colors " +
              (activeTab === "new"
                ? "border-primary text-primary"
                : "border-transparent text-[#6b7280] hover:text-[#0f172a]")
            }
          >
            <span
              className={
                "inline-block h-1.5 w-1.5 rounded-full " +
                (activeTab === "new" ? "bg-rose-500" : "bg-rose-300")
              }
            />
            Шинэ
            <span
              className={
                "rounded-full px-2 py-0.5 text-[10px] " +
                (activeTab === "new"
                  ? "bg-primary text-white"
                  : "bg-[#f3f4f6] text-[#6b7280]")
              }
            >
              {newRows.length}
            </span>
          </Link>
          <Link
            href="/admin/feedback?tab=resolved"
            scroll={false}
            className={
              "relative -mb-px inline-flex items-center gap-2 border-b-2 px-4 py-3 text-[13px] font-bold transition-colors " +
              (activeTab === "resolved"
                ? "border-primary text-primary"
                : "border-transparent text-[#6b7280] hover:text-[#0f172a]")
            }
          >
            <span
              className={
                "inline-block h-1.5 w-1.5 rounded-full " +
                (activeTab === "resolved" ? "bg-emerald-500" : "bg-emerald-300")
              }
            />
            Шийдсэн
            <span
              className={
                "rounded-full px-2 py-0.5 text-[10px] " +
                (activeTab === "resolved"
                  ? "bg-primary text-white"
                  : "bg-[#f3f4f6] text-[#6b7280]")
              }
            >
              {resolvedRows.length}
            </span>
          </Link>
        </div>
      </nav>

      <div className="space-y-6 px-6 py-8 sm:px-10 sm:py-10">
        {errorMessage && (
          <p className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-[13px] text-danger">
            {errorMessage}
          </p>
        )}

        {tableMissing && (
          <div className="rounded-[20px] bg-amber-50 p-5 ring-1 ring-amber-200">
            <p className="font-display text-[14px] font-bold text-amber-900">
              ⚠️ Supabase <code className="font-mono">feedback</code> хүснэгт олдсонгүй
            </p>
            <p className="mt-2 text-[12px] leading-6 text-amber-800">
              Доорх SQL-г Supabase SQL Editor дотроо ажиллуулна уу. Тэр хүртэл шинэ
              санал хүсэлтийг локал файлд (`tmp/dentaris/feedback.json`) хадгална.
            </p>
            <pre className="mt-3 overflow-x-auto rounded-xl bg-white p-4 text-[11px] leading-6 text-amber-900 ring-1 ring-amber-200">
              {`create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);
alter table public.feedback enable row level security;
create policy "Anyone can submit" on public.feedback
  for insert with check (true);
create policy "Admins read" on public.feedback
  for select using (true);`}
            </pre>
          </div>
        )}

        {rows.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((r) => (
              <li key={r.id}>
                <FeedbackCard
                  row={r}
                  formattedDate={formatNumeric(r.created_at)}
                  statusLabel={STATUS_LABEL[r.status] ?? r.status}
                  statusDotClass={STATUS_DOT[r.status] ?? "bg-gray-400"}
                />
              </li>
            ))}
          </ul>
        ) : !tableMissing && !errorMessage ? (
          <div className="grid place-items-center rounded-[22px] bg-white p-16 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.18)] text-center">
            {activeTab === "resolved" ? (
              <>
                <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#f3f4f6] text-[#6b7280]">
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
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2zM8 9h8M8 13h6" />
                  </svg>
                </span>
                <p className="mt-5 font-display text-[18px] font-bold text-[#0f172a]">
                  Шийдсэн санал алга
                </p>
                <p className="mt-2 max-w-sm text-[13px] leading-6 text-[#6b7280]">
                  Шинэ саналыг харах товч дарж модал нээгээд &ldquo;Шийдсэн&rdquo;
                  гэж тэмдэглэхэд энд орж ирнэ.
                </p>
              </>
            ) : resolvedRows.length > 0 ? (
              <>
                <span className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12l5 5 9-11" />
                  </svg>
                </span>
                <p className="mt-5 font-display text-[18px] font-bold text-[#0f172a]">
                  Бүх санал шийдэгдсэн 🎉
                </p>
                <p className="mt-2 max-w-sm text-[13px] leading-6 text-[#6b7280]">
                  Нийт {resolvedRows.length} санал шийдэгдсэн байна. Шинэ санал
                  ирэх үед энд харагдана.
                </p>
              </>
            ) : (
              <>
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
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2zM8 9h8M8 13h6" />
                  </svg>
                </span>
                <p className="mt-5 font-display text-[18px] font-bold text-[#0f172a]">
                  Одоогоор санал хүсэлт алга
                </p>
                <p className="mt-2 max-w-sm text-[13px] leading-6 text-[#6b7280]">
                  Үйлчлүүлэгчид холбоо барих хуудаснаас санал илгээх боломжтой.
                  Шинэ санал ирэх үед энд харагдана.
                </p>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
