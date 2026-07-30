import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && !url.includes("YOUR_PROJECT_REF"));
}

/**
 * Hardcoded fallback admin for local development, so the panel is reachable
 * before a Supabase user exists.
 *
 * This is opt-IN: it only works when ALLOW_DEV_ADMIN=true is set AND the build
 * is not a production build. Anyone knowing these credentials would otherwise
 * own the admin panel on the live site.
 */
export const DEV_ADMIN = {
  email: "admin@dentaris.mn",
  password: "dentaris2026",
  cookieName: "dentaris_dev_admin",
};

/** Secret backing the dev-session cookie signatures. */
function devCookieSecret(): string | null {
  return (
    process.env.DEV_ADMIN_COOKIE_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    null
  );
}

/**
 * Sign a dev-session cookie payload. `httpOnly` only stops client JS from
 * *reading* a cookie — it does nothing to stop a forged `Cookie:` header, so
 * the value itself has to carry a signature we can verify.
 */
export function signDevCookie(payload: string): string | null {
  const secret = devCookieSecret();
  if (!secret) return null;
  const mac = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${mac}`;
}

/** Verify a signed dev-session cookie, returning its payload or null. */
export function verifyDevCookie(value: string | undefined): string | null {
  if (!value) return null;
  const secret = devCookieSecret();
  if (!secret) return null;
  const idx = value.lastIndexOf(".");
  if (idx <= 0) return null;
  const payload = value.slice(0, idx);
  const mac = value.slice(idx + 1);
  const expected = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return payload;
}

export function isDevAdminAllowed(): boolean {
  // Opt-in: the dev bypass is off unless explicitly enabled, and never
  // available in a production build. Without a signing secret it stays off
  // rather than falling back to an unauthenticated cookie.
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.ALLOW_DEV_ADMIN !== "true") return false;
  return Boolean(devCookieSecret());
}

type AdminUser = {
  id: string;
  email: string;
  isDev?: boolean;
};

/**
 * Resolve the current admin, or null when there isn't one. Never redirects —
 * use this from server actions and route handlers.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  // 1. Dev cookie bypass — only when explicitly allowed, and only if signed.
  if (isDevAdminAllowed()) {
    const jar = await cookies();
    const payload = verifyDevCookie(jar.get(DEV_ADMIN.cookieName)?.value);
    if (payload === "admin") {
      return { id: "dev-admin", email: DEV_ADMIN.email, isDev: true };
    }
  }

  // 2. Real Supabase session
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createSupabaseServer();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return { id: data.user.id, email: data.user.email ?? "" };
  } catch {
    return null;
  }
}

/** Use inside admin pages that require auth. Redirects to /admin/login otherwise. */
export async function requireAdminUser(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (user) return user;
  if (!isSupabaseConfigured()) {
    redirect("/admin/login?error=supabase_not_configured");
  }
  redirect("/admin/login");
}

/**
 * Authorization gate for server actions and route handlers.
 *
 * Returns a Mongolian error message when the caller is not an admin, or null
 * when they are. Server Action ids are extractable from the client bundle, so
 * every mutating action must call this — rendering the admin page behind
 * `requireAdminUser` protects the page, not the action.
 *
 *   const authErr = await assertAdmin();
 *   if (authErr) return { error: authErr };
 */
export async function assertAdmin(): Promise<string | null> {
  const user = await getAdminUser();
  if (user) return null;
  return "Эрх хүрэхгүй. Админаар дахин нэвтэрнэ үү.";
}
