"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getDentists, getServices, getBranches } from "@/lib/itdoctor/client";

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
};

export async function syncFromITDoctorAction(): Promise<SyncResult> {
  const result: SyncResult = {
    ok: false,
    dentistsSynced: 0,
    servicesSynced: 0,
    deactivated: 0,
  };

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

    // ---- Deactivate old records without IT Doctor IDs ----
    const itDentistIds = itDentists.map((d) => d.id);
    const itServiceIds = itServices.map((s) => s.id);

    // Deactivate doctors not linked to IT Doctor
    const { data: oldDoctors } = await supabase
      .from("doctors")
      .select("id, itdoctor_dentist_id")
      .eq("is_active", true);

    for (const doc of oldDoctors ?? []) {
      if (
        doc.itdoctor_dentist_id === null ||
        !itDentistIds.includes(doc.itdoctor_dentist_id)
      ) {
        await supabase
          .from("doctors")
          .update({ is_active: false })
          .eq("id", doc.id);
        result.deactivated++;
      }
    }

    // Deactivate services not linked to IT Doctor
    const { data: oldServices } = await supabase
      .from("services")
      .select("id, itdoctor_service_id")
      .eq("is_active", true);

    for (const svc of oldServices ?? []) {
      if (
        svc.itdoctor_service_id === null ||
        !itServiceIds.includes(svc.itdoctor_service_id)
      ) {
        await supabase
          .from("services")
          .update({ is_active: false })
          .eq("id", svc.id);
        result.deactivated++;
      }
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
