import { requireAdminUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/auth";
import { SlotGenerator } from "@/components/admin/SlotGenerator";

export default async function AdminSlotsPage() {
  await requireAdminUser();

  let doctors: Array<{
    id: string;
    name_mn: string;
    department: { name_mn: string } | null;
  }> = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServer();
      const { data } = await supabase
        .from("doctors")
        .select(
          "id,name_mn,department:departments!doctors_department_id_fkey(name_mn)",
        )
        .eq("is_active", true)
        .order("name_mn");
      doctors = (data ?? []) as unknown as typeof doctors;
    } catch {
      // dev bypass — supabase not connected
    }
  }

  return (
    <div>
      {/* Top bar */}
      <header className="flex items-center justify-between gap-4 border-b border-line bg-white/90 px-6 py-5 backdrop-blur sm:px-10">
        <h1 className="font-display text-[20px] font-extrabold uppercase tracking-tight text-[#0f172a] sm:text-[24px]">
          Чөлөөт цагуудыг үүсгэх
        </h1>
        <p className="hidden text-[12px] text-[#6b7280] sm:block">
          Эмч + цагийн хүрээ → 30 минутын цагууд
        </p>
      </header>

      <div className="space-y-6 px-6 py-8 sm:px-10 sm:py-10">
        <div className="rounded-[22px] bg-white p-7 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.18)] sm:p-9">
          <p className="text-[13px] leading-6 text-[#6b7280]">
            Эмч сонгож, өдрийн муж + ажлын цагийг өгөхөд систем 30-минутын
            зайтай чөлөөт цагуудыг автоматаар үүсгэнэ. Давхцсан цагийг алгасна.
          </p>
          <div className="mt-6">
            <SlotGenerator doctors={doctors} />
          </div>
        </div>
      </div>
    </div>
  );
}
