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
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col justify-center px-5 py-12 sm:px-8">
      <div className="rounded-3xl border border-line bg-surface p-8 shadow-[0_8px_24px_-12px_rgb(12_26_35/0.18)]">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
          ◦ Admin
        </p>
        <h1 className="font-display mt-3 text-3xl font-medium leading-tight tracking-tight">
          Нэвтрэх
        </h1>
        <p className="mt-2 text-sm text-muted">
          Зөвхөн ажилтан нэвтэрнэ. Захиалга өгөх бол&nbsp;
          <a className="text-primary hover:underline" href="/mn/book">
            тэр даруй цаг авах
          </a>
          .
        </p>

        {!supaReady && (
          <div className="mt-6 rounded-xl border border-warn/30 bg-warn/10 px-4 py-3 text-xs text-warn">
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
    </div>
  );
}
