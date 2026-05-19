import Image from "next/image";
import Link from "next/link";
import { listActiveServicesPublic } from "@/lib/queries/catalog";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const TOOTH =
  "M8 3c-2 0-4 1.5-4 4 0 1 .3 2 .8 3.2C5.5 12 6 13.5 6.5 16c.4 2 1 4 2 4 1.2 0 1.5-2 1.7-3.5.1-1 .8-1.5 1.8-1.5s1.7.5 1.8 1.5c.2 1.5.5 3.5 1.7 3.5 1 0 1.6-2 2-4 .5-2.5 1-4 1.7-5.8.5-1.2.8-2.2.8-3.2 0-2.5-2-4-4-4-1.5 0-2 .5-4 .5S9.5 3 8 3Z";

const ICON_PATHS: Record<string, string> = {
  implant:
    "M12 2v10M9 5h6M8 12h8l-1 8a3 3 0 0 1-3 3h-0a3 3 0 0 1-3-3l-1-8z",
  braces: "M4 8h16v3a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4V8zM8 8v7M12 8v7M16 8v7",
  surgery:
    "M8 3c-2 0-4 1.5-4 4 0 1 .3 2 .8 3.2.7 1.8 1.2 3.3 1.7 5.8.4 2 1 4 2 4 1.2 0 1.5-2 1.7-3.5.1-1 .8-1.5 1.8-1.5s1.7.5 1.8 1.5c.2 1.5.5 3.5 1.7 3.5 1 0 1.6-2 2-4M16 4l4 4-3 3-4-4z",
  kid: "M8 3c-2 0-4 1.5-4 4 0 1 .3 2 .8 3.2.7 1.8 1.2 3.3 1.7 5.8.4 2 1 4 2 4 1.2 0 1.5-2 1.7-3.5.1-1 .8-1.5 1.8-1.5s1.7.5 1.8 1.5c.2 1.5.5 3.5 1.7 3.5 1 0 1.6-2 2-4 .5-2.5 1-4 1.7-5.8.5-1.2.8-2.2.8-3.2 0-2.5-2-4-4-4M9 12h.01M15 12h.01",
  routine: TOOTH,
  hygiene: "M3 21l4-4 6-6 5 5-6 6-4 4zM13 11l4-4 3 3-4 4M14 6l4 4",
  crown: "M3 18h18l-1.5-9-4 4-3.5-7-3.5 7-4-4z",
  gum: "M4 12c0-4 3-7 8-7s8 3 8 7v6H4zM8 18l-1 4M16 18l1 4M12 18v4",
  smile:
    "M8 3c-2 0-4 1.5-4 4 0 1 .3 2 .8 3.2.7 1.8 1.2 3.3 1.7 5.8.4 2 1 4 2 4 1.2 0 1.5-2 1.7-3.5.1-1 .8-1.5 1.8-1.5s1.7.5 1.8 1.5c.2 1.5.5 3.5 1.7 3.5 1 0 1.6-2 2-4M19 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1z",
};

export async function ServicesGrid({
  lang,
  dict,
}: {
  lang: string;
  dict: Dictionary;
}) {
  const services = await listActiveServicesPublic();

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        {/* Left: image with floating play */}
        <div className="relative">
          <div className="relative aspect-square overflow-hidden rounded-[36px]">
            <Image
              src="/p4.jpg"
              alt="Dental care team at work"
              fill
              sizes="(max-width: 1024px) 100vw, 600px"
              className="object-cover"
            />
            <button
              aria-label="Play overview"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 grid h-16 w-16 place-items-center rounded-full bg-primary text-white shadow-[0_8px_30px_rgba(94,189,177,0.45)] hover:scale-105 transition-transform"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6 4l14 8-14 8V4z" />
              </svg>
            </button>
          </div>
          <span
            aria-hidden
            className="absolute -bottom-4 -right-4 hidden h-24 w-24 rounded-3xl bg-primary/25 lg:block"
          />
        </div>

        {/* Right: copy */}
        <div>
          <p className="font-script text-[34px] leading-none text-primary sm:text-[40px]">
            {dict.home.services_eyebrow}
          </p>
          <h2 className="mt-3 text-[32px] font-extrabold uppercase leading-[1.05] tracking-tight text-ink sm:text-[44px]">
            {dict.home.services_title}
          </h2>
          <div className="mt-6 space-y-4 text-[15px] leading-7 text-muted">
            <p>{dict.home.services_lede}</p>
          </div>

          <Link
            href={`/${lang}/services`}
            className="group mt-8 inline-flex items-center gap-3 rounded-full bg-primary py-2 pl-6 pr-2 text-[14px] font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            {dict.home.services_cta}
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
        </div>
      </div>

      {/* Service tiles */}
      {services.length > 0 && (
        <ul className="mt-16 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {services.slice(0, 4).map((s) => {
            const name = lang === "mn" ? s.name_mn : s.name_en;
            const desc = lang === "mn" ? s.description_mn : s.description_en;
            const iconPath = ICON_PATHS[s.icon_key ?? ""] || TOOTH;
            return (
              <li key={s.id}>
                <Link
                  href={`/${lang}/services/${s.slug}`}
                  className="group flex h-full flex-col gap-4 rounded-3xl border border-line bg-surface p-6 transition-colors hover:border-primary/40 hover:bg-primary-soft/30"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary-ink">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={iconPath} />
                    </svg>
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-medium leading-tight tracking-tight text-ink">
                      {name}
                    </h3>
                    <p className="mt-2 text-[13px] leading-6 text-muted line-clamp-3">
                      {desc}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
