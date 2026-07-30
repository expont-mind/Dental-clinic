"use client";

import { useActionState, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Upload, X, RefreshCw } from "lucide-react";
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
import { compressImage } from "@/lib/compressImage";

type DeptOption = { id: string; name_mn: string; name_en: string };
type BranchOption = { id: string; name_mn: string; name_en: string };
type ServiceOption = {
  id: string;
  name_mn: string;
  name_en: string;
  parent_id: string | null;
  parent_name_mn: string | null;
  department_name_mn: string | null;
};

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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(file: File) {
    setUploadError(null);
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setUploadError("JPG, PNG, эсвэл WebP файл сонгоно уу.");
      return;
    }
    setUploading(true);
    try {
      let toUpload = file;
      try {
        toUpload = await compressImage(file);
        console.log(
          `[upload] ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(toUpload.size / 1024 / 1024).toFixed(2)}MB`,
        );
      } catch (err) {
        console.error("[upload] compress failed", err);
      }
      const fd = new FormData();
      fd.append("file", toUpload);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setPhoto(data.url);
      } else {
        setUploadError(data.error || "Хуулж чадсангүй.");
      }
    } catch {
      setUploadError("Хуулж чадсангүй.");
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

      {/* Photo upload — portrait avatar with drag-and-drop, click-to-replace
          overlay actions, and an inline upload progress state. */}
      <div>
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <label className="block text-[12px] font-semibold text-[#374151]">
            Зураг
          </label>
          <p className="text-[10px] text-[#9ca3af]">JPG · PNG · WebP — 4 : 5 портрет</p>
        </div>

        <input type="hidden" name="photo_url" value={photo} />
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
            // Reset so re-uploading the same file fires onChange again
            e.target.value = "";
          }}
        />

        <div className="flex items-start gap-5">
          {/* Avatar drop zone */}
          <div
            role="button"
            tabIndex={0}
            aria-label={photo ? "Зураг солих" : "Зураг хуулах"}
            onClick={() => !uploading && fileRef.current?.click()}
            onKeyDown={(e) => {
              if (uploading) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (!uploading) setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (uploading) return;
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className={
              "group relative aspect-[4/5] w-40 shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-[#f3f4f6] outline-none transition-all " +
              (isDragging
                ? "ring-2 ring-primary"
                : photo
                  ? "ring-1 ring-line hover:ring-primary/50"
                  : "border-2 border-dashed border-line hover:border-primary/50") +
              (uploading ? " cursor-wait" : "")
            }
          >
            {photo ? (
              <Image
                src={photo}
                alt="Эмчийн зураг"
                fill
                sizes="160px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-primary ring-1 ring-line">
                  <Upload className="h-4 w-4" strokeWidth={2.25} />
                </span>
                <span className="text-[11px] font-semibold text-[#6b7280]">
                  Зураг хуулах
                </span>
                <span className="text-[10px] leading-4 text-[#9ca3af]">
                  Чирэх эсвэл дарж сонгох
                </span>
              </div>
            )}

            {/* Hover overlay for filled state — click anywhere triggers replace */}
            {photo && !uploading && (
              <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/55 via-black/0 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                <span className="m-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-ink shadow-sm">
                  <RefreshCw className="h-3 w-3" strokeWidth={2.5} />
                  Солих
                </span>
              </div>
            )}

            {/* Upload-in-progress overlay */}
            {uploading && (
              <div className="absolute inset-0 grid place-items-center bg-white/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2 text-primary">
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="text-[11px] font-bold">Хуулж байна…</span>
                </div>
              </div>
            )}
          </div>

          {/* Action column — actions stay visible so mobile (no hover) works too */}
          <div className="flex flex-1 flex-col gap-2 pt-1">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#0f172a] px-4 py-2 text-[12px] font-bold text-white transition-colors hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5" strokeWidth={2.5} />
              {photo ? "Зураг солих" : "Зураг хуулах"}
            </button>
            {photo && !uploading && (
              <button
                type="button"
                onClick={() => {
                  setPhoto("");
                  setUploadError(null);
                }}
                className="inline-flex items-center gap-1.5 self-start rounded-full border border-line bg-white px-4 py-2 text-[12px] font-bold text-[#6b7280] transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                Хасах
              </button>
            )}
            {uploadError && (
              <p className="text-[11px] font-semibold text-rose-600">
                {uploadError}
              </p>
            )}
            <p className="mt-auto text-[11px] leading-5 text-[#9ca3af]">
              Эмчийн профайл болон захиалгын карт дээр харагдана. Хэмжээг
              автоматаар багасгана.
            </p>
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
