"use client";

import { useActionState } from "react";
import { adminSignInAction, type AdminAuthState } from "@/lib/actions/admin";
import { Input } from "@/components/ui/Input";

const initial: AdminAuthState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(adminSignInAction, initial);
  return (
    <form action={action} className="grid gap-4">
      <Input
        name="email"
        type="email"
        label="Имэйл"
        autoComplete="email"
        required
      />
      <Input
        name="password"
        type="password"
        label="Нууц үг"
        autoComplete="current-password"
        required
      />
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
        {pending ? "Нэвтэрч байна…" : "Нэвтрэх"}
        <span className="transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </button>
    </form>
  );
}
