import { requireAdminUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase/server";
import { SlotGenerator } from "@/components/admin/SlotGenerator";

export default async function AdminSlotsPage() {
  await requireAdminUser();
  const supabase = await createSupabaseServer();
  const { data: doctors } = await supabase
    .from("doctors")
    .select("id,name_mn,department:departments!doctors_department_id_fkey(name_mn)")
    .eq("is_active", true)
    .order("name_mn");

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">
        ◦ Admin
      </p>
      <h1 className="font-display mt-1 text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
        Чөлөөт цагуудыг бөөнөөр үүсгэх
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Эмч сонгож, өдрийн муж + ажлын цагийг өгөхөд систем 30-минутын зайтай
        чөлөөт цагуудыг автоматаар үүсгэнэ. Давхцсан цагийг алгасна.
      </p>

      <div className="mt-8 rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <SlotGenerator
          doctors={(doctors ?? []) as Array<{
            id: string;
            name_mn: string;
            department: { name_mn: string } | null;
          }>}
        />
      </div>
    </div>
  );
}
