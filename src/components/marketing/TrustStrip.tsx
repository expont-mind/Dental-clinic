import type { Dictionary } from "@/lib/i18n/dictionaries";

const STATS = [
  { value: "16+", key: "years" as const },
  { value: "9+", key: "doctors" as const },
  { value: "12k+", key: "patients" as const },
  { value: "5", key: "specialties" as const },
];

export function TrustStrip({ dict }: { dict: Dictionary }) {
  return (
    <section className="border-b border-line bg-surface">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-line border-x border-line/0 px-0 sm:grid-cols-4 sm:px-8">
        {STATS.map((s) => (
          <div
            key={s.key}
            className="px-5 py-8 text-center sm:py-10 sm:text-left"
          >
            <p className="font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl">
              {s.value}
            </p>
            <p className="mt-2 text-sm text-muted">
              {dict.home.stats[s.key]}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
