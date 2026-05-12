import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && !url.includes("YOUR_PROJECT_REF"));
}

/**
 * Temporary dev-mode admin credentials. Used until a real Supabase admin
 * user is created. Replace by setting a real user in Supabase Dashboard.
 */
export const DEV_ADMIN = {
  email: "admin@dentaris.mn",
  password: "dentaris2026",
  cookieName: "dentaris_dev_admin",
};

type AdminUser = {
  id: string;
  email: string;
  isDev?: boolean;
};

/** Use inside admin pages that require auth. Redirects to /admin/login otherwise. */
export async function requireAdminUser(): Promise<AdminUser> {
  // 1. Dev cookie bypass — for local development without Supabase user setup
  const jar = await cookies();
  if (jar.get(DEV_ADMIN.cookieName)?.value === "1") {
    return { id: "dev-admin", email: DEV_ADMIN.email, isDev: true };
  }

  // 2. Real Supabase session
  if (!isSupabaseConfigured()) {
    redirect("/admin/login?error=supabase_not_configured");
  }
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/admin/login");
  return { id: data.user.id, email: data.user.email ?? "" };
}
