import type { Dictionary } from "@/lib/i18n/dictionaries";

export function Testimonials({ dict }: { dict: Dictionary }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
      <div className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
          ◦ {dict.home.testimonial_eyebrow}
        </p>
        <p className="font-script mt-2 text-[32px] leading-none text-primary sm:text-[40px]">
          {dict.brand.name}
        </p>
        <h2 className="mx-auto mt-2 max-w-2xl text-[32px] font-extrabold uppercase leading-[1.05] tracking-tight text-ink sm:text-[44px]">
          {dict.home.testimonial_title}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-muted">
          {dict.home.testimonial_lede}
        </p>
      </div>

      <ul className="mt-14 grid gap-5 lg:grid-cols-3">
        {dict.home.testimonials.map((t, i) => {
          const isAccent = i === 1;
          return (
            <li
              key={t.name}
              className={
                "relative flex flex-col rounded-[28px] p-7 ring-1 transition-all hover:-translate-y-1 sm:p-8 " +
                (isAccent
                  ? "bg-accent-soft ring-accent/30"
                  : "bg-primary-soft ring-primary/20")
              }
            >
              {/* Quote glyph */}
              <span
                aria-hidden
                className={
                  "font-display text-[64px] font-extrabold leading-none " +
                  (isAccent ? "text-accent" : "text-primary")
                }
              >
                &ldquo;
              </span>

              {/* Stars */}
              <div className="-mt-3 flex gap-0.5">
                {[0, 1, 2, 3, 4].map((j) => (
                  <svg
                    key={j}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={isAccent ? "text-accent" : "text-primary"}
                  >
                    <path d="M12 2l2.9 6.9L22 9.7l-5.5 4.8L18.2 22 12 18.3 5.8 22l1.7-7.5L2 9.7l7.1-.8z" />
                  </svg>
                ))}
              </div>

              <p className="mt-4 text-[14px] leading-7 text-ink-2 sm:text-[15px]">
                {t.quote}
              </p>

              <div className="mt-6 flex items-center gap-3 border-t border-line/60 pt-5">
                <span
                  className={
                    "grid h-10 w-10 shrink-0 place-items-center rounded-full font-display text-[14px] font-extrabold " +
                    (isAccent
                      ? "bg-accent text-accent-ink"
                      : "bg-primary text-white")
                  }
                >
                  {t.name.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-[15px] font-bold tracking-tight text-ink">
                    {t.name}
                  </p>
                  <p className="text-[12px] text-muted">{t.role}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
