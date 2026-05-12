"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import {
  createDoctorAction,
  type CreateDoctorState,
} from "@/lib/actions/team";

const initial: CreateDoctorState = {};

type Department = { id: string; name: string };

export function DoctorForm({ departments }: { departments: Department[] }) {
  const [state, formAction, pending] = useActionState(
    createDoctorAction,
    initial,
  );

  const [photo, setPhoto] = useState(state.values?.photo_url ?? "");
  const [specs, setSpecs] = useState<string[]>(
    state.values?.specializations
      ? state.values.specializations.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
  );
  const [specInput, setSpecInput] = useState("");
  const [edu, setEdu] = useState<string[]>(
    state.values?.education
      ? state.values.education.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
  );
  const [eduInput, setEduInput] = useState("");

  function addSpec() {
    const v = specInput.trim();
    if (!v || specs.includes(v)) return;
    setSpecs([...specs, v]);
    setSpecInput("");
  }
  function addEdu() {
    const v = eduInput.trim();
    if (!v || edu.includes(v)) return;
    setEdu([...edu, v]);
    setEduInput("");
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="specializations" value={specs.join(", ")} />
      <input type="hidden" name="education" value={edu.join(", ")} />

      {/* Photo */}
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
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9ca3af"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <input
              type="url"
              name="photo_url"
              placeholder="https://… эсвэл /p1.jpg"
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] outline-none focus:border-primary"
            />
            <p className="mt-1 text-[11px] text-[#9ca3af]">
              Зургийн URL (.jpg/.png). Жнь: /p1.jpg
            </p>
          </div>
        </div>
      </div>

      {/* Name + Title */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Овог нэр"
          required
          name="name"
          placeholder="Жнь: Б. Болормаа"
          defaultValue={state.values?.name}
        />
        <Field
          label="Албан тушаал"
          name="title"
          placeholder="Жнь: Шүдний их эмч"
          defaultValue={state.values?.title}
        />
      </div>

      {/* Phone + Email + Department */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label="Утас"
          name="phone"
          type="tel"
          placeholder="9911-2233"
          defaultValue={state.values?.phone}
        />
        <Field
          label="И-мэйл"
          name="email"
          type="email"
          placeholder="email@example.com"
          defaultValue={state.values?.email}
        />
        <Field
          label="Гол чиглэл"
          required
          name="specialty"
          placeholder="Жнь: Гажиг засал"
          defaultValue={state.values?.specialty}
        />
      </div>

      {/* Years + Bio */}
      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
        <Field
          label="Туршлага (жил)"
          name="years_exp"
          type="number"
          placeholder="10"
          defaultValue={state.values?.years_exp}
        />
        <div>
          <label className="mb-1.5 block text-[12px] font-semibold text-[#374151]">
            Богино танилцуулга
          </label>
          <textarea
            name="bio"
            rows={3}
            defaultValue={state.values?.bio}
            placeholder="Эмчийн товч танилцуулга..."
            className="w-full resize-none rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Specializations — multi-tag */}
      <TagInput
        label="Мэргэшиж буй салбарууд"
        placeholder="Жнь: Имплант"
        value={specInput}
        onChange={setSpecInput}
        onAdd={addSpec}
        tags={specs}
        onRemove={(t) => setSpecs(specs.filter((x) => x !== t))}
      />

      {/* Education — multi-tag */}
      <TagInput
        label="Боловсролын туршлага"
        placeholder="Жнь: АШУҮИС"
        value={eduInput}
        onChange={setEduInput}
        onAdd={addEdu}
        tags={edu}
        onRemove={(t) => setEdu(edu.filter((x) => x !== t))}
      />

      {state.error && (
        <p className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-[13px] text-danger">
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-3 border-t border-line pt-5">
        <a
          href="/admin/team"
          className="rounded-full border border-line bg-white px-5 py-2.5 text-[13px] font-bold text-[#0f172a] hover:bg-[#f3f4f6] transition-colors"
        >
          Цуцлах
        </a>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-[13px] font-bold text-white hover:bg-primary-hover transition-colors disabled:opacity-60"
        >
          {pending ? "Бүртгэж байна…" : "Бүртгэх"}
          <span aria-hidden>→</span>
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-[12px] font-semibold text-[#374151]"
      >
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] outline-none placeholder:text-[#c1c7cf] focus:border-primary"
      />
    </div>
  );
}

function TagInput({
  label,
  placeholder,
  value,
  onChange,
  onAdd,
  tags,
  onRemove,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
  tags: string[];
  onRemove: (t: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-semibold text-[#374151]">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={onAdd}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-white text-[16px] font-bold hover:bg-primary-hover transition-colors"
          aria-label="Нэмэх"
        >
          +
        </button>
      </div>
      {tags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {tags.map((t) => (
            <li
              key={t}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-[12px] font-semibold text-primary-ink ring-1 ring-primary/30"
            >
              {t}
              <button
                type="button"
                onClick={() => onRemove(t)}
                className="grid h-4 w-4 place-items-center rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                aria-label="Устгах"
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
