import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && !url.includes("YOUR_PROJECT_REF"));
}

/** Use inside admin pages that require auth. Redirects to /admin/login otherwise. */
export async function requireAdminUser() {
  if (!isSupabaseConfigured()) {
    redirect("/admin/login?error=supabase_not_configured");
  }
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/admin/login");
  return data.user;
}
