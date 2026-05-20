import type { Dictionary } from "@/lib/i18n/dictionaries";

export function Testimonials({ dict }: { dict: Dictionary }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="text-center">
        <p className="font-script text-[24px] leading-none text-primary sm:text-[28px]">
          {dict.brand.name}
        </p>
        <h2 className="mx-auto mt-1 text-[22px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-[28px]">
          {dict.home.testimonial_title}
        </h2>
      </div>

      <ul className="mt-8 grid gap-4 lg:grid-cols-3">
        {dict.home.testimonials.map((t, i) => {
          const isAccent = i === 1;
          return (
            <li
              key={t.name}
              className={
                "relative flex flex-col rounded-[20px] p-5 ring-1 transition-all hover:-translate-y-0.5 sm:p-6 " +
                (isAccent
                  ? "bg-accent-soft ring-accent/30"
                  : "bg-primary-soft ring-primary/20")
              }
            >
              {/* Quote glyph */}
              <span
                aria-hidden
                className={
                  "font-display text-[44px] font-extrabold leading-none " +
                  (isAccent ? "text-accent" : "text-primary")
                }
              >
                &ldquo;
              </span>

              {/* Stars */}
              <div className="-mt-2 flex gap-0.5">
                {[0, 1, 2, 3, 4].map((j) => (
                  <svg
                    key={j}
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={isAccent ? "text-accent" : "text-primary"}
                  >
                    <path d="M12 2l2.9 6.9L22 9.7l-5.5 4.8L18.2 22 12 18.3 5.8 22l1.7-7.5L2 9.7l7.1-.8z" />
                  </svg>
                ))}
              </div>

              <p className="mt-3 text-[13px] leading-6 text-ink-2 sm:text-[13.5px]">
                {t.quote}
              </p>

              <div className="mt-4 flex items-center gap-2.5 border-t border-line/60 pt-3">
                <span
                  className={
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full font-display text-[12px] font-extrabold " +
                    (isAccent
                      ? "bg-accent text-accent-ink"
                      : "bg-primary text-white")
                  }
                >
                  {t.name.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-[13px] font-bold tracking-tight text-ink">
                    {t.name}
                  </p>
                  <p className="text-[11px] text-muted">{t.role}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
