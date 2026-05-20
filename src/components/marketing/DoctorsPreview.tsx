import Link from "next/link";
import Image from "next/image";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export async function DoctorsPreview({
  lang,
  dict,
}: {
  lang: string;
  dict: Dictionary;
}) {
  return (
    <section className="relative overflow-hidden bg-primary-soft/40">
      {/* Background accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -bottom-32 h-80 w-80 rounded-full bg-accent/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:py-14">
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-14">
          {/* Left: copy */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-primary ring-1 ring-primary/15 sm:text-[10.5px]">
              ◦ {dict.home.doctors_eyebrow}
            </span>
            <h2 className="font-display mt-3 text-[20px] font-extrabold uppercase leading-[1.15] tracking-tight text-ink sm:mt-4 sm:text-[26px] lg:text-[34px]">
              {dict.home.doctors_title}
            </h2>
            <p className="mt-3 max-w-md text-[13.5px] leading-7 text-muted sm:mt-4 sm:text-[14px]">
              {dict.home.doctors_lede}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3 sm:mt-6 sm:gap-4">
              <Link
                href={`/${lang}/doctors`}
                className="group inline-flex items-center gap-2 rounded-full bg-primary py-2 pl-5 pr-1.5 text-[13px] font-bold text-white hover:bg-primary-hover transition-colors sm:gap-2.5 sm:py-2.5 sm:pl-6 sm:pr-2 sm:text-[13.5px]"
              >
                Эмч нартай танилцах
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-primary transition-transform group-hover:translate-x-0.5 sm:h-8 sm:w-8">
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

              {/* Stats inline */}
              <div className="flex items-center gap-3 border-l border-line/60 pl-3 sm:gap-4 sm:pl-4">
                <div>
                  <p className="font-display text-[18px] font-extrabold leading-none text-primary sm:text-[20px]">
                    13+
                  </p>
                  <p className="mt-1 text-[9.5px] font-semibold uppercase tracking-wider text-muted-2 sm:text-[10.5px]">
                    Эмч
                  </p>
                </div>
                <div>
                  <p className="font-display text-[18px] font-extrabold leading-none text-primary sm:text-[20px]">
                    10+
                  </p>
                  <p className="mt-1 text-[9.5px] font-semibold uppercase tracking-wider text-muted-2 sm:text-[10.5px]">
                    Жил туршлага
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: team photo with floating accents */}
          <div className="relative">
            <span
              aria-hidden
              className="absolute -bottom-2 -right-2 h-24 w-32 rounded-[20px] bg-primary/25 sm:-bottom-3 sm:-right-3 sm:h-32 sm:w-44 lg:h-40 lg:w-56 lg:rounded-[24px]"
            />
            <span
              aria-hidden
              className="absolute -left-2 -top-2 hidden h-12 w-12 rounded-full bg-accent/70 sm:block sm:-left-3 sm:-top-3 sm:h-16 sm:w-16"
            />
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] shadow-xl ring-1 ring-line sm:rounded-[24px]">
              <Image
                src="/DSC02747.jpg"
                alt={dict.home.doctors_title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 620px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
