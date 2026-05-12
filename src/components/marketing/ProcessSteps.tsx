import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function ProcessSteps({
  lang,
  dict,
}: {
  lang: string;
  dict: Dictionary;
}) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
      <div className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
          ◦ {dict.home.process_eyebrow}
        </p>
        <p className="font-script mt-2 text-[32px] leading-none text-primary sm:text-[40px]">
          {dict.brand.name}
        </p>
        <h2 className="mx-auto mt-2 max-w-2xl text-[32px] font-extrabold uppercase leading-[1.05] tracking-tight text-ink sm:text-[44px]">
          {dict.home.process_title}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-muted">
          {dict.home.process_lede}
        </p>
      </div>

      <ol className="relative mt-14 grid gap-6 sm:grid-cols-3 sm:gap-4">
        {/* Decorative dashed connector */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 top-9 hidden h-px sm:block"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--color-line-strong) 50%, transparent 50%)",
            backgroundSize: "10px 1px",
            backgroundRepeat: "repeat-x",
          }}
        />
        {dict.home.process_steps.map((s, i) => {
          const isAccent = i === 1;
          return (
            <li
              key={s.step}
              className="relative rounded-[24px] bg-surface p-7 ring-1 ring-line transition-all hover:-translate-y-1 hover:ring-primary/40 hover:shadow-[0_18px_36px_-22px_rgba(26,132,120,0.3)]"
            >
              <span
                className={
                  "relative z-10 grid h-14 w-14 place-items-center rounded-2xl font-display text-[16px] font-extrabold ring-4 ring-bg " +
                  (isAccent
                    ? "bg-accent text-accent-ink"
                    : "bg-primary text-white")
                }
              >
                {s.step}
              </span>
              <h3 className="font-display mt-5 text-[20px] font-bold tracking-tight text-ink">
                {s.title}
              </h3>
              <p className="mt-2 text-[14px] leading-7 text-muted">{s.body}</p>
            </li>
          );
        })}
      </ol>

      <div className="mt-12 flex justify-center">
        <Link
          href={`/${lang}/book`}
          className="group inline-flex items-center gap-3 rounded-full bg-primary py-2 pl-6 pr-2 text-[14px] font-semibold text-white hover:bg-primary-hover transition-colors"
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
      </div>
    </section>
  );
}
