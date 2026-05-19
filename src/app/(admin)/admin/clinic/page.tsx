import { requireAdminUser } from "@/lib/auth";
import { getClinicProfile } from "@/lib/queries/admin";
import { ClinicProfileForm } from "@/components/admin/ClinicProfileForm";

export default async function AdminClinicPage() {
  await requireAdminUser();
  const profile = await getClinicProfile();

  return (
    <div>
      <header className="flex items-center justify-between gap-4 border-b border-line bg-white/90 px-6 py-5 backdrop-blur sm:px-10">
        <h1 className="font-display text-[20px] font-extrabold uppercase tracking-tight text-[#0f172a] sm:text-[24px]">
          Эмнэлгийн профайл
        </h1>
        <p className="hidden text-[12px] text-[#6b7280] sm:block">
          Dentexgo чатботод синк болох мэдээлэл
        </p>
      </header>

      <div className="px-6 py-8 sm:px-10 sm:py-10">
        <div className="rounded-[22px] bg-white p-6 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.18)] ring-1 ring-line sm:p-8">
          {profile ? (
            <ClinicProfileForm profile={profile} />
          ) : (
            <div className="text-[13px] text-[#6b7280]">
              Профайл олдсонгүй. Supabase холбосны дараа{" "}
              <code className="rounded bg-[#f3f4f6] px-1.5 py-0.5 font-mono text-[12px]">
                supabase/02_dentexgo_integration.sql
              </code>{" "}
              migration ажиллуулсан эсэхийг шалгана уу.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
