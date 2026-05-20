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
    <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14 lg:py-16">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="max-w-lg">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary sm:text-[10.5px]">
            ◦ {dict.home.process_eyebrow}
          </p>
          <h2 className="font-display mt-2 text-[18px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:whitespace-nowrap sm:text-[22px] lg:text-[24px]">
            {dict.home.process_title}
          </h2>
        </div>
        <Link
          href={`/${lang}/book`}
          className="group inline-flex items-center gap-2 rounded-full bg-primary py-2 pl-5 pr-1.5 text-[13px] font-bold text-white hover:bg-primary-hover transition-colors"
        >
          {dict.home.hero_schedule_btn}
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-primary transition-transform group-hover:translate-x-0.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
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

      <ol className="relative mt-6 grid gap-3 sm:mt-8 sm:gap-4 sm:grid-cols-3">
        {/* Decorative dashed connector */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px sm:block"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--color-line-strong) 50%, transparent 50%)",
            backgroundSize: "8px 1px",
            backgroundRepeat: "repeat-x",
          }}
        />
        {dict.home.process_steps.map((s, i) => {
          const isAccent = i === 1;
          return (
            <li
              key={s.step}
              className="relative rounded-[16px] bg-surface p-4 ring-1 ring-line transition-all hover:-translate-y-0.5 hover:ring-primary/40 hover:shadow-[0_10px_24px_-18px_rgba(26,132,120,0.3)] sm:rounded-[18px] sm:p-5"
            >
              <span
                className={
                  "relative z-10 grid h-10 w-10 place-items-center rounded-xl font-display text-[12px] font-extrabold ring-4 ring-bg sm:h-11 sm:w-11 sm:text-[13px] " +
                  (isAccent
                    ? "bg-accent text-accent-ink"
                    : "bg-primary text-white")
                }
              >
                {s.step}
              </span>
              <h3 className="font-display mt-2.5 text-[14px] font-extrabold tracking-tight text-ink sm:mt-3 sm:text-[15px]">
                {s.title}
              </h3>
              <p className="mt-1 text-[12px] leading-6 text-muted sm:mt-1.5 sm:text-[12.5px]">
                {s.body}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
