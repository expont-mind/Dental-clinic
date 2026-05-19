"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createServiceAction,
  updateServiceAction,
  type ServiceFormState,
} from "@/lib/actions/services";
import { BilingualField } from "./BilingualField";
import { useFormToast } from "@/lib/hooks/use-form-toast";
import { BranchPicker } from "./BranchPicker";

const initial: ServiceFormState = {};

type DeptOption = { id: string; name_mn: string; name_en: string };
type BranchOption = { id: string; name_mn: string; name_en: string };

type ParentOption = { id: string; name_mn: string };

type Existing = {
  id: string;
  slug: string;
  department_id: string;
  parent_id: string | null;
  name_mn: string;
  name_en: string;
  description_mn: string | null;
  description_en: string | null;
  category: string | null;
  price_cents: number | null;
  duration_min: number | null;
  itdoctor_service_id: number | null;
  image_url: string | null;
  hero_image_url: string | null;
  is_active: boolean;
  sort_order: number;
};

export function ServiceForm({
  departments,
  branches = [],
  parentServices = [],
  existingBranchIds = [],
  existing,
}: {
  departments: DeptOption[];
  branches?: BranchOption[];
  parentServices?: ParentOption[];
  existingBranchIds?: string[];
  existing?: Existing;
}) {
  const isEdit = Boolean(existing);
  const [state, formAction, pending] = useActionState(
    isEdit ? updateServiceAction : createServiceAction,
    initial,
  );
  useFormToast(state);

  const initialPriceMnt =
    existing?.price_cents != null
      ? (existing.price_cents / 100).toString()
      : "";

  const v = state.values ?? {};

  return (
    <form action={formAction} className="space-y-6">
      {isEdit && <input type="hidden" name="id" value={existing!.id} />}

      <div className="rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 text-[12px] text-sky-900">
        Mongol болон English-ийн алинд нь ч бөглөгдсөн нэр, тайлбар нь Dentexgo
        чатбот руу синк болно. Үнэ MNT-ээр оруулна (центээр хувирна).
      </div>

      {/* Parent service */}
      {parentServices.length > 0 && (
        <div>
          <label
            htmlFor="parent_id"
            className="mb-1.5 block text-[12px] font-semibold text-[#374151]"
          >
            Эцэг ангилал
          </label>
          <select
            id="parent_id"
            name="parent_id"
            defaultValue={v.parent_id ?? existing?.parent_id ?? ""}
            className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] outline-none focus:border-primary"
          >
            <option value="">Ангилал биш (дээд түвшин)</option>
            {parentServices.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name_mn}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[10px] text-[#9ca3af]">
            Хоосон бол энэ нь дээд ангилал болно. Сонговол энэ нь тухайн ангилалын дотор орно.
          </p>
        </div>
      )}

      {/* Department + slug + sort_order + active */}
      <div className="grid gap-4 sm:grid-cols-[1fr_180px_120px]">
        <div>
          <label
            htmlFor="department_id"
            className="mb-1.5 block text-[12px] font-semibold text-[#374151]"
          >
            Тасаг <span className="text-rose-500">*</span>
          </label>
          <select
            id="department_id"
            name="department_id"
            required
            defaultValue={v.department_id ?? existing?.department_id ?? ""}
            className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] outline-none focus:border-primary"
          >
            <option value="" disabled>
              Сонгох…
            </option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name_mn} / {d.name_en}
              </option>
            ))}
          </select>
        </div>
        <Field
          name="slug"
          label="Slug"
          placeholder={isEdit ? existing!.slug : "автоматаар үүснэ"}
          defaultValue={v.slug ?? existing?.slug}
        />
        <Field
          name="sort_order"
          label="Sort"
          type="number"
          defaultValue={v.sort_order ?? existing?.sort_order.toString()}
        />
      </div>

      <BilingualField
        label="Нэр"
        nameMn="name_mn"
        nameEn="name_en"
        required
        placeholderMn="Жнь: Шүд цэвэрлэх"
        placeholderEn="e.g. Teeth Cleaning"
        defaultMn={v.name_mn ?? existing?.name_mn}
        defaultEn={v.name_en ?? existing?.name_en}
      />

      <BilingualField
        label="Тайлбар"
        nameMn="description_mn"
        nameEn="description_en"
        mode="textarea"
        placeholderMn="Энэ үйлчилгээний дэлгэрэнгүй тайлбар…"
        placeholderEn="What this service involves…"
        defaultMn={v.description_mn ?? existing?.description_mn ?? ""}
        defaultEn={v.description_en ?? existing?.description_en ?? ""}
        rows={4}
      />

      {/* Images */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          name="image_url"
          label="Зураг URL"
          placeholder="https://res.cloudinary.com/... эсвэл /p1.jpg"
          defaultValue={v.image_url ?? existing?.image_url ?? ""}
        />
        <Field
          name="hero_image_url"
          label="Hero зураг URL"
          placeholder="https://res.cloudinary.com/... эсвэл /hamtolon.jpg"
          defaultValue={v.hero_image_url ?? existing?.hero_image_url ?? ""}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          name="category"
          label="Ангилал"
          placeholder="Preventive / Cosmetic …"
          defaultValue={v.category ?? existing?.category ?? ""}
        />
        <Field
          name="price_mnt"
          label="Үнэ (MNT)"
          type="number"
          placeholder="50000"
          defaultValue={v.price_mnt ?? initialPriceMnt}
        />
        <Field
          name="duration_min"
          label="Үргэлжлэх (мин)"
          type="number"
          placeholder="30"
          defaultValue={
            v.duration_min ?? existing?.duration_min?.toString() ?? ""
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          name="itdoctor_service_id"
          label="IT Doctor Service ID"
          type="number"
          placeholder="35"
          defaultValue={
            v.itdoctor_service_id ??
            existing?.itdoctor_service_id?.toString() ??
            "35"
          }
        />
        <div className="flex items-end pb-1">
          <p className="text-[11px] text-muted">
            IT Doctor API-н үйлчилгээний дугаар. Онлайн цаг захиалгад ашиглагдана.
          </p>
        </div>
      </div>

      <BranchPicker branches={branches} defaultIds={existingBranchIds} />

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
          href="/admin/services"
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
