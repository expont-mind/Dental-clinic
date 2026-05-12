import { requireAdminUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatFull } from "@/lib/utils/datetime";
import { updateAppointmentStatusAction } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/Badge";
import { translateError } from "@/lib/utils/translate-error";

type AppointmentRow = {
  id: string;
  patient_name: string;
  patient_phone: string;
  patient_notes: string | null;
  status: "confirmed" | "completed" | "cancelled";
  created_at: string;
  time_slot: {
    slot_start: string;
    doctor: { name_mn: string; department: { name_mn: string } | null } | null;
  } | null;
};

const STATUS_TONES = {
  confirmed: "primary",
  completed: "success",
  cancelled: "danger",
} as const;

const STATUS_LABEL = {
  confirmed: "Батлагдсан",
  completed: "Дууссан",
  cancelled: "Цуцлагдсан",
} as const;

export default async function AdminAppointmentsPage() {
  await requireAdminUser();
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("appointments")
    .select(
      "id,patient_name,patient_phone,patient_notes,status,created_at,time_slot:time_slots!appointments_time_slot_id_fkey(slot_start,doctor:doctors!time_slots_doctor_id_fkey(name_mn,department:departments!doctors_department_id_fkey(name_mn)))",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = ((data ?? []) as unknown) as AppointmentRow[];

  return (
    <div>
      {/* Top bar */}
      <header className="flex items-center justify-between gap-4 border-b border-line bg-white/90 px-6 py-5 backdrop-blur sm:px-10">
        <h1 className="font-display text-[20px] font-extrabold uppercase tracking-tight text-[#0f172a] sm:text-[24px]">
          Захиалгууд
        </h1>
        <p className="hidden text-[12px] text-[#6b7280] sm:block">
          Сүүлийн 200 захиалга
        </p>
      </header>

      <div className="space-y-6 px-6 py-8 sm:px-10 sm:py-10">
        {error && (
          <p className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-[13px] text-danger">
            {translateError(error)}
          </p>
        )}

        <div className="overflow-x-auto rounded-[22px] bg-white shadow-[0_10px_30px_-18px_rgba(15,23,42,0.18)]">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-line bg-[#fafbff] text-[10px] uppercase tracking-[0.18em] text-[#6b7280]">
              <tr>
                <th className="px-5 py-4 font-bold">Үйлчлүүлэгч</th>
                <th className="px-5 py-4 font-bold">Утас</th>
                <th className="px-5 py-4 font-bold">Эмч / Тасаг</th>
                <th className="px-5 py-4 font-bold">Цаг</th>
                <th className="px-5 py-4 font-bold">Статус</th>
                <th className="px-5 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="align-top transition-colors hover:bg-[#fafbff]"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#0f172a]">
                      {r.patient_name}
                    </p>
                    {r.patient_notes && (
                      <p className="mt-1 max-w-xs text-[12px] text-[#6b7280] line-clamp-2">
                        {r.patient_notes}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 font-mono text-[12px] text-[#374151]">
                    {r.patient_phone}
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-[#0f172a]">
                      {r.time_slot?.doctor?.name_mn ?? "—"}
                    </p>
                    <p className="text-[11px] text-[#9ca3af]">
                      {r.time_slot?.doctor?.department?.name_mn ?? ""}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-[12px] text-[#374151]">
                    {r.time_slot
                      ? formatFull(r.time_slot.slot_start, "mn")
                      : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <Badge tone={STATUS_TONES[r.status]}>
                      {STATUS_LABEL[r.status]}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <form
                      action={updateAppointmentStatusAction}
                      className="flex gap-2"
                    >
                      <input type="hidden" name="id" value={r.id} />
                      <select
                        name="status"
                        defaultValue={r.status}
                        className="h-9 rounded-full border border-line bg-white px-3 text-[12px] font-medium outline-none focus:border-[#5b3df5]"
                      >
                        <option value="confirmed">Батлагдсан</option>
                        <option value="completed">Дууссан</option>
                        <option value="cancelled">Цуцлагдсан</option>
                      </select>
                      <button
                        type="submit"
                        className="grid h-9 w-9 place-items-center rounded-full bg-[#5b3df5] text-white text-[14px] font-bold hover:bg-[#4b2fd5] transition-colors"
                        aria-label="Хадгалах"
                      >
                        ✓
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-16 text-center text-[14px] text-[#9ca3af]"
                  >
                    Одоогоор захиалга алга.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
