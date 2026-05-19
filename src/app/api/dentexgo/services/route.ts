import { requireBearerAuth, errorJson } from "@/lib/dentexgo/auth";
import { SCHEMA_VERSION } from "@/lib/dentexgo/constants";
import { transformService } from "@/lib/dentexgo/transform";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { ServiceWithDepartment } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const SELECT = `
  id, slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order,
  created_at, updated_at,
  department:departments!inner ( id, slug, name_mn, name_en )
`;

export async function GET(req: Request) {
  const unauthorized = requireBearerAuth(req);
  if (unauthorized) return unauthorized;

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("services")
    .select(SELECT)
    .order("sort_order", { ascending: true });

  if (error) return errorJson(500, "db_error", error.message);

  const rows = (data ?? []) as unknown as ServiceWithDepartment[];

  const { data: joinRows, error: joinErr } = await supabase
    .from("service_branches")
    .select("service_id, branch_id");
  if (joinErr) return errorJson(500, "db_error", joinErr.message);

  const branchesByService = new Map<string, string[]>();
  for (const r of (joinRows ?? []) as { service_id: string; branch_id: string }[]) {
    const arr = branchesByService.get(r.service_id) ?? [];
    arr.push(r.branch_id);
    branchesByService.set(r.service_id, arr);
  }

  return Response.json({
    schemaVersion: SCHEMA_VERSION,
    items: rows.map((row) =>
      transformService(row, branchesByService.get(row.id) ?? []),
    ),
  });
}
