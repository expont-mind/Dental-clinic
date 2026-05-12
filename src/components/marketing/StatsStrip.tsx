import type { Dictionary } from "@/lib/i18n/dictionaries";

export function StatsStrip({ dict }: { dict: Dictionary }) {
  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8">
      <div className="rounded-[28px] bg-surface p-6 shadow-[0_20px_50px_-30px_rgba(26,132,120,0.2)] ring-1 ring-line sm:p-8">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            ◦ {dict.home.stats_eyebrow}
          </p>
          <h2 className="font-display mt-2 text-[22px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-[28px]">
            {dict.home.stats_title}
          </h2>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
          {dict.home.stats_items.map((s, i) => (
            <li
              key={s.label}
              className={
                "text-center " + (i > 0 ? "sm:border-l sm:border-line" : "")
              }
            >
              <p className="font-display text-3xl font-extrabold leading-none text-primary sm:text-4xl">
                {s.value}
              </p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                {s.label}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
