import "server-only";
import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client using the service-role key. Bypasses RLS,
// so it must NEVER be imported by client components. Use only in server
// actions and route handlers that have already verified admin auth via
// requireAdminUser.
export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing. Add it to .env from " +
        "Supabase Dashboard → Settings → API → service_role.",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
