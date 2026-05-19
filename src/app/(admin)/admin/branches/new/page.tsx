import Link from "next/link";
import { requireAdminUser } from "@/lib/auth";
import { BranchForm } from "@/components/admin/BranchForm";

export default async function AdminBranchNewPage() {
  await requireAdminUser();

  return (
    <div>
      <header className="flex items-center justify-between gap-4 border-b border-line bg-white/90 px-6 py-5 backdrop-blur sm:px-10">
        <h1 className="font-display text-[20px] font-extrabold uppercase tracking-tight text-[#0f172a] sm:text-[24px]">
          Шинэ салбар
        </h1>
        <Link
          href="/admin/branches"
          className="text-[12px] font-bold text-[#0f172a] hover:text-primary transition-colors"
        >
          ← Жагсаалт
        </Link>
      </header>

      <div className="px-6 py-8 sm:px-10 sm:py-10">
        <div className="rounded-[22px] bg-white p-6 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.18)] ring-1 ring-line sm:p-8">
          <BranchForm />
        </div>
      </div>
    </div>
  );
}
