"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createFaqAction,
  updateFaqAction,
  type FaqFormState,
} from "@/lib/actions/bot";
import { BilingualField } from "./BilingualField";
import { useFormToast } from "@/lib/hooks/use-form-toast";
import type { Faq } from "@/lib/dentexgo/client";

const initial: FaqFormState = {};

export function FaqForm({
  existing,
  prefillQMn,
  prefillQEn,
}: {
  existing?: Faq;
  prefillQMn?: string;
  prefillQEn?: string;
}) {
  const isEdit = Boolean(existing);
  const [state, formAction, pending] = useActionState(
    isEdit ? updateFaqAction : createFaqAction,
    initial,
  );
  useFormToast(state);

  const qMn = state.values?.qMn ?? existing?.q_mn ?? prefillQMn ?? "";
  const aMn = state.values?.aMn ?? existing?.a_mn ?? "";
  const qEn = state.values?.qEn ?? existing?.q_en ?? prefillQEn ?? "";
  const aEn = state.values?.aEn ?? existing?.a_en ?? "";

  return (
    <form action={formAction} className="space-y-6">
      {isEdit && existing && (
        <input type="hidden" name="rowId" value={existing.source_id} />
      )}

      <BilingualField
        label="Асуулт"
        nameMn="qMn"
        nameEn="qEn"
        required
        mode="input"
        defaultMn={qMn}
        defaultEn={qEn}
        placeholderMn="Та хэдэн цагт ажилладаг вэ?"
        placeholderEn="What are your hours?"
      />

      <BilingualField
        label="Хариулт"
        nameMn="aMn"
        nameEn="aEn"
        required
        mode="textarea"
        rows={4}
        defaultMn={aMn}
        defaultEn={aEn}
        placeholderMn="Бид 09:00–19:00 цагт ажилладаг."
        placeholderEn="We're open 09:00–19:00."
      />

      <p className="rounded-2xl bg-primary-soft/40 px-4 py-3 text-[12px] leading-6 text-[#374151]">
        💡 Англи талбарыг хоосон үлдээвэл Dentexgo AI автоматаар хөрвүүлнэ.
      </p>

      {state.error && (
        <p className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-[13px] text-danger">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-[14px] font-semibold text-white shadow-sm transition hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "Хадгалж байна..." : isEdit ? "Шинэчлэх" : "Нэмэх"}
        </button>
        <Link
          href="/admin/bot/faqs"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-[13px] font-semibold text-[#374151] ring-1 ring-line hover:bg-[#fafbff]"
        >
          Болих
        </Link>
      </div>
    </form>
  );
}
