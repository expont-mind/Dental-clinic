import { requireBearerAuth, errorJson } from "@/lib/dentexgo/auth";
import { SCHEMA_VERSION } from "@/lib/dentexgo/constants";
import { transformStaff, isUuid } from "@/lib/dentexgo/transform";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { DoctorWithDepartment } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const SELECT = `
  id, department_id, slug, name_mn, name_en, title_mn, title_en,
  bio_mn, bio_en, photo_url, years_exp, is_active, sort_order,
  created_at, updated_at,
  department:departments!inner ( id, slug, name_mn, name_en )
`;

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const unauthorized = requireBearerAuth(req);
  if (unauthorized) return unauthorized;

  const { id } = await ctx.params;
  const supabase = await createSupabaseServer();

  const query = supabase.from("doctors").select(SELECT);
  const { data, error } = await (isUuid(id)
    ? query.eq("id", id)
    : query.eq("slug", id)
  ).maybeSingle();

  if (error) return errorJson(500, "db_error", error.message);
  if (!data) return errorJson(404, "not_found", "Staff member not found.");

  const row = data as unknown as DoctorWithDepartment;
  const { data: joinRows, error: joinErr } = await supabase
    .from("doctor_branches")
    .select("branch_id")
    .eq("doctor_id", row.id);
  if (joinErr) return errorJson(500, "db_error", joinErr.message);
  const branchIds = (joinRows ?? []).map((r) => (r as { branch_id: string }).branch_id);

  return Response.json({
    schemaVersion: SCHEMA_VERSION,
    ...transformStaff(row, branchIds),
  });
}
