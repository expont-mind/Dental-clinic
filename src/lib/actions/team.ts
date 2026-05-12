"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/auth";
import { translateError } from "@/lib/utils/translate-error";

export type CreateDoctorState = {
  error?: string;
  values?: {
    name?: string;
    title?: string;
    photo_url?: string;
    phone?: string;
    email?: string;
    specialty?: string;
    years_exp?: string;
    bio?: string;
    specializations?: string;
    education?: string;
  };
};

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || `doc-${Date.now().toString(36)}`
  );
}

export async function createDoctorAction(
  _prev: CreateDoctorState,
  formData: FormData,
): Promise<CreateDoctorState> {
  const name = String(formData.get("name") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const photo_url = String(formData.get("photo_url") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const specialty = String(formData.get("specialty") || "").trim();
  const years_exp_str = String(formData.get("years_exp") || "").trim();
  const bio = String(formData.get("bio") || "").trim();
  const specializations = String(formData.get("specializations") || "").trim();
  const education = String(formData.get("education") || "").trim();

  const values = {
    name,
    title,
    photo_url,
    phone,
    email,
    specialty,
    years_exp: years_exp_str,
    bio,
    specializations,
    education,
  };

  if (!name) return { error: "Нэр заавал шаардлагатай.", values };
  if (!specialty) return { error: "Гол чиглэлээ оруулна уу.", values };

  if (!isSupabaseConfigured()) {
    return {
      error:
        "Supabase холбогдоогүй байна. Эмчийг бүртгэхийн тулд Supabase тохиргоо хэрэгтэй.",
      values,
    };
  }

  const supabase = await createSupabaseServer();

  const yearsExp = Number(years_exp_str);
  const validYears = Number.isFinite(yearsExp) && yearsExp >= 0 ? yearsExp : null;

  // Find a department matching the typed specialty (case/space-insensitive),
  // or fall back to the first available department for the FK constraint.
  const { data: depts } = await supabase
    .from("departments")
    .select("id,name_mn,name_en,slug")
    .order("sort_order", { ascending: true });
  const specNorm = specialty.toLowerCase().replace(/\s+/g, "");
  const matched = (depts ?? []).find((d) =>
    [d.name_mn, d.name_en, d.slug]
      .filter(Boolean)
      .some((n) =>
        String(n).toLowerCase().replace(/\s+/g, "").includes(specNorm),
      ),
  );
  const department_id = matched?.id ?? depts?.[0]?.id;
  if (!department_id) {
    return {
      error: "Тасгийн жагсаалт хоосон байна. Эхлээд тасаг үүсгэнэ үү.",
      values,
    };
  }

  // Compose Mongolian bio from optional spec/education tags so they aren't lost.
  const extras: string[] = [];
  if (specializations) extras.push(`Мэргэшил: ${specializations}`);
  if (education) extras.push(`Боловсрол: ${education}`);
  if (phone) extras.push(`Утас: ${phone}`);
  if (email) extras.push(`И-мэйл: ${email}`);
  const fullBio = [bio, ...extras].filter(Boolean).join("\n");

  // Use typed specialty as title when no explicit title was provided.
  const finalTitle = title || specialty;

  const baseSlug = slugify(name);
  let slug = baseSlug;
  for (let i = 2; i <= 9; i++) {
    const { data: existing } = await supabase
      .from("doctors")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${i}`;
  }

  const { error } = await supabase.from("doctors").insert({
    department_id,
    slug,
    name_mn: name,
    name_en: name,
    title_mn: finalTitle || null,
    title_en: finalTitle || null,
    bio_mn: fullBio || null,
    bio_en: fullBio || null,
    photo_url: photo_url || null,
    years_exp: validYears,
    is_active: true,
    sort_order: 1,
  });

  if (error) {
    return { error: translateError(error), values };
  }

  revalidatePath("/admin/team");
  redirect("/admin/team");
}
