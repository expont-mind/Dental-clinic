"use client";

import { useActionState } from "react";
import {
  updateClinicProfileAction,
  type ClinicProfileState,
} from "@/lib/actions/clinic";
import { BilingualField } from "./BilingualField";
import { useFormToast } from "@/lib/hooks/use-form-toast";
import type { ClinicHours, ClinicProfile } from "@/lib/supabase/types";

const initial: ClinicProfileState = {};

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

export function ClinicProfileForm({ profile }: { profile: ClinicProfile }) {
  const [state, formAction, pending] = useActionState(
    updateClinicProfileAction,
    initial,
  );
  useFormToast(state);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
        <Field
          name="slug"
          label="Slug (Dentexgo ID)"
          required
          defaultValue={profile.slug}
        />
        <Field
          name="timezone"
          label="Цагийн бүс"
          required
          defaultValue={profile.timezone}
        />
      </div>

      <BilingualField
        label="Эмнэлгийн нэр"
        nameMn="name_mn"
        nameEn="name_en"
        required
        defaultMn={profile.name_mn}
        defaultEn={profile.name_en}
      />

      <BilingualField
        label="Хаяг"
        nameMn="address_mn"
        nameEn="address_en"
        mode="textarea"
        defaultMn={profile.address_mn ?? ""}
        defaultEn={profile.address_en ?? ""}
        rows={2}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          name="phone"
          label="Утас"
          type="tel"
          defaultValue={profile.phone ?? ""}
        />
        <Field
          name="email"
          label="Имэйл"
          type="email"
          defaultValue={profile.email ?? ""}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          name="facebook_url"
          label="Facebook"
          type="url"
          placeholder="https://facebook.com/…"
          defaultValue={profile.facebook_url ?? ""}
        />
        <Field
          name="instagram_url"
          label="Instagram"
          type="url"
          placeholder="https://instagram.com/…"
          defaultValue={profile.instagram_url ?? ""}
        />
        <Field
          name="youtube_url"
          label="YouTube"
          type="url"
          placeholder="https://youtube.com/…"
          defaultValue={profile.youtube_url ?? ""}
        />
      </div>

      <BilingualField
        label="Даатгал"
        nameMn="insurance_mn"
        nameEn="insurance_en"
        mode="textarea"
        placeholderMn="Жнь: ACME, Bayanmod, Засгийн газрын даатгал хүлээн авна."
        placeholderEn="e.g. ACME, Bayanmod, government insurance accepted."
        defaultMn={profile.insurance_mn ?? ""}
        defaultEn={profile.insurance_en ?? ""}
        rows={2}
      />

      <div>
        <label
          htmlFor="booking_fee"
          className="mb-1.5 block text-[12px] font-semibold text-[#374151]"
        >
          Цаг захиалгын төлбөр (₮)
        </label>
        <div className="flex items-center gap-2">
          <input
            id="booking_fee"
            name="booking_fee"
            type="number"
            min="0"
            step="any"
            defaultValue={Math.round(profile.booking_fee_cents / 100)}
            placeholder="0"
            className="w-48 rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] outline-none focus:border-primary"
          />
          <span className="text-[12px] text-[#6b7280]">₮ (0 = төлбөргүй)</span>
        </div>
        <p className="mt-1 text-[11px] text-[#9ca3af]">
          Цаг захиалах үед QPay-ээр төлөгдөнө. 0 бол төлбөр шаардахгүй.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-[12px] font-semibold text-[#374151]">
          Ажиллах цаг
        </label>
        <div className="space-y-2 rounded-2xl border border-line bg-[#fafbfc] p-3">
          {DAY_LABELS.map(({ key, mn, en }) => {
            const { open, close } = splitRange(profile.hours[key]);
            const isClosed = !profile.hours[key];
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

      <div className="flex justify-end border-t border-line pt-5">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-[13px] font-bold text-white hover:bg-primary-hover transition-colors disabled:opacity-60"
        >
          {pending ? "Хадгалж байна…" : "Хадгалах"}
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
  required,
  placeholder,
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
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
        {required && <span className="text-rose-500"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] outline-none focus:border-primary"
      />
    </div>
  );
}
