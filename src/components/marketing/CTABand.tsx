import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function CTABand({ lang, dict }: { lang: string; dict: Dictionary }) {
  const offer = dict.home.welcome_offer;

  return (
    <section className="px-3 pb-3 sm:px-5 sm:pb-5">
      <div className="bg-forest-grain relative overflow-hidden rounded-[28px] sm:rounded-[40px]">
        <div className="grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-[1.2fr_1fr] lg:gap-12 lg:p-16">
          <div className="text-white">
            <p className="font-script text-[32px] leading-none text-primary sm:text-[40px]">
              {offer.eyebrow}
            </p>
            <h2 className="mt-2 text-[28px] font-extrabold uppercase leading-[1.08] tracking-tight sm:text-[40px]">
              {offer.title}
            </h2>
            <p className="mt-5 max-w-lg text-[15px] leading-7 text-white/65">
              {offer.body}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href={`/${lang}/book`}
                className="group inline-flex items-center gap-3 rounded-full bg-primary py-2 pl-6 pr-2 text-[14px] font-semibold text-white hover:bg-primary-hover transition-colors"
              >
                {offer.btn}
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-primary transition-transform group-hover:translate-x-0.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 17 17 7M9 7h8v8"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>
              <p className="text-[12px] text-white/45">{offer.note}</p>
            </div>
          </div>

          <div className="relative">
            <div className="relative mx-auto aspect-[5/4] w-full max-w-[460px] overflow-hidden rounded-[24px] sm:rounded-[32px]">
              <Image
                src="/p5.jpg"
                alt="Welcoming dental visit"
                fill
                sizes="(max-width: 1024px) 100vw, 460px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
