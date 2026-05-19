import { requireBearerAuth, errorJson } from "@/lib/dentexgo/auth";
import { SCHEMA_VERSION } from "@/lib/dentexgo/constants";
import { transformBranch } from "@/lib/dentexgo/transform";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { Branch } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const SELECT = `
  id, slug, name_mn, name_en, address_mn, address_en, phone, hours,
  timezone, is_active, sort_order, created_at, updated_at
`;

export async function GET(req: Request) {
  const unauthorized = requireBearerAuth(req);
  if (unauthorized) return unauthorized;

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("branches")
    .select(SELECT)
    .order("sort_order", { ascending: true });

  if (error) return errorJson(500, "db_error", error.message);

  const rows = (data ?? []) as unknown as Branch[];
  return Response.json({
    schemaVersion: SCHEMA_VERSION,
    items: rows.map(transformBranch),
  });
}
