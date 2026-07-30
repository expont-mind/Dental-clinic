"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin, isAdminConfigured } from "@/lib/supabase/admin";
import { isSupabaseConfigured, signDevCookie, verifyDevCookie } from "@/lib/auth";
import { translateError } from "@/lib/utils/translate-error";
import {
  formatMongolianPhone,
  isValidMongolianPhone,
  normalizeMongolianPhone,
  phoneToAuthEmail,
  phoneToDigits8,
} from "@/lib/utils/phone";

export type AuthFormState = {
  error?: string;
  success?: string;
  values?: { name?: string; phone?: string };
};

const DEV_USER_COOKIE = "dentaris_dev_user";

/**
 * The dev customer session is a local-development stand-in for Supabase auth.
 * It is only honoured when Supabase isn't configured AND this isn't a
 * production build — otherwise a forged `Cookie: dentaris_dev_user=<phone>`
 * header would impersonate that phone's customer (their bookings are looked up
 * by phone). The value is signed for the same reason: `httpOnly` stops client
 * JS from reading a cookie, not an attacker from sending one.
 */
function isDevUserAllowed(): boolean {
  return process.env.NODE_ENV !== "production" && !isSupabaseConfigured();
}

async function setDevUserCookie(name: string) {
  const signed = signDevCookie(name);
  if (!signed) return;
  const jar = await cookies();
  jar.set(DEV_USER_COOKIE, signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
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
  const phone = String(formData.get("phone") || "").trim();
  const password = String(formData.get("password") || "");

  if (!phone || !password) {
    return {
      error: isMongolian(lang)
        ? "Бүх талбарыг бөглөнө үү."
        : "Please fill in all fields.",
      values: { phone },
    };
  }
  const authEmail = phoneToAuthEmail(phone);
  if (!authEmail) {
    return {
      error: isMongolian(lang)
        ? "Утасны дугаар буруу байна."
        : "Invalid phone number.",
      values: { phone },
    };
  }

  // Dev bypass — accept anything when Supabase isn't ready locally.
  if (isDevUserAllowed()) {
    await setDevUserCookie(normalizeMongolianPhone(phone) ?? "user");
    redirect(`/${lang}`);
  }
  if (!isSupabaseConfigured()) {
    return {
      error: isMongolian(lang)
        ? "Нэвтрэх түр боломжгүй байна. Дараа дахин оролдоно уу."
        : "Sign-in is temporarily unavailable. Please try again later.",
      values: { phone },
    };
  }

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password,
  });
  if (error) {
    return { error: translateError(error), values: { phone } };
  }
  redirect(`/${lang}`);
}

export async function userSignUpAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const lang = String(formData.get("lang") || "mn");
  const password = String(formData.get("password") || "");
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!phone || !password || !name) {
    return {
      error: isMongolian(lang)
        ? "Бүх талбарыг бөглөнө үү."
        : "Please fill in all fields.",
      values: { name, phone },
    };
  }
  if (!isValidMongolianPhone(phone)) {
    return {
      error: isMongolian(lang)
        ? "Утасны дугаар буруу байна."
        : "Invalid phone number.",
      values: { name, phone },
    };
  }
  if (password.length < 6) {
    return {
      error: isMongolian(lang)
        ? "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой."
        : "Password must be at least 6 characters.",
      values: { name, phone },
    };
  }

  const normalizedPhone = normalizeMongolianPhone(phone)!;
  const authEmail = phoneToAuthEmail(phone)!;

  // Dev bypass
  if (isDevUserAllowed()) {
    await setDevUserCookie(name);
    redirect(`/${lang}`);
  }
  if (!isSupabaseConfigured()) {
    return {
      error: isMongolian(lang)
        ? "Бүртгэл түр боломжгүй байна. Дараа дахин оролдоно уу."
        : "Sign-up is temporarily unavailable. Please try again later.",
      values: { name, phone },
    };
  }

  // Create the account with the service-role admin client and mark the email
  // pre-confirmed — there's no real inbox to verify, and no SMS provider, so
  // the synthetic email is confirmed inline instead of mailing a link.
  if (!isAdminConfigured()) {
    return {
      error: isMongolian(lang)
        ? "Бүртгэл түр боломжгүй байна. Дараа дахин оролдоно уу."
        : "Sign-up is temporarily unavailable. Please try again later.",
      values: { name, phone },
    };
  }
  const admin = createSupabaseAdmin();
  const { error: createErr } = await admin.auth.admin.createUser({
    email: authEmail,
    password,
    email_confirm: true,
    user_metadata: { full_name: name, phone: normalizedPhone },
  });
  if (createErr) {
    return { error: translateError(createErr), values: { name, phone } };
  }

  // Immediately establish a session for the new account.
  const supabase = await createSupabaseServer();
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password,
  });
  if (signInErr) {
    // Account exists but auto-login failed — send them to the login page.
    return {
      success: isMongolian(lang)
        ? "Бүртгэл үүслээ. Нэвтэрнэ үү."
        : "Account created. Please log in.",
      values: { name, phone },
    };
  }
  redirect(`/${lang}`);
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

export type CurrentUser = {
  name: string;
  phone?: string;
  /** Bare 8 digits — the key used to match rows in pending_bookings. */
  phone8?: string;
  isDev?: boolean;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (isDevUserAllowed()) {
    const jar = await cookies();
    const devPhone = verifyDevCookie(jar.get(DEV_USER_COOKIE)?.value);
    if (devPhone) {
      return {
        name: devPhone,
        phone: devPhone,
        phone8: phoneToDigits8(devPhone) ?? undefined,
        isDev: true,
      };
    }
  }
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createSupabaseServer();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    const meta = data.user.user_metadata ?? {};
    const phone = (meta.phone as string | undefined) ?? undefined;
    const metaName =
      (meta.full_name as string | undefined) ??
      (phone ? formatMongolianPhone(phone) : undefined) ??
      "Хэрэглэгч";
    return {
      name: metaName,
      phone,
      phone8: phone ? phoneToDigits8(phone) ?? undefined : undefined,
    };
  } catch {
    return null;
  }
}
