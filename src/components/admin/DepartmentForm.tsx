"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Save } from "lucide-react";
import {
  createDepartmentAction,
  updateDepartmentAction,
  type DepartmentFormState,
} from "@/lib/actions/departments";
import { BilingualField } from "./BilingualField";
import { useFormToast } from "@/lib/hooks/use-form-toast";

const initial: DepartmentFormState = {};

type Existing = {
  id: string;
  slug: string;
  name_mn: string;
  name_en: string;
  description_mn: string | null;
  description_en: string | null;
  icon_key: string | null;
  sort_order: number;
  is_active: boolean;
};

export function DepartmentForm({ existing }: { existing?: Existing }) {
  const isEdit = Boolean(existing);
  const [state, formAction, pending] = useActionState(
    isEdit ? updateDepartmentAction : createDepartmentAction,
    initial,
  );
  useFormToast(state);
  const v = state.values ?? {};

  return (
    <form action={formAction} className="space-y-6">
      {isEdit && <input type="hidden" name="id" value={existing!.id} />}

      <div className="grid gap-4 sm:grid-cols-[1fr_180px_120px]">
        <div className="grid grid-cols-1 gap-1.5">
          <label
            htmlFor="slug"
            className="text-[12px] font-semibold text-[#374151]"
          >
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            placeholder={isEdit ? existing!.slug : "автоматаар үүснэ"}
            defaultValue={v.slug ?? existing?.slug ?? ""}
            className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] outline-none focus:border-primary"
          />
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          <label
            htmlFor="icon_key"
            className="text-[12px] font-semibold text-[#374151]"
          >
            Icon key
          </label>
          <input
            id="icon_key"
            name="icon_key"
            placeholder="Жнь: stethoscope"
            defaultValue={v.icon_key ?? existing?.icon_key ?? ""}
            className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] outline-none focus:border-primary"
          />
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          <label
            htmlFor="sort_order"
            className="text-[12px] font-semibold text-[#374151]"
          >
            Sort
          </label>
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            defaultValue={
              v.sort_order ?? existing?.sort_order?.toString() ?? "0"
            }
            className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] outline-none focus:border-primary"
          />
        </div>
      </div>

      <BilingualField
        label="Нэр"
        nameMn="name_mn"
        nameEn="name_en"
        required
        placeholderMn="Жнь: Гоо засал"
        placeholderEn="e.g. Cosmetic"
        defaultMn={v.name_mn ?? existing?.name_mn}
        defaultEn={v.name_en ?? existing?.name_en}
      />

      <BilingualField
        label="Тайлбар"
        nameMn="description_mn"
        nameEn="description_en"
        mode="textarea"
        placeholderMn="Тасгийн товч тайлбар…"
        placeholderEn="Short department description…"
        defaultMn={v.description_mn ?? existing?.description_mn ?? ""}
        defaultEn={v.description_en ?? existing?.description_en ?? ""}
        rows={3}
      />

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
          Идэвхтэй (эмч + үйлчилгээний хэлбэрт сонголтод харагдана)
        </span>
      </label>

      <div className="sticky bottom-4 z-10 mt-8 flex items-center justify-end gap-3 rounded-2xl border border-line bg-white/95 px-4 py-3 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.25)] backdrop-blur-xl">
        <Link
          href="/admin/departments"
          className="rounded-full border border-line bg-white px-5 py-2 text-[12px] font-bold text-[#0f172a] hover:bg-[#f3f4f6] transition-colors"
        >
          Буцах
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-[12px] font-bold text-white hover:bg-primary-hover transition-colors disabled:opacity-60"
        >
          <Save className="h-3.5 w-3.5" strokeWidth={2.5} />
          {pending ? "Хадгалж байна…" : isEdit ? "Хадгалах" : "Үүсгэх"}
        </button>
      </div>
    </form>
  );
}
