"use client";

import { useActionState, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  createDoctorAction,
  updateDoctorAction,
  type CreateDoctorState,
  type UpdateDoctorState,
} from "@/lib/actions/team";
import { BilingualField } from "./BilingualField";
import { useFormToast } from "@/lib/hooks/use-form-toast";
import { BranchPicker } from "./BranchPicker";
import { ServicePicker } from "./ServicePicker";

type DeptOption = { id: string; name_mn: string; name_en: string };
type BranchOption = { id: string; name_mn: string; name_en: string };
type ServiceOption = { id: string; name_mn: string; name_en: string };

type Existing = {
  id: string;
  department_id: string;
  name_mn: string;
  name_en: string;
  title_mn: string | null;
  title_en: string | null;
  bio_mn: string | null;
  bio_en: string | null;
  photo_url: string | null;
  years_exp: number | null;
  itdoctor_dentist_id: number | null;
  is_active: boolean;
};

const createInitial: CreateDoctorState = {};
const updateInitial: UpdateDoctorState = {};

export function DoctorForm({
  departments,
  branches = [],
  existingBranchIds = [],
  services = [],
  existingServiceIds = [],
  existing,
}: {
  departments: DeptOption[];
  branches?: BranchOption[];
  existingBranchIds?: string[];
  services?: ServiceOption[];
  existingServiceIds?: string[];
  existing?: Existing;
}) {
  const isEdit = Boolean(existing);

  const [createState, createAction, createPending] = useActionState(
    createDoctorAction,
    createInitial,
  );
  const [updateState, updateAction, updatePending] = useActionState(
    updateDoctorAction,
    updateInitial,
  );

  const formAction = isEdit ? updateAction : createAction;
  const pending = isEdit ? updatePending : createPending;
  const error = isEdit ? updateState.error : createState.error;
  const ok = isEdit ? updateState.ok : false;
  useFormToast({ ok, error });
  const v = isEdit ? {} : (createState.values ?? {});

  const [photo, setPhoto] = useState(
    v.photo_url ?? existing?.photo_url ?? "",
  );
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setPhoto(data.url);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      {isEdit && <input type="hidden" name="id" value={existing!.id} />}

      <BilingualNotice />

      {/* IT Doctor ID badge */}
      {existing?.itdoctor_dentist_id && (
        <div className="rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 text-[12px] text-sky-900">
          IT Doctor ID: <strong>{existing.itdoctor_dentist_id}</strong> — Онлайн цаг захиалгын системтэй холбогдсон.
        </div>
      )}

      {/* Photo upload */}
      <div>
        <label className="mb-2 block text-[12px] font-semibold text-[#374151]">
          Зураг
        </label>
        <div className="flex items-center gap-4">
          <div className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#f3f4f6] ring-1 ring-line">
            {photo ? (
              <Image
                src={photo}
                alt="Preview"
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <span className="text-[10px] text-[#9ca3af]">no photo</span>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <input type="hidden" name="photo_url" value={photo} />
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="rounded-lg border border-line bg-white px-3 py-1.5 text-[12px] font-semibold text-ink hover:bg-[#f3f4f6] transition-colors disabled:opacity-50"
            >
              {uploading ? "Хуулж байна…" : photo ? "Зураг солих" : "Зураг хуулах"}
            </button>
            <input
              type="url"
              placeholder="эсвэл URL оруулах: https://… /p1.jpg"
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-4 py-2 text-[12px] outline-none placeholder:text-[#c1c7cf] focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Department */}
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

      <BilingualField
        label="Овог нэр"
        nameMn="name_mn"
        nameEn="name_en"
        required
        placeholderMn="Жнь: Б. Болормаа"
        placeholderEn="e.g. B. Bolormaa"
        defaultMn={v.name_mn ?? existing?.name_mn}
        defaultEn={v.name_en ?? existing?.name_en}
      />

      <BilingualField
        label="Албан тушаал"
        nameMn="title_mn"
        nameEn="title_en"
        placeholderMn="Жнь: Шүдний их эмч"
        placeholderEn="e.g. Senior Dentist"
        defaultMn={v.title_mn ?? existing?.title_mn ?? ""}
        defaultEn={v.title_en ?? existing?.title_en ?? ""}
      />

      <BilingualField
        label="Богино танилцуулга"
        nameMn="bio_mn"
        nameEn="bio_en"
        mode="textarea"
        placeholderMn="Эмчийн товч танилцуулга…"
        placeholderEn="Short bio…"
        defaultMn={v.bio_mn ?? existing?.bio_mn ?? ""}
        defaultEn={v.bio_en ?? existing?.bio_en ?? ""}
        rows={4}
      />

      <BranchPicker branches={branches} defaultIds={existingBranchIds} />

      <ServicePicker services={services} defaultIds={existingServiceIds} />

      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
        <div>
          <label
            htmlFor="years_exp"
            className="mb-1.5 block text-[12px] font-semibold text-[#374151]"
          >
            Туршлага (жил)
          </label>
          <input
            id="years_exp"
            name="years_exp"
            type="number"
            min={0}
            placeholder="10"
            defaultValue={
              v.years_exp ?? existing?.years_exp?.toString() ?? ""
            }
            className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] outline-none focus:border-primary"
          />
        </div>
        <label className="flex items-center gap-3 pt-7">
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
            Идэвхтэй (Dentexgo чатбот харагдана)
          </span>
        </label>
      </div>

      <div className="flex justify-end gap-3 border-t border-line pt-5">
        <Link
          href="/admin/team"
          className="rounded-full border border-line bg-white px-5 py-2.5 text-[13px] font-bold text-[#0f172a] hover:bg-[#f3f4f6] transition-colors"
        >
          {isEdit ? "Буцах" : "Цуцлах"}
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-[13px] font-bold text-white hover:bg-primary-hover transition-colors disabled:opacity-60"
        >
          {pending
            ? isEdit
              ? "Хадгалж байна…"
              : "Бүртгэж байна…"
            : isEdit
              ? "Хадгалах"
              : "Бүртгэх"}
          <span aria-hidden>→</span>
        </button>
      </div>
    </form>
  );
}

function BilingualNotice() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-[12px] text-amber-900">
      Mongol болон English хувилбарыг хоёуланг нь бөглөнө үү. Англи талбар нь
      Dentexgo чатбот англи хэрэглэгчдэд хариулахад ашиглагдана.
    </div>
  );
}
