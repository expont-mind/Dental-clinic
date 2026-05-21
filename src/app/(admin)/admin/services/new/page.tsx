import Link from "next/link";
import { requireAdminUser } from "@/lib/auth";
import { listDepartments } from "@/lib/queries/catalog";
import { listBranchesAdmin } from "@/lib/queries/branches";
import { ServiceForm } from "@/components/admin/ServiceForm";

export default async function AdminServiceNewPage() {
  await requireAdminUser();
  const [departments, branches] = await Promise.all([
    listDepartments(),
    listBranchesAdmin(),
  ]);

  return (
    <div>
      <header className="flex items-center justify-between gap-4 border-b border-line bg-white/90 px-6 py-5 backdrop-blur sm:px-10">
        <h1 className="font-display text-[20px] font-extrabold uppercase tracking-tight text-[#0f172a] sm:text-[24px]">
          Шинэ үйлчилгээ
        </h1>
        <Link
          href="/admin/services"
          className="text-[12px] font-bold text-[#0f172a] hover:text-primary transition-colors"
        >
          ← Жагсаалт
        </Link>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8 sm:px-10 sm:py-10">
        <ServiceForm
            departments={departments.map((d) => ({
              id: d.id,
              name_mn: d.name_mn,
              name_en: d.name_en,
            }))}
            branches={branches.map((b) => ({
              id: b.id,
              name_mn: b.name_mn,
              name_en: b.name_en,
            }))}
          />
      </div>
    </div>
  );
}
