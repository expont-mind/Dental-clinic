import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function Hero({ lang, dict }: { lang: string; dict: Dictionary }) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      {/* Subtle decorative grid behind hero text */}
      <div
        aria-hidden
        className="bg-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(60%_60%_at_50%_30%,black,transparent)]"
      />
      {/* Soft teal wash on the right edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-12 h-[420px] w-[420px] rounded-full bg-primary-soft blur-3xl opacity-70"
      />

      <div className="relative mx-auto max-w-7xl px-5 pt-16 pb-12 sm:px-8 sm:pt-24 sm:pb-20 lg:pt-28">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-primary">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          {dict.home.eyebrow}
        </div>

        <h1 className="font-display mt-6 max-w-4xl text-[40px] font-medium leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-[72px]">
          {dict.home.title_lead}{" "}
          <span className="relative inline-block italic text-primary">
            {dict.home.title_emph}
            <svg
              aria-hidden
              viewBox="0 0 220 14"
              preserveAspectRatio="none"
              className="absolute -bottom-2 left-0 h-3 w-full text-primary/45"
            >
              <path
                d="M2 9 Q 55 2 110 7 T 218 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </span>{" "}
          {dict.home.title_tail}
        </h1>

        <p className="mt-7 max-w-2xl text-lg leading-8 text-muted sm:text-xl sm:leading-9">
          {dict.home.lede}
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link href={`/${lang}/book`}>
              {dict.home.cta_book}
              <svg
                aria-hidden
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                className="ml-1"
              >
                <path
                  d="M5 12h14m-6-6 6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={`/${lang}/services`}>{dict.home.cta_explore}</Link>
          </Button>
        </div>

        {/* Hero photograph */}
        <div className="relative mt-14 overflow-hidden rounded-3xl border border-line shadow-[0_10px_40px_-12px_rgb(12_26_35/0.18)]">
          <div className="aspect-[16/8] relative w-full bg-surface-2">
            <Image
              src="https://images.unsplash.com/photo-1666214280391-8ff5bd3c0bf0?w=1800&q=80&auto=format&fit=crop"
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1200px"
              className="object-cover"
            />
            {/* readability vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent" />
          </div>
          {/* Floating credit card */}
          <div className="absolute bottom-5 left-5 max-w-[260px] rounded-2xl bg-surface/95 p-4 backdrop-blur-md shadow-[0_8px_24px_-8px_rgb(12_26_35/0.25)]">
            <p className="text-xs uppercase tracking-[0.15em] text-muted">
              {dict.home.stats.specialties}
            </p>
            <p className="font-display mt-1 text-3xl font-medium leading-none">
              5
            </p>
            <p className="mt-2 text-xs text-muted-2">
              Lumen, Улаанбаатар
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
