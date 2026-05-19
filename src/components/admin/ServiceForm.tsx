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
import { ImageUploadField } from "./ImageUploadField";
import { ServiceContentEditor } from "./ServiceContentEditor";
import type { ServiceContentBlock } from "@/lib/supabase/types";

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
  long_description_mn: string | null;
  long_description_en: string | null;
  duration_text_mn: string | null;
  duration_text_en: string | null;
  price_text_mn: string | null;
  price_text_en: string | null;
  category: string | null;
  price_cents: number | null;
  duration_min: number | null;
  itdoctor_service_id: number | null;
  image_url: string | null;
  hero_image_url: string | null;
  is_active: boolean;
  sort_order: number;
  content_mn: ServiceContentBlock | null;
  content_en: ServiceContentBlock | null;
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
    <form action={formAction} className="space-y-8">
      {isEdit && <input type="hidden" name="id" value={existing!.id} />}

      <div className="rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 text-[12px] text-sky-900">
        Mongol болон English-ийн алинд нь ч бөглөгдсөн нэр, тайлбар нь Dentexgo
        чатбот руу синк болно. Үнэ MNT-ээр оруулна (центээр хувирна).
      </div>

      {/* ──────────────────────────────────────────────────────────────────── */}
      <Section title="Үндсэн мэдээлэл" subtitle="Basics">
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
              Хоосон бол энэ нь дээд ангилал болно. Сонговол энэ нь тухайн
              ангилалын дотор орно.
            </p>
          </div>
        )}

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
          label="Богино тайлбар (карт + hero дээр)"
          nameMn="description_mn"
          nameEn="description_en"
          mode="textarea"
          placeholderMn="Картан дээр болон hero-н дор харагдах 1–2 өгүүлбэр."
          placeholderEn="The 1–2 line description shown on cards and below the hero."
          defaultMn={v.description_mn ?? existing?.description_mn ?? ""}
          defaultEn={v.description_en ?? existing?.description_en ?? ""}
          rows={3}
        />

        <BilingualField
          label="Дэлгэрэнгүй тайлбар (Танилцуулга хэсэг)"
          nameMn="long_description_mn"
          nameEn="long_description_en"
          mode="textarea"
          placeholderMn="Дэлгэрэнгүй хуудасны Танилцуулга хэсэгт харагдах урт текст."
          placeholderEn="Long-form copy shown in the Overview section of the detail page."
          defaultMn={v.long_description_mn ?? existing?.long_description_mn ?? ""}
          defaultEn={v.long_description_en ?? existing?.long_description_en ?? ""}
          rows={5}
        />

        <Field
          name="category"
          label="Ангилал (карт дээрх шошго)"
          placeholder="Preventive / Cosmetic / Orthodontics …"
          defaultValue={v.category ?? existing?.category ?? ""}
        />
      </Section>

      {/* ──────────────────────────────────────────────────────────────────── */}
      <Section title="Зураг" subtitle="Images">
        <div className="grid gap-6 lg:grid-cols-2">
          <ImageUploadField
            name="image_url"
            label="Картын зураг"
            hint="/services жагсаалт дээр харагдах зураг (4:3)."
            aspect="card"
            defaultValue={v.image_url ?? existing?.image_url ?? ""}
          />
          <ImageUploadField
            name="hero_image_url"
            label="Hero зураг"
            hint="Дэлгэрэнгүй хуудасны hero хэсэгт харагдах зураг (4:5 портрет)."
            aspect="portrait"
            defaultValue={
              v.hero_image_url ?? existing?.hero_image_url ?? ""
            }
          />
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────────── */}
      <Section title="Үнэ ба үргэлжлэх хугацаа" subtitle="Pricing & duration">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            name="price_mnt"
            label="Үнэ (MNT, тоо)"
            type="number"
            placeholder="50000"
            defaultValue={v.price_mnt ?? initialPriceMnt}
          />
          <Field
            name="duration_min"
            label="Үргэлжлэх (минут, тоо)"
            type="number"
            placeholder="30"
            defaultValue={
              v.duration_min ?? existing?.duration_min?.toString() ?? ""
            }
          />
        </div>
        <p className="-mt-2 text-[11px] text-[#6b7280]">
          Доорх текстэн талбарууд hero дээр харагдах хувилбар. Хоосон бол дээд
          талын тоо автоматаар форматлагдан харагдана.
        </p>
        <BilingualField
          label="Үнэ — текст (hero дээр харагдах)"
          nameMn="price_text_mn"
          nameEn="price_text_en"
          placeholderMn="Жнь: 1,500,000₮ -аас"
          placeholderEn="e.g. from ₮1,500,000"
          defaultMn={v.price_text_mn ?? existing?.price_text_mn ?? ""}
          defaultEn={v.price_text_en ?? existing?.price_text_en ?? ""}
        />
        <BilingualField
          label="Хугацаа — текст (hero дээр харагдах)"
          nameMn="duration_text_mn"
          nameEn="duration_text_en"
          placeholderMn="Жнь: 60–180 мин"
          placeholderEn="e.g. 60–180 min"
          defaultMn={v.duration_text_mn ?? existing?.duration_text_mn ?? ""}
          defaultEn={v.duration_text_en ?? existing?.duration_text_en ?? ""}
        />
      </Section>

      {/* ──────────────────────────────────────────────────────────────────── */}
      <Section
        title="Дэлгэрэнгүй агуулга"
        subtitle="Detail-page content"
      >
        <ServiceContentEditor
          defaultMn={existing?.content_mn ?? null}
          defaultEn={existing?.content_en ?? null}
        />
      </Section>

      {/* ──────────────────────────────────────────────────────────────────── */}
      <Section title="Холболт ба тохиргоо" subtitle="Integrations & settings">
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
              IT Doctor API-н үйлчилгээний дугаар. Онлайн цаг захиалгад
              ашиглагдана.
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
            Идэвхтэй (нийт хуудсанд харагдана)
          </span>
        </label>
      </Section>

      <div className="sticky bottom-0 -mx-6 -mb-6 flex justify-end gap-3 border-t border-line bg-white/95 px-6 py-4 backdrop-blur sm:-mx-8 sm:-mb-8 sm:px-8">
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

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <header className="flex items-baseline justify-between gap-3 border-b border-line/70 pb-2">
        <h2 className="font-display text-[15px] font-bold tracking-tight text-ink">
          {title}
        </h2>
        {subtitle && (
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9ca3af]">
            {subtitle}
          </span>
        )}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
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
