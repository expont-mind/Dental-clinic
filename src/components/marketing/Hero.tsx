import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function Hero({ lang, dict }: { lang: string; dict: Dictionary }) {
  const phoneHref = `tel:${dict.home.hero_phone.replace(/\s/g, "")}`;

  return (
    <section className="relative isolate">
      {/* Full-bleed photo background */}
      <div className="relative h-[640px] w-full overflow-hidden sm:h-[720px] lg:h-[780px]">
        <Image
          src="/hamtolon.jpg"
          alt="Our dental team caring for a patient"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Readability gradient — keep portraits crisp on the sides */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/45"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_42%,transparent_0%,rgba(0,0,0,0.55)_100%)]"
        />

        {/* Hero copy — anchored to bottom of the image */}
        <div className="relative mx-auto flex h-full max-w-5xl flex-col items-center justify-end px-5 pb-24 pt-8 text-center sm:px-8 sm:pb-32">
          <p className="font-script text-[32px] leading-none text-white sm:text-[44px]">
            {dict.home.script_accent}
          </p>
          <p className="mt-4 max-w-md text-[14px] leading-7 text-white/90 sm:text-[15px]">
            {dict.home.hero_lede}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            <Link
              href={`/${lang}/book`}
              className="group inline-flex items-center gap-3 rounded-full bg-primary py-1.5 pl-6 pr-1.5 text-[14px] font-semibold text-white hover:bg-primary-hover transition-colors"
            >
              {dict.home.hero_schedule_btn}
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-primary transition-transform group-hover:translate-x-0.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7 17 17 7M9 7h8v8"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>

            <a href={phoneHref} className="inline-flex items-center gap-3 text-white">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-white shadow-[0_0_0_5px_rgba(255,255,255,0.18)]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2 2A14 14 0 0 1 3 6a2 2 0 0 1 2-2z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="text-left leading-tight">
                <span className="font-script block text-[18px] text-white/85">
                  {dict.home.hero_phone_label}:
                </span>
                <span className="block text-[16px] font-bold tracking-wide">
                  {dict.home.hero_phone}
                </span>
              </span>
            </a>
          </div>
        </div>

        {/* Floating chat bubble bottom-right */}
        <button
          aria-label="Open chat"
          className="absolute bottom-8 right-6 z-10 grid h-12 w-12 place-items-center rounded-full bg-white text-primary shadow-lg ring-1 ring-black/5 hover:scale-105 transition-transform sm:bottom-10 sm:right-10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 12a8 8 0 1 1-3.5-6.6L21 4l-1 4.5A7.9 7.9 0 0 1 21 12z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <circle cx="9" cy="12" r="1" fill="currentColor" />
            <circle cx="13" cy="12" r="1" fill="currentColor" />
            <circle cx="17" cy="12" r="1" fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* Wave divider — twin mint ribbons */}
      <svg
        aria-hidden
        viewBox="0 0 1440 130"
        preserveAspectRatio="none"
        className="-mt-20 block h-24 w-full text-bg sm:h-28"
      >
        {/* Light mint backwave */}
        <path
          fill="var(--color-primary)"
          opacity="0.32"
          d="M0 60 C 280 10 560 100 800 55 S 1200 30 1440 80 L 1440 130 L 0 130 Z"
        />
        {/* Solid mint front wave */}
        <path
          fill="var(--color-primary)"
          opacity="0.85"
          d="M0 80 C 260 40 520 110 780 78 S 1180 60 1440 95 L 1440 130 L 0 130 Z"
        />
        {/* White cap to expose page background */}
        <path
          fill="currentColor"
          d="M0 100 C 260 70 520 122 780 100 S 1180 78 1440 110 L 1440 130 L 0 130 Z"
        />
      </svg>

      {/* Stat counter circle with rotating label */}
      <div className="relative -mt-14 flex flex-col items-center pb-10 sm:-mt-16 sm:pb-14">
        <div className="relative h-24 w-24 sm:h-28 sm:w-28">
          {/* Rotating text ring */}
          <svg
            className="absolute inset-0 h-full w-full animate-[spin_22s_linear_infinite]"
            viewBox="0 0 100 100"
          >
            <defs>
              <path
                id="ringText"
                d="M 50,50 m -40,0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0"
              />
            </defs>
            <text className="fill-primary text-[6.5px] font-bold tracking-[0.36em] uppercase">
              <textPath href="#ringText" startOffset="0%">
                · YEARS OF EXPERIENCE · YEARS OF EXPERIENCE
              </textPath>
            </text>
          </svg>
          {/* Inner circle */}
          <div className="absolute inset-3 grid place-items-center rounded-full bg-surface ring-1 ring-primary/30 shadow-sm">
            <p className="font-display text-3xl font-bold leading-none text-ink sm:text-4xl">
              0
            </p>
          </div>
        </div>

        {/* Dashed vertical timeline + mint dot */}
        <div className="mt-4 flex flex-col items-center">
          <span
            aria-hidden
            className="h-12 w-px"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, var(--color-line-strong) 50%, transparent 50%)",
              backgroundSize: "1px 6px",
              backgroundRepeat: "repeat-y",
            }}
          />
          <span className="mt-1 grid h-3 w-3 place-items-center rounded-full bg-primary ring-4 ring-primary/20" />
        </div>
      </div>
    </section>
  );
}
