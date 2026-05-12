"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/auth";
import { translateError } from "@/lib/utils/translate-error";

export type AuthFormState = {
  error?: string;
  success?: string;
  values?: { email?: string; name?: string; phone?: string };
};

const DEV_USER_COOKIE = "dentaris_dev_user";

function setDevUserCookie(name: string) {
  return cookies().then((jar) => {
    jar.set(DEV_USER_COOKIE, name, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  });
}

function isMongolian(lang: string) {
  return lang === "mn";
}

export async function userSignInAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const lang = String(formData.get("lang") || "mn");
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return {
      error: isMongolian(lang)
        ? "Бүх талбарыг бөглөнө үү."
        : "Please fill in all fields.",
      values: { email },
    };
  }

  // Dev bypass — accept anything when Supabase isn't ready
  if (!isSupabaseConfigured()) {
    await setDevUserCookie(email.split("@")[0] || "user");
    redirect(`/${lang}`);
  }

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return { error: translateError(error), values: { email } };
  }
  redirect(`/${lang}`);
}

export async function userSignUpAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const lang = String(formData.get("lang") || "mn");
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!email || !password || !name) {
    return {
      error: isMongolian(lang)
        ? "Бүх талбарыг бөглөнө үү."
        : "Please fill in all fields.",
      values: { email, name, phone },
    };
  }
  if (password.length < 6) {
    return {
      error: isMongolian(lang)
        ? "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой."
        : "Password must be at least 6 characters.",
      values: { email, name, phone },
    };
  }

  // Dev bypass
  if (!isSupabaseConfigured()) {
    await setDevUserCookie(name);
    redirect(`/${lang}`);
  }

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name, phone },
    },
  });
  if (error) {
    return { error: translateError(error), values: { email, name, phone } };
  }
  return {
    success: isMongolian(lang)
      ? "Бүртгэл амжилттай үүслээ. И-мэйл хаягаа баталгаажуулна уу."
      : "Account created. Please check your email to verify.",
    values: { email, name, phone },
  };
}

export async function userSignOutAction(formData: FormData) {
  const lang = String(formData.get("lang") || "mn");
  const jar = await cookies();
  jar.delete(DEV_USER_COOKIE);
  try {
    const supabase = await createSupabaseServer();
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
  redirect(`/${lang}`);
}

export async function getCurrentUser(): Promise<{
  name: string;
  email?: string;
  isDev?: boolean;
} | null> {
  const jar = await cookies();
  const devName = jar.get(DEV_USER_COOKIE)?.value;
  if (devName) {
    return { name: devName, isDev: true };
  }
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createSupabaseServer();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    const metaName =
      (data.user.user_metadata?.full_name as string | undefined) ??
      data.user.email?.split("@")[0] ??
      "Хэрэглэгч";
    return { name: metaName, email: data.user.email ?? undefined };
  } catch {
    return null;
  }
}
