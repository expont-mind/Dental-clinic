import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function CTABand({ lang, dict }: { lang: string; dict: Dictionary }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
      <div className="relative overflow-hidden rounded-3xl bg-ink px-8 py-14 text-white sm:px-14 sm:py-20">
        {/* Decorative dotted grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(white 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        {/* Decorative teal blob */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-[300px] w-[300px] rounded-full bg-primary blur-3xl opacity-50"
        />

        <div className="relative grid items-center gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-medium leading-tight tracking-tight sm:text-5xl">
              {dict.home.cta_band.title}
            </h2>
            <p className="mt-4 max-w-md text-base leading-7 text-white/70 sm:text-lg">
              {dict.home.cta_band.body}
            </p>
          </div>
          <div className="md:justify-self-end">
            <Button asChild size="lg" className="bg-primary hover:bg-primary-hover">
              <Link href={`/${lang}/book`}>
                {dict.home.cta_band.btn}
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
          </div>
        </div>
      </div>
    </section>
  );
}
