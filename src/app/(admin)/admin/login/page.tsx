import Image from "next/image";
import { LoginForm } from "@/components/admin/LoginForm";
import { isSupabaseConfigured } from "@/lib/auth";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const supaReady = isSupabaseConfigured();
  return (
    <div className="relative min-h-screen overflow-hidden bg-primary-soft">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl"
      />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12 sm:px-8">
        <div className="flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Dentaris"
            width={180}
            height={60}
            className="h-14 w-auto"
            priority
          />
        </div>

        <div className="mt-8 rounded-[28px] bg-surface p-8 shadow-[0_20px_50px_-25px_rgba(26,132,120,0.3)] ring-1 ring-line sm:p-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            ◦ Admin
          </p>
          <p className="font-script mt-2 text-[28px] leading-none text-primary sm:text-[36px]">
            Тавтай морил
          </p>
          <h1 className="font-display mt-2 text-[26px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-[32px]">
            Нэвтрэх
          </h1>
          <p className="mt-3 text-[13px] leading-6 text-muted">
            Зөвхөн ажилтан нэвтэрнэ. Үйлчлүүлэгч цаг авах бол&nbsp;
            <a className="font-semibold text-primary hover:underline" href="/mn/book">
              энд дарж захиална уу
            </a>
            .
          </p>

          {!supaReady && (
            <div className="mt-6 rounded-2xl border border-warn/30 bg-warn/10 px-4 py-3 text-[12px] leading-6 text-warn">
              Supabase тохируулагдаагүй байна — энэ хуудсыг ажиллуулахын тулд
              <code className="mx-1">.env.local</code>
              файлд <code>NEXT_PUBLIC_SUPABASE_URL</code> +{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> утгуудыг нэмнэ үү.
            </div>
          )}

          {sp.error === "supabase_not_configured" && supaReady === false ? null : (
            <div className="mt-7">
              <LoginForm />
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-[12px] text-muted">
          © 2026 Dentaris Digital Dental Clinic
        </p>
      </div>
    </div>
  );
}
