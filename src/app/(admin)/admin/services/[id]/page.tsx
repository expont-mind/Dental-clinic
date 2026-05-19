import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminUser } from "@/lib/auth";
import { listDepartments } from "@/lib/queries/catalog";
import { getServiceById, listServicesAdmin } from "@/lib/queries/admin";
import { listBranchesAdmin, listBranchIdsForService } from "@/lib/queries/branches";
import { ServiceForm } from "@/components/admin/ServiceForm";

export default async function AdminServiceEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminUser();
  const { id } = await params;
  const [service, departments, branches, branchIds, allServices] = await Promise.all([
    getServiceById(id),
    listDepartments(),
    listBranchesAdmin(),
    listBranchIdsForService(id),
    listServicesAdmin(),
  ]);
  // Parent options: services without a parent (excluding self)
  const parentOptions = allServices
    .filter((s) => !s.parent_id && s.id !== id)
    .map((s) => ({ id: s.id, name_mn: s.name_mn }));
  if (!service) notFound();

  return (
    <div>
      <header className="flex items-center justify-between gap-4 border-b border-line bg-white/90 px-6 py-5 backdrop-blur sm:px-10">
        <div>
          <h1 className="font-display text-[20px] font-extrabold uppercase tracking-tight text-[#0f172a] sm:text-[24px]">
            {service.name_mn}
          </h1>
          <p className="text-[12px] text-[#6b7280]">
            {service.name_en} · {service.slug}
          </p>
        </div>
        <Link
          href="/admin/services"
          className="text-[12px] font-bold text-[#0f172a] hover:text-primary transition-colors"
        >
          ← Жагсаалт
        </Link>
      </header>

      <div className="px-6 py-8 sm:px-10 sm:py-10">
        <div className="rounded-[22px] bg-white p-6 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.18)] ring-1 ring-line sm:p-8">
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
            parentServices={parentOptions}
            existingBranchIds={branchIds}
            existing={{
              id: service.id,
              slug: service.slug,
              department_id: service.department_id,
              name_mn: service.name_mn,
              name_en: service.name_en,
              description_mn: service.description_mn,
              description_en: service.description_en,
              category: service.category,
              price_cents: service.price_cents,
              duration_min: service.duration_min,
              parent_id: service.parent_id ?? null,
              itdoctor_service_id: service.itdoctor_service_id ?? null,
              image_url: service.image_url ?? null,
              hero_image_url: service.hero_image_url ?? null,
              is_active: service.is_active,
              sort_order: service.sort_order,
            }}
          />
        </div>
      </div>
    </div>
  );
}
