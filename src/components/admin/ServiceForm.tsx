"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  FileText,
  ImageIcon,
  Coins,
  ListTree,
  Settings,
  Save,
} from "lucide-react";
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
  price_cents: number | null;
  duration_min: number | null;
  itdoctor_service_id: number | null;
  image_url: string | null;
  hero_image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_bookable: boolean;
  show_duration: boolean;
  is_multi_visit: boolean;
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
  hasChildren = false,
}: {
  departments: DeptOption[];
  branches?: BranchOption[];
  parentServices?: ParentOption[];
  existingBranchIds?: string[];
  existing?: Existing;
  /** True if this service has at least one child (i.e. it's a category).
   *  Categories are navigation only — booking-related fields are hidden
   *  and force-cleared on save. */
  hasChildren?: boolean;
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
    <form action={formAction} className="space-y-5">
      {isEdit && <input type="hidden" name="id" value={existing!.id} />}

      {hasChildren && (
        <div className="rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 text-[12px] leading-5 text-sky-900">
          <strong>Энэ нь дотроо үйлчилгээтэй ангилал.</strong> Захиалга,
          үргэлжлэх хугацаа, олон ирэлттэй гэх мэт тохиргоо нь доторх
          үйлчилгээ тус бүрт тохируулагдана. Энд зөвхөн харагдац, нэр,
          зураг, тайлбар зэрэг ангилалын мэдээллийг засна уу.
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────── */}
      <Section
        icon={<FileText className="h-3.5 w-3.5" strokeWidth={2.25} />}
        title="Үндсэн мэдээлэл"
        subtitle="Basics"
        hint="Үйлчилгээний нэр, тайлбар, ангилал, эцэг ангилал."
      >
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

      </Section>

      {/* ──────────────────────────────────────────────────────────────────── */}
      <Section
        icon={<ImageIcon className="h-3.5 w-3.5" strokeWidth={2.25} />}
        title="Зураг"
        subtitle="Images"
        hint="Картан дээр болон hero хэсэгт харагдах зураг. Cloudinary дээр хадгалагдана."
      >
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
      <Section
        icon={<Coins className="h-3.5 w-3.5" strokeWidth={2.25} />}
        title="Үнэ ба үргэлжлэх хугацаа"
        subtitle="Pricing & duration"
        hint="Тоон утгаас гадна hero дээр текстээр харагдах хувилбарыг бөглөнө үү."
      >
        <div className={hasChildren ? "" : "grid gap-4 sm:grid-cols-2"}>
          <Field
            name="price_mnt"
            label="Үнэ (₮)"
            type="number"
            placeholder="50000"
            defaultValue={v.price_mnt ?? initialPriceMnt}
          />
          {!hasChildren && (
            <Field
              name="duration_min"
              label="Үргэлжлэх (минут)"
              type="number"
              placeholder="30"
              defaultValue={
                v.duration_min ?? existing?.duration_min?.toString() ?? ""
              }
            />
          )}
        </div>
        <p className="-mt-2 text-[11px] leading-5 text-[#6b7280]">
          {!hasChildren && (
            <>
              Анхны цагт IT Doctor дээр блоклогдох хугацаа — энэ дугаар
              ghost slot-уудыг үүсгэнэ. Олон ирэлттэй эмчилгээний хувьд
              зөвхөн анхны үзлэгийн уртыг оруулна уу (жнь: имплантын анхны
              үзлэг = 30 минут).
              <br />
            </>
          )}
          Доорх текстэн талбарууд hero дээр харагдах хувилбар. Олон
          ирэлттэй бол: жнь &quot;2 ирэлт, ~2 цаг&quot;. Хоосон бол
          дээд талын тоо автоматаар форматлагдана.
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
        <label className="flex items-start gap-3 rounded-2xl bg-[#fafbff] p-3">
          {/* Hidden default ensures the action always receives a value */}
          <input type="hidden" name="show_duration" value="off" />
          <input
            type="checkbox"
            name="show_duration"
            defaultChecked={
              v.show_duration != null
                ? v.show_duration === "on"
                : (existing?.show_duration ?? false)
            }
            className="mt-0.5 h-4 w-4 rounded border-line text-primary focus:ring-primary"
          />
          <span className="text-[13px] font-semibold text-[#374151]">
            Хугацаа харуулах
            <span className="ml-1.5 text-[11px] font-normal text-[#6b7280]">
              — Нийтийн хуудас болон Messenger ботын карусел дээр энэ
              үйлчилгээний үргэлжлэх хугацааг харуулна. Анхдагч: унтраалттай.
              Зөвлөмж: тогтмол үргэлжлэх ажилбарт асаа (имплант, цэвэрлэгээ),
              зөвлөгөө/багц/олон ирэлттэй эмчилгээнд унтраалттай орхи.
            </span>
          </span>
        </label>
      </Section>

      {/* ──────────────────────────────────────────────────────────────────── */}
      <Section
        icon={<ListTree className="h-3.5 w-3.5" strokeWidth={2.25} />}
        title="Дэлгэрэнгүй агуулга"
        subtitle="Detail-page content"
        hint="Эмчилгээ, давуу тал, үе шат, асуулт-хариулт, үнэ, сэтгэгдэл. Дэлгэрэнгүй хуудаст харагдана."
      >
        <ServiceContentEditor
          defaultMn={existing?.content_mn ?? null}
          defaultEn={existing?.content_en ?? null}
        />
      </Section>

      {/* ──────────────────────────────────────────────────────────────────── */}
      <Section
        icon={<Settings className="h-3.5 w-3.5" strokeWidth={2.25} />}
        title="Тохиргоо"
        subtitle="Settings"
        hint="Захиалга, харагдац, салбар."
      >
        {!hasChildren && (
          <>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="is_bookable"
                defaultChecked={
                  v.is_bookable != null
                    ? v.is_bookable === "on"
                    : (existing?.is_bookable ?? true)
                }
                className="mt-0.5 h-4 w-4 rounded border-line text-primary focus:ring-primary"
              />
              <span className="text-[13px] font-semibold text-[#374151]">
                Захиалга боломжтой
                <span className="ml-1.5 font-normal text-[11px] text-[#6b7280]">
                  — Үйлчлүүлэгч энэ үйлчилгээгээр онлайнаар цаг захиалж болно.
                  IT Doctor дээр Эмчилгээ/Үзлэг үйлчилгээгээр автоматаар
                  захиалагдана.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="is_multi_visit"
                defaultChecked={
                  v.is_multi_visit != null
                    ? v.is_multi_visit === "on"
                    : (existing?.is_multi_visit ?? false)
                }
                className="mt-0.5 h-4 w-4 rounded border-line text-primary focus:ring-primary"
              />
              <span className="text-[13px] font-semibold text-[#374151]">
                Олон ирэлттэй эмчилгээ (анхны үзлэг)
                <span className="ml-1.5 font-normal text-[11px] text-[#6b7280]">
                  — Жнь: имплант, шүдний хүрд, томоохон үйлчилгээ. Эхний цаг
                  анхны үзлэг болж, эмчилгээний цагыг эмч уулзалт дээр товлоно.
                  IT Doctor дээр &quot;Үзлэг 1&quot; үйлчилгээгээр захиалагдана.
                  Захиалгын урт нь дээрх &quot;Үргэлжлэх (минут)&quot;-аас
                  тооцоологдоно — зөвхөн анхны үзлэгийн уртыг оруулна уу.
                </span>
              </span>
            </label>
          </>
        )}

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="is_featured"
            defaultChecked={
              v.is_featured != null
                ? v.is_featured === "on"
                : (existing?.is_featured ?? false)
            }
            className="mt-0.5 h-4 w-4 rounded border-line text-primary focus:ring-primary"
          />
          <span className="text-[13px] font-semibold text-[#374151]">
            Онцлох
            <span className="ml-1.5 font-normal text-[11px] text-[#6b7280]">
              — Нийтийн /services хуудсанд том картаар харагдана.
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={
              v.is_active != null
                ? v.is_active === "on"
                : (existing?.is_active ?? true)
            }
            className="mt-0.5 h-4 w-4 rounded border-line text-primary focus:ring-primary"
          />
          <span className="text-[13px] font-semibold text-[#374151]">
            Идэвхтэй
            <span className="ml-1.5 font-normal text-[11px] text-[#6b7280]">
              — Нийтийн хуудсанд харагдана.
            </span>
          </span>
        </label>

        <BranchPicker branches={branches} defaultIds={existingBranchIds} />
      </Section>

      <div className="sticky bottom-4 z-10 mt-10 flex items-center justify-between gap-3 rounded-2xl border border-line bg-white/95 px-4 py-3 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.25)] backdrop-blur-xl sm:px-5">
        <p className="hidden text-[11px] text-[#6b7280] sm:block">
          {isEdit
            ? "Өөрчлөлтийг шууд хадгалж дэлгэрэнгүй хуудаст хэрэглэгдэнэ."
            : "Хадгалсны дараа жагсаалт руу шилжинэ."}
        </p>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/admin/services"
            className="rounded-full border border-line bg-white px-4 py-2 text-[12px] font-bold text-[#0f172a] hover:bg-[#f3f4f6] transition-colors sm:px-5 sm:py-2.5 sm:text-[13px]"
          >
            Буцах
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-[12px] font-bold text-white hover:bg-primary-hover transition-colors disabled:opacity-60 sm:px-6 sm:py-2.5 sm:text-[13px]"
          >
            <Save className="h-3.5 w-3.5" strokeWidth={2.5} />
            {pending ? "Хадгалж байна…" : isEdit ? "Хадгалах" : "Үүсгэх"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Section({
  icon,
  title,
  subtitle,
  hint,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-line sm:p-7">
      <header className="mb-5 flex items-baseline justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {icon && (
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-primary">
              {icon}
            </span>
          )}
          <h2 className="font-display text-[15px] font-bold tracking-tight text-ink">
            {title}
          </h2>
          {subtitle && (
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9ca3af]">
              · {subtitle}
            </span>
          )}
        </div>
      </header>
      {hint && (
        <p className="-mt-3 mb-5 text-[11px] leading-5 text-[#6b7280]">
          {hint}
        </p>
      )}
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
