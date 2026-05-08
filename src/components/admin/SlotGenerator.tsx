"use client";

import { useActionState } from "react";
import { generateSlotsAction, type SlotGenState } from "@/lib/actions/admin";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Props = {
  doctors: Array<{
    id: string;
    name_mn: string;
    department: { name_mn: string } | null;
  }>;
};

const initial: SlotGenState = {};

export function SlotGenerator({ doctors }: Props) {
  const [state, action, pending] = useActionState(generateSlotsAction, initial);
  const today = new Date().toISOString().slice(0, 10);
  const inTwoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  return (
    <form action={action} className="grid gap-5">
      <div>
        <label
          htmlFor="doctor_id"
          className="text-sm font-medium text-ink-2"
        >
          Эмч
        </label>
        <select
          id="doctor_id"
          name="doctor_id"
          required
          className="mt-1.5 h-11 w-full rounded-xl border border-line bg-surface px-4 text-[15px]"
        >
          <option value="">— сонгох —</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name_mn}
              {d.department ? ` · ${d.department.name_mn}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          name="from_date"
          type="date"
          label="Эхлэх өдөр"
          defaultValue={today}
          required
        />
        <Input
          name="to_date"
          type="date"
          label="Дуусах өдөр"
          defaultValue={inTwoWeeks}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          name="start_time"
          type="time"
          label="Эхлэх цаг"
          defaultValue="09:00"
          required
        />
        <Input
          name="end_time"
          type="time"
          label="Дуусах цаг"
          defaultValue="17:00"
          required
        />
      </div>

      <Input
        name="minutes"
        type="number"
        label="Уртын урт (минут)"
        defaultValue={30}
        min={10}
        max={120}
        step={5}
      />

      <label className="inline-flex items-center gap-2 text-sm text-ink-2">
        <input
          type="checkbox"
          name="skip_weekend"
          defaultChecked
          className="h-4 w-4 rounded border-line"
        />
        Бямба, Ням гариг алгасах
      </label>

      {state.ok && (
        <p className="rounded-xl border border-success/30 bg-success/8 px-4 py-3 text-sm text-success">
          Амжилттай үүсгэлээ. {state.inserted ?? "Хэдэн ч"} мөр нэмэгдсэн.
        </p>
      )}
      {state.error && (
        <p className="rounded-xl border border-danger/30 bg-danger/8 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Үүсгэж байна…" : "Чөлөөт цаг үүсгэх"}
      </Button>
    </form>
  );
}
