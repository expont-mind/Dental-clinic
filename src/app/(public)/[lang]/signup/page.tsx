import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import { SignupForm } from "@/components/auth/SignupForm";

export default async function SignupPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

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

      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-20">
        {/* Left — brand panel */}
        <aside className="hidden lg:flex lg:flex-col">
          <Link href={`/${lang}`} className="inline-flex items-center gap-2">
            <span className="font-display text-[18px] font-bold tracking-tight text-ink">
              {dict.brand.name}
            </span>
          </Link>

          <div className="relative mt-12 aspect-[4/5] overflow-hidden rounded-[36px] shadow-2xl">
            <Image
              src="/p3.jpg"
              alt={dict.brand.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 480px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <p className="font-script text-[28px] leading-none text-primary">
                {dict.brand.name}
              </p>
              <p className="mt-2 text-[20px] font-extrabold uppercase leading-tight tracking-tight">
                {dict.auth.signup_title}
              </p>
              <p className="mt-3 max-w-sm text-[12px] leading-6 text-white/80">
                {dict.auth.signup_lede}
              </p>
            </div>
          </div>
        </aside>

        {/* Right — form */}
        <div>
          <Link
            href={`/${lang}`}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted hover:text-primary"
          >
            ← {dict.brand.name}
          </Link>

          <div className="mt-6 rounded-[28px] bg-surface p-7 shadow-[0_20px_50px_-25px_rgba(26,132,120,0.3)] ring-1 ring-line sm:p-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
              ◦ {dict.auth.signup}
            </p>
            <p className="font-script mt-2 text-[28px] leading-none text-primary sm:text-[36px]">
              {dict.brand.name}
            </p>
            <h1 className="font-display mt-2 text-[28px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-[36px]">
              {dict.auth.signup_title}
            </h1>
            <p className="mt-3 max-w-md text-[13px] leading-6 text-muted">
              {dict.auth.signup_lede}
            </p>

            <div className="mt-8">
              <SignupForm
                lang={lang}
                dict={{
                  name: dict.auth.name,
                  name_ph: dict.auth.name_ph,
                  email: dict.auth.email,
                  email_ph: dict.auth.email_ph,
                  phone: dict.auth.phone,
                  phone_ph: dict.auth.phone_ph,
                  password: dict.auth.password,
                  password_ph: dict.auth.password_ph,
                  loading: dict.auth.loading,
                  submit_signup: dict.auth.submit_signup,
                }}
              />
            </div>

            <p className="mt-6 text-center text-[13px] text-muted">
              {dict.auth.have_account}{" "}
              <Link
                href={`/${lang}/login`}
                className="font-bold text-primary hover:underline"
              >
                {dict.auth.go_login}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
