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

  const features = [
    { icon: "M5 12l5 5L20 7", text: "Үнэгүй бүртгэл" },
    { icon: "M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0zM12 8v4l3 2", text: "Цаг хэмнэсэн захиалга" },
    { icon: "M12 22s-8-4.5-8-12a8 8 0 0 1 16 0c0 7.5-8 12-8 12z", text: "Хувийн эмчийн санал" },
  ];

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-primary-soft">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl"
      />

      <div className="relative mx-auto grid w-full max-w-6xl flex-1 items-center gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:py-20">
        {/* Left — brand panel */}
        <aside className="hidden lg:flex lg:flex-col">
          <div className="relative aspect-4/5 overflow-hidden rounded-4xl shadow-2xl">
            <Image
              src="/er1.jpg"
              alt={dict.brand.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 480px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

            {/* Floating glass card with features */}
            <div className="absolute inset-x-5 bottom-5 rounded-2xl bg-white/15 p-5 ring-1 ring-white/20 backdrop-blur-xl">
              <p className="font-display text-[18px] font-extrabold leading-tight tracking-tight text-white">
                {dict.auth.signup_title}
              </p>
              <ul className="mt-4 space-y-2">
                {features.map((f) => (
                  <li
                    key={f.text}
                    className="flex items-center gap-2.5 text-[12px] font-medium text-white/90"
                  >
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-white">
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d={f.icon} />
                      </svg>
                    </span>
                    {f.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Right — form */}
        <div>
          <Link
            href={`/${lang}`}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted hover:text-primary transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 6l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {lang === "mn" ? "Буцах" : "Back"}
          </Link>

          <div className="mt-5 rounded-[20px] bg-surface p-5 shadow-[0_20px_60px_-25px_rgba(26,132,120,0.35)] ring-1 ring-line sm:mt-6 sm:rounded-[28px] sm:p-8 lg:p-10">
            <h1 className="font-display text-[22px] font-extrabold leading-tight tracking-tight text-ink sm:text-[26px] lg:text-[32px]">
              {dict.auth.signup_title}
            </h1>
            <p className="mt-2 max-w-md text-[12.5px] leading-6 text-muted sm:text-[13px]">
              {dict.auth.signup_lede}
            </p>

            <div className="mt-6 sm:mt-8">
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

            <div className="mt-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-line" />
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted-2">
                {lang === "mn" ? "эсвэл" : "or"}
              </span>
              <span className="h-px flex-1 bg-line" />
            </div>

            <p className="mt-5 text-center text-[13px] text-muted">
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
