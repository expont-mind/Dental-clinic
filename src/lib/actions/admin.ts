"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";
import { DEV_ADMIN, isSupabaseConfigured } from "@/lib/auth";
import { translateError } from "@/lib/utils/translate-error";

export type AdminAuthState = { error?: string };

export async function adminSignInAction(
  _prev: AdminAuthState,
  formData: FormData,
): Promise<AdminAuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "Имэйл, нууц үг шаардлагатай." };

  // 1. Dev bypass — accept temporary credentials and skip Supabase
  if (
    email.toLowerCase() === DEV_ADMIN.email.toLowerCase() &&
    password === DEV_ADMIN.password
  ) {
    const jar = await cookies();
    jar.set(DEV_ADMIN.cookieName, "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    redirect("/admin");
  }

  // 2. Real Supabase auth
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Supabase холбогдоогүй байна. .env.local дотроо NEXT_PUBLIC_SUPABASE_URL/ANON_KEY нэмнэ үү.",
    };
  }

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: translateError(error) };

  redirect("/admin");
}

export async function adminSignOutAction() {
  const jar = await cookies();
  jar.delete(DEV_ADMIN.cookieName);
  try {
    const supabase = await createSupabaseServer();
    await supabase.auth.signOut();
  } catch {
    // ignore — dev bypass doesn't need Supabase session
  }
  redirect("/admin/login");
}

export type SlotGenState = { ok?: boolean; error?: string; inserted?: number };

export async function generateSlotsAction(
  _prev: SlotGenState,
  formData: FormData,
): Promise<SlotGenState> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Supabase холбогдоогүй байна. Цаг үүсгэхийн тулд Supabase тохиргоо хэрэгтэй.",
    };
  }
  const doctor_id = String(formData.get("doctor_id") || "");
  const from_date = String(formData.get("from_date") || "");
  const to_date = String(formData.get("to_date") || "");
  const start_time = String(formData.get("start_time") || "09:00");
  const end_time = String(formData.get("end_time") || "17:00");
  const minutes = Number(formData.get("minutes") || 30);
  const skip_weekend = formData.get("skip_weekend") === "on";

  if (!doctor_id || !from_date || !to_date) {
    return { error: "Бүх талбарыг бөглөнө үү." };
  }

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.rpc("generate_slots", {
    p_doctor_id: doctor_id,
    p_from_date: from_date,
    p_to_date: to_date,
    p_start_time: start_time,
    p_end_time: end_time,
    p_minutes: minutes,
    p_skip_weekend: skip_weekend,
  });
  if (error) return { error: translateError(error) };
  revalidatePath("/admin/slots");
  return { ok: true, inserted: typeof data === "number" ? data : 0 };
}

export async function updateAppointmentStatusAction(formData: FormData) {
  if (!isSupabaseConfigured()) return;
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!id || !["confirmed", "completed", "cancelled"].includes(status)) return;
  const supabase = await createSupabaseServer();
  await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id);
  revalidatePath("/admin/appointments");
}
