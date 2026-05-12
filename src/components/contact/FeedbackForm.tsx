"use client";

import { useActionState } from "react";
import {
  submitFeedbackAction,
  type FeedbackFormState,
} from "@/lib/actions/feedback";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const initial: FeedbackFormState = { status: "idle" };

type Props = {
  dict: Dictionary;
};

export function FeedbackForm({ dict }: Props) {
  const [state, formAction, pending] = useActionState(
    submitFeedbackAction,
    initial,
  );

  const errorMessage =
    state.status === "error"
      ? dict.contact.errors?.[
          state.errorKey as keyof NonNullable<Dictionary["contact"]["errors"]>
        ] ?? dict.contact.errors?.unknown ?? "Алдаа гарлаа."
      : null;

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="mx-auto mt-8 max-w-2xl rounded-2xl bg-surface px-6 py-8 text-center ring-1 ring-primary/30"
      >
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary text-white">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12l4 4 10-10"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <p className="mt-4 font-display text-[18px] font-bold text-ink">
          {dict.contact.success_title}
        </p>
        <p className="mt-2 text-[13px] leading-6 text-muted">
          {dict.contact.success_lede}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mx-auto mt-8 max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          type="text"
          name="name"
          autoComplete="name"
          defaultValue={state.values?.name ?? ""}
          placeholder={dict.contact.form_name}
          className="w-full rounded-2xl border border-line bg-surface px-5 py-3.5 text-[14px] text-ink placeholder:text-muted-2 outline-none focus:border-primary"
        />
        <input
          type="tel"
          name="phone"
          autoComplete="tel"
          defaultValue={state.values?.phone ?? ""}
          placeholder={dict.contact.form_phone}
          className="w-full rounded-2xl border border-line bg-surface px-5 py-3.5 text-[14px] text-ink placeholder:text-muted-2 outline-none focus:border-primary"
        />
      </div>
      <textarea
        rows={5}
        name="message"
        required
        defaultValue={state.values?.message ?? ""}
        placeholder={dict.contact.form_message}
        className="w-full resize-none rounded-2xl border border-line bg-surface px-5 py-3.5 text-[14px] text-ink placeholder:text-muted-2 outline-none focus:border-primary"
      />

      {errorMessage && (
        <div
          role="alert"
          className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-[13px] text-danger"
        >
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-[14px] font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-60 disabled:hover:bg-primary"
      >
        {pending ? dict.contact.form_submitting : dict.contact.form_submit}
        <span className="transition-transform group-hover:translate-x-0.5">→</span>
      </button>
    </form>
  );
}
