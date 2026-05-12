import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { DEV_ADMIN } from "@/lib/auth";

export async function POST() {
  const jar = await cookies();
  jar.delete(DEV_ADMIN.cookieName);
  try {
    const supabase = await createSupabaseServer();
    await supabase.auth.signOut();
  } catch {
    // ignore — dev bypass doesn't require Supabase
  }
  redirect("/admin/login");
}
