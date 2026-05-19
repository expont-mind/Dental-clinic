"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createBranchAction,
  updateBranchAction,
  type BranchFormState,
} from "@/lib/actions/branches";
import { BilingualField } from "./BilingualField";
import { useFormToast } from "@/lib/hooks/use-form-toast";
import type { Branch, ClinicHours } from "@/lib/supabase/types";

const initial: BranchFormState = {};

const DAY_LABELS: { key: keyof ClinicHours; mn: string; en: string }[] = [
  { key: "mon", mn: "Даваа", en: "Mon" },
  { key: "tue", mn: "Мягмар", en: "Tue" },
  { key: "wed", mn: "Лхагва", en: "Wed" },
  { key: "thu", mn: "Пүрэв", en: "Thu" },
  { key: "fri", mn: "Баасан", en: "Fri" },
  { key: "sat", mn: "Бямба", en: "Sat" },
  { key: "sun", mn: "Ням", en: "Sun" },
];

function splitRange(v: string | null): { open: string; close: string } {
  if (!v) return { open: "", close: "" };
  const [open, close] = v.split("-");
  return { open: open ?? "", close: close ?? "" };
}

export function BranchForm({ existing }: { existing?: Branch }) {
  const isEdit = Boolean(existing);
  const [state, formAction, pending] = useActionState(
    isEdit ? updateBranchAction : createBranchAction,
    initial,
  );
  useFormToast(state);

  const v = state.values ?? {};
  const hours: ClinicHours =
    existing?.hours ?? {
      mon: null,
      tue: null,
      wed: null,
      thu: null,
      fri: null,
      sat: null,
      sun: null,
    };

  return (
    <form action={formAction} className="space-y-6">
      {isEdit && <input type="hidden" name="id" value={existing!.id} />}

      <div className="rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 text-[12px] text-sky-900">
        Салбарын мэдээлэл нь Dentexgo чатбот руу синк болно. MN/EN хоёуланг нь
        бөглөнө үү.
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_220px_120px]">
        <Field
          name="slug"
          label="Slug"
          placeholder={isEdit ? existing!.slug : "автоматаар үүснэ"}
          defaultValue={v.slug ?? existing?.slug}
        />
        <Field
          name="timezone"
          label="Цагийн бүс"
          defaultValue={v.timezone ?? existing?.timezone ?? "Asia/Ulaanbaatar"}
        />
        <Field
          name="sort_order"
          label="Sort"
          type="number"
          defaultValue={v.sort_order ?? existing?.sort_order.toString() ?? "0"}
        />
      </div>

      <BilingualField
        label="Салбарын нэр"
        nameMn="name_mn"
        nameEn="name_en"
        required
        placeholderMn="Жнь: Төв салбар"
        placeholderEn="e.g. Central branch"
        defaultMn={v.name_mn ?? existing?.name_mn}
        defaultEn={v.name_en ?? existing?.name_en}
      />

      <BilingualField
        label="Хаяг"
        nameMn="address_mn"
        nameEn="address_en"
        mode="textarea"
        placeholderMn="Улаанбаатар, …"
        placeholderEn="Ulaanbaatar, …"
        defaultMn={v.address_mn ?? existing?.address_mn ?? ""}
        defaultEn={v.address_en ?? existing?.address_en ?? ""}
        rows={2}
      />

      <Field
        name="phone"
        label="Утас"
        type="tel"
        placeholder="+976 7700 0000"
        defaultValue={v.phone ?? existing?.phone ?? ""}
      />

      <div>
        <label className="mb-2 block text-[12px] font-semibold text-[#374151]">
          Ажиллах цаг
        </label>
        <div className="space-y-2 rounded-2xl border border-line bg-[#fafbfc] p-3">
          {DAY_LABELS.map(({ key, mn, en }) => {
            const { open, close } = splitRange(hours[key]);
            const isClosed = !hours[key];
            return (
              <div
                key={key}
                className="grid grid-cols-[110px_1fr_1fr_120px] items-center gap-3 text-[13px]"
              >
                <span className="font-semibold text-[#374151]">
                  {mn} <span className="text-[11px] text-[#9ca3af]">/ {en}</span>
                </span>
                <input
                  type="time"
                  name={`hours_${key}_open`}
                  defaultValue={open}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 outline-none focus:border-primary"
                />
                <input
                  type="time"
                  name={`hours_${key}_close`}
                  defaultValue={close}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 outline-none focus:border-primary"
                />
                <label className="flex items-center gap-2 text-[12px] font-semibold text-[#6b7280]">
                  <input
                    type="checkbox"
                    name={`hours_${key}_closed`}
                    defaultChecked={isClosed}
                    className="h-4 w-4 rounded border-line text-primary focus:ring-primary"
                  />
                  Хаалттай
                </label>
              </div>
            );
          })}
        </div>
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={
            v.is_active != null
              ? v.is_active === "on"
              : (existing?.is_active ?? true)
          }
          className="h-4 w-4 rounded border-line text-primary focus:ring-primary"
        />
        <span className="text-[13px] font-semibold text-[#374151]">
          Идэвхтэй (Dentexgo чатботод харагдана)
        </span>
      </label>

      <div className="flex justify-end gap-3 border-t border-line pt-5">
        <Link
          href="/admin/branches"
          className="rounded-full border border-line bg-white px-5 py-2.5 text-[13px] font-bold text-[#0f172a] hover:bg-[#f3f4f6] transition-colors"
        >
          Буцах
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-[13px] font-bold text-white hover:bg-primary-hover transition-colors disabled:opacity-60"
        >
          {pending ? "Хадгалж байна…" : isEdit ? "Хадгалах" : "Үүсгэх"}
          <span aria-hidden>→</span>
        </button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-[12px] font-semibold text-[#374151]"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] outline-none placeholder:text-[#c1c7cf] focus:border-primary"
      />
    </div>
  );
}
