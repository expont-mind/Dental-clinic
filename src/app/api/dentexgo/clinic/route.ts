import { requireBearerAuth, errorJson } from "@/lib/dentexgo/auth";
import { SCHEMA_VERSION } from "@/lib/dentexgo/constants";
import { transformClinic } from "@/lib/dentexgo/transform";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { ClinicProfile } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const unauthorized = requireBearerAuth(req);
  if (unauthorized) return unauthorized;

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("clinic_profile")
    .select(
      "singleton, slug, name_mn, name_en, address_mn, address_en, phone, insurance_mn, insurance_en, timezone, hours, updated_at",
    )
    .maybeSingle();

  if (error) return errorJson(500, "db_error", error.message);
  if (!data) return errorJson(404, "not_found", "Clinic profile not seeded.");

  return Response.json({
    schemaVersion: SCHEMA_VERSION,
    ...transformClinic(data as ClinicProfile),
  });
}
