"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import {
  DEV_ADMIN,
  isDevAdminAllowed,
  isSupabaseConfigured,
  signDevCookie,
} from "@/lib/auth";
import { translateError } from "@/lib/utils/translate-error";

export type AdminAuthState = { error?: string };

export async function adminSignInAction(
  _prev: AdminAuthState,
  formData: FormData,
): Promise<AdminAuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "Имэйл, нууц үг шаардлагатай." };

  // 1. Dev bypass — opt-in only (ALLOW_DEV_ADMIN=true on a non-production
  //    build, with a signing secret available). On the live site these
  //    credentials are treated like any other failed login.
  if (
    isDevAdminAllowed() &&
    email.toLowerCase() === DEV_ADMIN.email.toLowerCase() &&
    password === DEV_ADMIN.password
  ) {
    const signed = signDevCookie("admin");
    if (signed) {
      const jar = await cookies();
      jar.set(DEV_ADMIN.cookieName, signed, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 12,
      });
      redirect("/admin");
    }
  }

  // 2. Real Supabase auth
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Supabase холбогдоогүй байна. .env.local дотроо NEXT_PUBLIC_SUPABASE_URL/ANON_KEY нэмнэ үү.",
    };
  }

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: translateError(error) };

  redirect("/admin");
}

export async function adminSignOutAction() {
  const jar = await cookies();
  jar.delete(DEV_ADMIN.cookieName);
  try {
    const supabase = await createSupabaseServer();
    await supabase.auth.signOut();
  } catch {
    // ignore — dev bypass doesn't need Supabase session
  }
  redirect("/admin/login");
}

