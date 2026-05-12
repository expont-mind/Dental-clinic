"use client";

import { useActionState } from "react";
import { userSignUpAction, type AuthFormState } from "@/lib/actions/auth";

const initial: AuthFormState = {};

export function SignupForm({ lang, dict }: { lang: string; dict: SignupDict }) {
  const [state, action, pending] = useActionState(userSignUpAction, initial);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="lang" value={lang} />

      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-muted"
        >
          {dict.name}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder={dict.name_ph}
          defaultValue={state.values?.name}
          className="w-full rounded-2xl border border-line bg-surface px-5 py-3.5 text-[14px] text-ink placeholder:text-muted-2 outline-none focus:border-primary"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-muted"
        >
          {dict.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={dict.email_ph}
          defaultValue={state.values?.email}
          className="w-full rounded-2xl border border-line bg-surface px-5 py-3.5 text-[14px] text-ink placeholder:text-muted-2 outline-none focus:border-primary"
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-muted"
        >
          {dict.phone}
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder={dict.phone_ph}
          defaultValue={state.values?.phone}
          className="w-full rounded-2xl border border-line bg-surface px-5 py-3.5 text-[14px] text-ink placeholder:text-muted-2 outline-none focus:border-primary"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-muted"
        >
          {dict.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder={dict.password_ph}
          className="w-full rounded-2xl border border-line bg-surface px-5 py-3.5 text-[14px] text-ink placeholder:text-muted-2 outline-none focus:border-primary"
        />
      </div>

      {state.error && (
        <p className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-[13px] leading-6 text-danger">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-[13px] leading-6 text-success">
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? dict.loading : dict.submit_signup}
        <span className="transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </button>
    </form>
  );
}

type SignupDict = {
  name: string;
  name_ph: string;
  email: string;
  email_ph: string;
  phone: string;
  phone_ph: string;
  password: string;
  password_ph: string;
  loading: string;
  submit_signup: string;
};
