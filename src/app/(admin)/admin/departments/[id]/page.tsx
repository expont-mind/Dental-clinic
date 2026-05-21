import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminUser } from "@/lib/auth";
import {
  getDepartmentByIdAdmin,
  countDepartmentDependents,
} from "@/lib/queries/admin";
import { DepartmentForm } from "@/components/admin/DepartmentForm";

export default async function AdminDepartmentEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminUser();
  const { id } = await params;
  const [dept, dependents] = await Promise.all([
    getDepartmentByIdAdmin(id),
    countDepartmentDependents(),
  ]);
  if (!dept) notFound();

  const dep = dependents.get(dept.id) ?? { doctors: 0, services: 0 };

  return (
    <div>
      <header className="flex items-center justify-between gap-4 border-b border-line bg-white/90 px-6 py-5 backdrop-blur sm:px-10">
        <div>
          <h1 className="font-display text-[20px] font-extrabold uppercase tracking-tight text-[#0f172a] sm:text-[24px]">
            {dept.name_mn}
          </h1>
          <p className="text-[12px] text-[#6b7280]">
            {dept.name_en} · {dept.slug}
          </p>
        </div>
        <Link
          href="/admin/departments"
          className="text-[12px] font-bold text-[#0f172a] hover:text-primary transition-colors"
        >
          ← Жагсаалт
        </Link>
      </header>

      <div className="px-6 py-8 sm:px-10 sm:py-10">
        {(dep.doctors > 0 || dep.services > 0) && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-900">
            Энэ тасагт <strong>{dep.doctors}</strong> эмч,{" "}
            <strong>{dep.services}</strong> үйлчилгээ холбогдсон байна.
            Нэрийг өөрчилбөл тэдгээрт автоматаар тусна. Идэвхгүй болговол шинэ
            эмч / үйлчилгээ нэмэх үед сонгох боломжгүй болно.
          </div>
        )}

        <div className="rounded-[22px] bg-white p-6 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.18)] ring-1 ring-line sm:p-8">
          <DepartmentForm
            existing={{
              id: dept.id,
              slug: dept.slug,
              name_mn: dept.name_mn,
              name_en: dept.name_en,
              description_mn: dept.description_mn,
              description_en: dept.description_en,
              icon_key: dept.icon_key,
              sort_order: dept.sort_order,
              is_active: dept.is_active,
            }}
          />
        </div>
      </div>
    </div>
  );
}
