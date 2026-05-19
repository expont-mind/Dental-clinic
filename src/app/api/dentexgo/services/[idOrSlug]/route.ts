import { requireBearerAuth, errorJson } from "@/lib/dentexgo/auth";
import { SCHEMA_VERSION } from "@/lib/dentexgo/constants";
import { transformService, isUuid } from "@/lib/dentexgo/transform";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { ServiceWithDepartment } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const SELECT = `
  id, slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order,
  created_at, updated_at,
  department:departments!inner ( id, slug, name_mn, name_en )
`;

export async function GET(
  req: Request,
  ctx: { params: Promise<{ idOrSlug: string }> },
) {
  const unauthorized = requireBearerAuth(req);
  if (unauthorized) return unauthorized;

  const { idOrSlug } = await ctx.params;
  const supabase = await createSupabaseServer();

  const query = supabase.from("services").select(SELECT);
  const { data, error } = await (isUuid(idOrSlug)
    ? query.eq("id", idOrSlug)
    : query.eq("slug", idOrSlug)
  ).maybeSingle();

  if (error) return errorJson(500, "db_error", error.message);
  if (!data) return errorJson(404, "not_found", "Service not found.");

  const row = data as unknown as ServiceWithDepartment;
  const { data: joinRows, error: joinErr } = await supabase
    .from("service_branches")
    .select("branch_id")
    .eq("service_id", row.id);
  if (joinErr) return errorJson(500, "db_error", joinErr.message);
  const branchIds = (joinRows ?? []).map((r) => (r as { branch_id: string }).branch_id);

  return Response.json({
    schemaVersion: SCHEMA_VERSION,
    ...transformService(row, branchIds),
  });
}
