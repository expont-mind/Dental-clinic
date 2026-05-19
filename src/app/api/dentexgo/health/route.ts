import { getClinicSlug, SCHEMA_VERSION } from "@/lib/dentexgo/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    ok: true,
    schemaVersion: SCHEMA_VERSION,
    clinicSlug: getClinicSlug(),
  });
}
