import { requireBearerAuth, errorJson } from "@/lib/dentexgo/auth";
import { SCHEMA_VERSION } from "@/lib/dentexgo/constants";
import { transformStaff } from "@/lib/dentexgo/transform";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { DoctorWithDepartment } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const SELECT = `
  id, department_id, slug, name_mn, name_en, title_mn, title_en,
  bio_mn, bio_en, photo_url, years_exp, is_active, sort_order,
  created_at, updated_at,
  department:departments!inner ( id, slug, name_mn, name_en )
`;

export async function GET(req: Request) {
  const unauthorized = requireBearerAuth(req);
  if (unauthorized) return unauthorized;

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("doctors")
    .select(SELECT)
    .order("sort_order", { ascending: true });

  if (error) return errorJson(500, "db_error", error.message);

  const rows = (data ?? []) as unknown as DoctorWithDepartment[];

  const { data: joinRows, error: joinErr } = await supabase
    .from("doctor_branches")
    .select("doctor_id, branch_id");
  if (joinErr) return errorJson(500, "db_error", joinErr.message);

  const branchesByDoctor = new Map<string, string[]>();
  for (const r of (joinRows ?? []) as { doctor_id: string; branch_id: string }[]) {
    const arr = branchesByDoctor.get(r.doctor_id) ?? [];
    arr.push(r.branch_id);
    branchesByDoctor.set(r.doctor_id, arr);
  }

  return Response.json({
    schemaVersion: SCHEMA_VERSION,
    items: rows.map((row) =>
      transformStaff(row, branchesByDoctor.get(row.id) ?? []),
    ),
  });
}
