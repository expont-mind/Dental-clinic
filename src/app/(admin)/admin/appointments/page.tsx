import { requireAdminUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatFull } from "@/lib/utils/datetime";
import { updateAppointmentStatusAction } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/Badge";

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
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">
        ◦ Admin
      </p>
      <h1 className="font-display mt-1 text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
        Захиалгууд
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Сүүлийн 200 захиалга. Статус солихын тулд баруун талын товчийг ашиглана уу.
      </p>

      {error && (
        <p className="mt-6 rounded-xl border border-danger/30 bg-danger/8 px-4 py-3 text-sm text-danger">
          {error.message}
        </p>
      )}

      <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface-2 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Үйлчлүүлэгч</th>
              <th className="px-5 py-3 font-medium">Утас</th>
              <th className="px-5 py-3 font-medium">Эмч / Тасаг</th>
              <th className="px-5 py-3 font-medium">Цаг</th>
              <th className="px-5 py-3 font-medium">Статус</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.id} className="align-top">
                <td className="px-5 py-4">
                  <p className="font-medium text-ink">{r.patient_name}</p>
                  {r.patient_notes && (
                    <p className="mt-1 max-w-xs text-xs text-muted line-clamp-2">
                      {r.patient_notes}
                    </p>
                  )}
                </td>
                <td className="px-5 py-4 font-mono text-xs text-ink-2">
                  {r.patient_phone}
                </td>
                <td className="px-5 py-4">
                  <p className="text-ink">
                    {r.time_slot?.doctor?.name_mn ?? "—"}
                  </p>
                  <p className="text-xs text-muted">
                    {r.time_slot?.doctor?.department?.name_mn ?? ""}
                  </p>
                </td>
                <td className="px-5 py-4 text-xs text-ink-2">
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
                  <form action={updateAppointmentStatusAction} className="flex gap-2">
                    <input type="hidden" name="id" value={r.id} />
                    <select
                      name="status"
                      defaultValue={r.status}
                      className="h-8 rounded-md border border-line bg-surface px-2 text-xs"
                    >
                      <option value="confirmed">Батлагдсан</option>
                      <option value="completed">Дууссан</option>
                      <option value="cancelled">Цуцлагдсан</option>
                    </select>
                    <button
                      type="submit"
                      className="rounded-md border border-line bg-surface px-2.5 text-xs font-medium hover:border-line-strong"
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
                  className="px-5 py-12 text-center text-muted"
                >
                  Одоогоор захиалга алга.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
