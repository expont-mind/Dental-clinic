import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminUser } from "@/lib/auth";
import { listDepartments } from "@/lib/queries/catalog";
import { getServiceById, listServicesAdmin } from "@/lib/queries/admin";
import { listBranchesAdmin, listBranchIdsForService } from "@/lib/queries/branches";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { DeleteServiceButton } from "@/components/admin/DeleteServiceButton";

export default async function AdminServiceEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminUser();
  const { id } = await params;
  const [service, departments, branches, branchIds, allServices] =
    await Promise.all([
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
  // A service is a "category" if any other row points to it as a parent.
  // Categories are navigation-only — the form hides booking-related fields.
  const hasChildren = allServices.some((s) => s.parent_id === id);
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
        <div className="flex items-center gap-3">
          <Link
            href="/admin/services"
            className="text-[12px] font-bold text-[#0f172a] hover:text-primary transition-colors"
          >
            ← Жагсаалт
          </Link>
          <DeleteServiceButton id={service.id} name={service.name_mn} />
        </div>
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
            parentServices={parentOptions}
            hasChildren={hasChildren}
            existingBranchIds={branchIds}
            existing={{
              id: service.id,
              slug: service.slug,
              department_id: service.department_id,
              name_mn: service.name_mn,
              name_en: service.name_en,
              description_mn: service.description_mn,
              description_en: service.description_en,
              long_description_mn: service.long_description_mn,
              long_description_en: service.long_description_en,
              duration_text_mn: service.duration_text_mn,
              duration_text_en: service.duration_text_en,
              price_text_mn: service.price_text_mn,
              price_text_en: service.price_text_en,
              price_cents: service.price_cents,
              duration_min: service.duration_min,
              parent_id: service.parent_id ?? null,
              itdoctor_service_id: service.itdoctor_service_id ?? null,
              image_url: service.image_url ?? null,
              hero_image_url: service.hero_image_url ?? null,
              is_active: service.is_active,
              is_featured: service.is_featured ?? false,
              is_bookable: service.is_bookable ?? true,
              show_duration: service.show_duration ?? false,
              is_multi_visit: service.is_multi_visit ?? false,
              sort_order: service.sort_order,
              content_mn: service.content_mn ?? null,
              content_en: service.content_en ?? null,
            }}
          />
      </div>
    </div>
  );
}
