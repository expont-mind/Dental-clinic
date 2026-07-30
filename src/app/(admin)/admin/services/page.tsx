import Link from "next/link";
import { requireAdminUser } from "@/lib/auth";
import { listServicesAdmin } from "@/lib/queries/admin";
import {
  ServicesTable,
  type AdminServiceRow,
} from "@/components/admin/ServicesTable";

export default async function AdminServicesPage() {
  await requireAdminUser();
  const services = await listServicesAdmin();

  // Build a lookup map so child rows can display their parent's name.
  const nameById = new Map<string, string>();
  for (const s of services) nameById.set(s.id, s.name_mn);

  const rows: AdminServiceRow[] = services.map((s) => ({
    id: s.id,
    slug: s.slug,
    name_mn: s.name_mn,
    name_en: s.name_en,
    department_mn: s.department.name_mn,
    parent_id: s.parent_id ?? null,
    parent_name_mn: s.parent_id ? (nameById.get(s.parent_id) ?? null) : null,
    price_cents: s.price_cents,
    duration_min: s.duration_min,
    is_active: s.is_active,
    is_featured: s.is_featured ?? false,
    is_bookable: s.is_bookable ?? true,
  }));

  return (
    <div>
      <header className="flex items-center justify-between gap-4 border-b border-line bg-white/90 px-6 py-5 backdrop-blur sm:px-10">
        <div>
          <h1 className="font-display text-[20px] font-extrabold uppercase tracking-tight text-[#0f172a] sm:text-[24px]">
            Үйлчилгээ
          </h1>
          <p className="mt-0.5 text-[11px] text-[#6b7280]">
            Бүх үйлчилгээ — идэвхтэй, идэвхгүй, гадаад холбоост бүгд харагдана.
          </p>
        </div>
        <Link
          href="/admin/services/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-[12px] font-bold text-white hover:bg-primary-hover transition-colors"
        >
          + Нэмэх
        </Link>
      </header>

      <div className="px-6 py-8 sm:px-10 sm:py-10">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-[13px] text-[#6b7280]">
            Үйлчилгээ алга. Supabase холбосны дараа migration ажиллуулж, дараа
            нь шинээр үүсгэнэ үү.
          </div>
        ) : (
          <ServicesTable rows={rows} />
        )}
      </div>
    </div>
  );
}
