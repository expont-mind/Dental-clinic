import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function WhyTrust({ lang, dict }: { lang: string; dict: Dictionary }) {
  const items = dict.home.why_trust_items;

  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
          {/* Left: photo collage with stamp + mint accents */}
          <div className="relative pb-24">
            {/* Mint square accent — bottom-left, peeking from behind */}
            <span
              aria-hidden
              className="absolute -bottom-2 -left-2 h-32 w-44 rounded-[28px] bg-primary/40 sm:-bottom-4 sm:-left-4 sm:h-40 sm:w-56"
            />
            {/* Mint thin frame echo — bottom-left */}
            <span
              aria-hidden
              className="absolute -bottom-2 -left-2 h-32 w-44 rounded-[28px] ring-2 ring-primary sm:-bottom-4 sm:-left-4 sm:h-40 sm:w-56"
            />

            {/* Big main portrait */}
            <div className="relative ml-4 aspect-[4/5] w-[78%] overflow-hidden rounded-[28px] shadow-lg sm:ml-6 sm:w-[72%]">
              <Image
                src="/p1.jpg"
                alt=""
                fill
                sizes="(max-width: 1024px) 75vw, 360px"
                className="object-cover"
              />
            </div>

            {/* Small overlapping portrait — bottom-right */}
            <div className="absolute bottom-4 right-0 aspect-[4/5] w-[48%] overflow-hidden rounded-[24px] shadow-lg ring-4 ring-bg sm:bottom-6 sm:w-[46%]">
              <Image
                src="/p3.jpg"
                alt=""
                fill
                sizes="(max-width: 1024px) 50vw, 240px"
                className="object-cover"
              />
            </div>

            {/* Circular badge stamp — at the junction of the two images */}
            <div className="absolute right-[44%] top-[50%] z-20 -translate-y-1/2 translate-x-1/2 sm:right-[42%]">
              <div className="relative grid h-24 w-24 place-items-center rounded-full bg-white shadow-xl ring-1 ring-line sm:h-28 sm:w-28">
                <svg
                  className="absolute inset-0 h-full w-full animate-[spin_24s_linear_infinite]"
                  viewBox="0 0 100 100"
                >
                  <defs>
                    <path
                      id="badgeText"
                      d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
                    />
                  </defs>
                  <text className="fill-ink text-[7px] font-bold tracking-[0.22em] uppercase">
                    <textPath href="#badgeText" startOffset="0%">
                      · DENTARIS · DIGITAL DENTAL · SINCE 2009
                    </textPath>
                  </text>
                </svg>
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-primary"
                >
                  <path
                    d="M8 3c-2 0-4 1.5-4 4 0 1 .3 2 .8 3.2.7 1.8 1.2 3.3 1.7 5.8.4 2 1 4 2 4 1.2 0 1.5-2 1.7-3.5.1-1 .8-1.5 1.8-1.5s1.7.5 1.8 1.5c.2 1.5.5 3.5 1.7 3.5 1 0 1.6-2 2-4 .5-2.5 1-4 1.7-5.8.5-1.2.8-2.2.8-3.2 0-2.5-2-4-4-4-1.5 0-2 .5-4 .5S9.5 3 8 3Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Years stat — bottom-left of section */}
            <div className="absolute bottom-0 left-2 z-30 sm:left-4">
              <p className="font-display text-4xl font-extrabold leading-none text-ink sm:text-5xl">
                25<span className="text-primary">+</span>
              </p>
              <p className="mt-1.5 text-[11px] font-medium tracking-wider text-muted">
                Year Of Experiences
              </p>
            </div>
          </div>

          {/* Right: copy */}
          <div>
            <p className="font-script text-[34px] leading-none text-primary sm:text-[44px]">
              {dict.home.script_accent}
            </p>
            <h2 className="mt-3 text-[34px] font-extrabold uppercase leading-[1.05] tracking-tight text-ink sm:text-[44px]">
              WHY{" "}
              <span className="text-primary">{dict.brand.name}</span>{" "}
              DENTISTRY.
            </h2>
            <p className="mt-6 max-w-lg text-[14px] leading-7 text-muted sm:text-[15px]">
              {dict.home.why_trust_lede}
            </p>

            <ul className="mt-7 space-y-3.5">
              {items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 12l5 5 9-11"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <p className="text-[14px] leading-7 text-ink-2">{item}</p>
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap items-center gap-5">
              <Link
                href={`/${lang}/book`}
                className="group inline-flex items-center gap-3 rounded-full bg-primary py-2 pl-6 pr-2 text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors"
              >
                {dict.home.hero_schedule_btn}
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

              <a
                href={`tel:${dict.home.hero_phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-3"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-white">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2 2A14 14 0 0 1 3 6a2 2 0 0 1 2-2z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="leading-tight">
                  <span className="font-script block text-[15px] text-muted">
                    {dict.home.hero_phone_label}:
                  </span>
                  <span className="block text-[14px] font-bold tracking-wide text-ink">
                    {dict.home.hero_phone}
                  </span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
