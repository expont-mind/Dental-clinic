"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getDentists, getServices, getBranches } from "@/lib/itdoctor/client";
import { assertAdmin } from "@/lib/auth";

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || `item-${Date.now().toString(36)}`
  );
}

export type SyncResult = {
  ok: boolean;
  error?: string;
  dentistsSynced: number;
  servicesSynced: number;
  deactivated: number;
  /** Names of the records this run deactivated, so the admin sees what moved. */
  deactivatedNames?: string[];
};

export async function syncFromITDoctorAction(): Promise<SyncResult> {
  const result: SyncResult = {
    ok: false,
    dentistsSynced: 0,
    servicesSynced: 0,
    deactivated: 0,
    deactivatedNames: [],
  };

  const authErr = await assertAdmin();
  if (authErr) return { ...result, error: authErr };

  try {
    const supabase = createSupabaseAdmin();

    // Get a dental department (prefer "dental" slug, then "general")
    const { data: depts } = await supabase
      .from("departments")
      .select("id, slug")
      .in("slug", ["dental", "general"])
      .order("sort_order", { ascending: true });
    const defaultDeptId =
      depts?.find((d) => d.slug === "dental")?.id ?? depts?.[0]?.id;
    if (!defaultDeptId) {
      return { ...result, error: "Шүдний тасаг олдсонгүй. Эхлээд тасаг үүсгэнэ үү." };
    }

    // ---- Sync Dentists ----
    const itDentists = await getDentists();

    // An empty upstream list is almost always a transient iDoctor problem, not
    // "the clinic has no dentists". Deactivating on it would empty the site, so
    // bail out and let the admin retry.
    if (itDentists.length === 0) {
      return {
        ...result,
        error:
          "IT Doctor эмчийн хоосон хариу буцаалаа. Sync-ийг зогсоов — дараа дахин оролдоно уу.",
      };
    }

    for (const d of itDentists) {
      const nameMn = `${d.lastname} ${d.firstname}`;
      const nameEn = `${d.firstname} ${d.lastname}`;

      // Check if already exists
      const { data: existing } = await supabase
        .from("doctors")
        .select("id")
        .eq("itdoctor_dentist_id", d.id)
        .maybeSingle();

      if (existing) {
        // Update name only (don't overwrite enriched data)
        await supabase
          .from("doctors")
          .update({
            name_mn: nameMn,
            name_en: nameEn,
            is_active: true,
          })
          .eq("id", existing.id);
      } else {
        const slug = slugify(nameEn);
        await supabase.from("doctors").insert({
          department_id: defaultDeptId,
          slug,
          name_mn: nameMn,
          name_en: nameEn,
          title_mn: d.title || null,
          title_en: d.title || null,
          photo_url: d.avatar || null,
          itdoctor_dentist_id: d.id,
          is_active: true,
          sort_order: d.id,
        });
      }
      result.dentistsSynced++;
    }

    // ---- Sync Services ----
    const itServices = await getServices();
    if (itServices.length === 0) {
      return {
        ...result,
        error:
          "IT Doctor үйлчилгээний хоосон хариу буцаалаа. Sync-ийг зогсоов — дараа дахин оролдоно уу.",
      };
    }

    for (const s of itServices) {
      const { data: existing } = await supabase
        .from("services")
        .select("id")
        .eq("itdoctor_service_id", s.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("services")
          .update({
            name_mn: s.name,
            name_en: s.name,
            is_active: true,
          })
          .eq("id", existing.id);
      } else {
        const slug = slugify(s.name) + `-${s.id}`;
        await supabase.from("services").insert({
          department_id: defaultDeptId,
          slug,
          name_mn: s.name,
          name_en: s.name,
          itdoctor_service_id: s.id,
          currency: "MNT",
          is_active: true,
          sort_order: s.id,
        });
      }
      result.servicesSynced++;
    }

    // ---- Deactivate records that VANISHED upstream ----
    //
    // Only rows that carry an iDoctor id are in scope. A NULL id means the row
    // was authored by hand in this admin panel — services created here never
    // get an `itdoctor_service_id` (see the note in actions/services.ts), so
    // treating NULL as "not in iDoctor, deactivate" would switch off the entire
    // hand-curated catalogue on every sync.
    const itDentistIds = new Set(itDentists.map((d) => d.id));
    const itServiceIds = new Set(itServices.map((s) => s.id));

    const { data: linkedDoctors } = await supabase
      .from("doctors")
      .select("id, name_mn, itdoctor_dentist_id")
      .eq("is_active", true)
      .not("itdoctor_dentist_id", "is", null);

    for (const doc of (linkedDoctors ?? []) as {
      id: string;
      name_mn: string | null;
      itdoctor_dentist_id: number;
    }[]) {
      if (itDentistIds.has(doc.itdoctor_dentist_id)) continue;
      await supabase.from("doctors").update({ is_active: false }).eq("id", doc.id);
      result.deactivated++;
      result.deactivatedNames!.push(doc.name_mn ?? `эмч ${doc.id}`);
    }

    const { data: linkedServices } = await supabase
      .from("services")
      .select("id, name_mn, itdoctor_service_id")
      .eq("is_active", true)
      .not("itdoctor_service_id", "is", null);

    for (const svc of (linkedServices ?? []) as {
      id: string;
      name_mn: string | null;
      itdoctor_service_id: number;
    }[]) {
      if (itServiceIds.has(svc.itdoctor_service_id)) continue;
      await supabase.from("services").update({ is_active: false }).eq("id", svc.id);
      result.deactivated++;
      result.deactivatedNames!.push(svc.name_mn ?? `үйлчилгээ ${svc.id}`);
    }

    result.ok = true;
    revalidatePath("/admin/team");
    revalidatePath("/admin/services");
    return result;
  } catch (e) {
    return {
      ...result,
      error: e instanceof Error ? e.message : "Sync амжилтгүй боллоо.",
    };
  }
}
