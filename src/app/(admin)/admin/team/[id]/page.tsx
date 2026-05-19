import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminUser } from "@/lib/auth";
import { listDepartments } from "@/lib/queries/catalog";
import { getDoctorByIdAdmin, listServicesAdmin } from "@/lib/queries/admin";
import { listBranchesAdmin, listBranchIdsForDoctor, listServiceIdsForDoctor } from "@/lib/queries/branches";
import { DoctorForm } from "@/components/admin/DoctorForm";

export default async function AdminDoctorEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminUser();
  const { id } = await params;
  const [doctor, departments, branches, branchIds, services, serviceIds] = await Promise.all([
    getDoctorByIdAdmin(id),
    listDepartments(),
    listBranchesAdmin(),
    listBranchIdsForDoctor(id),
    listServicesAdmin(),
    listServiceIdsForDoctor(id),
  ]);
  if (!doctor) notFound();

  return (
    <div>
      <header className="flex items-center justify-between gap-4 border-b border-line bg-white/90 px-6 py-5 backdrop-blur sm:px-10">
        <div>
          <h1 className="font-display text-[20px] font-extrabold uppercase tracking-tight text-[#0f172a] sm:text-[24px]">
            {doctor.name_mn}
          </h1>
          <p className="text-[12px] text-[#6b7280]">
            {doctor.name_en} · {doctor.slug}
          </p>
        </div>
        <Link
          href="/admin/team"
          className="text-[12px] font-bold text-[#0f172a] hover:text-primary transition-colors"
        >
          ← Жагсаалт
        </Link>
      </header>

      <div className="px-6 py-8 sm:px-10 sm:py-10">
        <div className="rounded-[22px] bg-white p-6 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.18)] ring-1 ring-line sm:p-8">
          <DoctorForm
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
            existingBranchIds={branchIds}
            services={services.map((s) => ({
              id: s.id,
              name_mn: s.name_mn,
              name_en: s.name_en,
            }))}
            existingServiceIds={serviceIds}
            existing={{
              id: doctor.id,
              department_id: doctor.department_id,
              name_mn: doctor.name_mn,
              name_en: doctor.name_en,
              title_mn: doctor.title_mn,
              title_en: doctor.title_en,
              bio_mn: doctor.bio_mn,
              bio_en: doctor.bio_en,
              photo_url: doctor.photo_url,
              years_exp: doctor.years_exp,
              itdoctor_dentist_id: doctor.itdoctor_dentist_id ?? null,
              is_active: doctor.is_active,
            }}
          />
        </div>
      </div>
    </div>
  );
}
