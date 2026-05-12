import Link from "next/link";
import { requireAdminUser } from "@/lib/auth";
import { listDepartments } from "@/lib/queries/catalog";
import { DoctorForm } from "@/components/admin/DoctorForm";

export default async function AdminTeamNewPage() {
  await requireAdminUser();
  const departments = await listDepartments();

  return (
    <div>
      {/* Top bar */}
      <header className="flex items-center justify-between gap-4 border-b border-line bg-white/90 px-6 py-5 backdrop-blur sm:px-10">
        <h1 className="font-display text-[20px] font-extrabold uppercase tracking-tight text-[#0f172a] sm:text-[24px]">
          Манай хамт олон
        </h1>
        <p className="hidden text-[12px] text-[#6b7280] sm:block">
          Шинэ эмч бүртгэх
        </p>
      </header>

      <div className="space-y-6 px-6 py-8 sm:px-10 sm:py-10">
        {/* Section header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-[20px] font-extrabold tracking-tight text-[#0f172a] sm:text-[24px]">
            Эмч нар
          </h2>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/team"
              className="text-[12px] font-bold text-[#0f172a] hover:text-primary transition-colors"
            >
              Жагсаалт
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-[12px] font-bold text-white">
              + Бүртгүүлэх
            </span>
          </div>
        </div>

        {/* Form card */}
        <div className="rounded-[22px] bg-white p-6 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.18)] ring-1 ring-line sm:p-8">
          <h3 className="font-display text-[18px] font-extrabold tracking-tight text-[#0f172a]">
            Шинэ эмч бүртгэх
          </h3>
          <p className="mt-1 text-[12px] text-[#6b7280]">
            Бүх мэдээлэл оруулаад &ldquo;Бүртгэх&rdquo; товчийг дарна уу.
          </p>

          <div className="mt-6 border-t border-line pt-6">
            <DoctorForm
              departments={departments.map((d) => ({
                id: d.id,
                name: d.name_mn,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
