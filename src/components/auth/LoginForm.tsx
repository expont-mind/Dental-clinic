"use client";

import { useActionState } from "react";
import { userSignInAction, type AuthFormState } from "@/lib/actions/auth";

const initial: AuthFormState = {};

export function LoginForm({ lang, dict }: { lang: string; dict: AuthDict }) {
  const [state, action, pending] = useActionState(userSignInAction, initial);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="lang" value={lang} />

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
        <div className="mb-1.5 flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted"
          >
            {dict.password}
          </label>
          <a
            href="#"
            className="text-[11px] font-semibold text-primary hover:underline"
          >
            {dict.forgot}
          </a>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder={dict.password_ph}
          className="w-full rounded-2xl border border-line bg-surface px-5 py-3.5 text-[14px] text-ink placeholder:text-muted-2 outline-none focus:border-primary"
        />
      </div>

      {state.error && (
        <p className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-[13px] leading-6 text-danger">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? dict.loading : dict.submit_login}
        <span className="transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </button>
    </form>
  );
}

type AuthDict = {
  email: string;
  email_ph: string;
  password: string;
  password_ph: string;
  forgot: string;
  loading: string;
  submit_login: string;
};
