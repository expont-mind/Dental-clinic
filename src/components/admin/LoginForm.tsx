"use client";

import { useActionState } from "react";
import { adminSignInAction, type AdminAuthState } from "@/lib/actions/admin";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
        <p className="rounded-xl border border-danger/30 bg-danger/8 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Нэвтэрч байна…" : "Нэвтрэх"}
      </Button>
    </form>
  );
}
