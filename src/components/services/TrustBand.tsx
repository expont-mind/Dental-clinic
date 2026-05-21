type Stat = { value: string; label: string };

export function TrustBand({
  eyebrow,
  stats,
}: {
  eyebrow: string;
  stats: [Stat, Stat, Stat, Stat];
}) {
  return (
    <section className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 sm:pt-20">
      <div className="rounded-[28px] bg-[#f6f2ec] px-6 py-10 sm:rounded-[36px] sm:px-12 sm:py-14">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
          {eyebrow}
        </p>
        <dl className="mt-7 grid grid-cols-2 gap-y-8 sm:grid-cols-4 sm:gap-x-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <dt className="font-display text-[34px] font-extrabold leading-none tracking-tight text-ink sm:text-[44px]">
                {s.value}
              </dt>
              <dd className="mt-2 text-[12px] leading-5 text-muted sm:text-[13px]">
                {s.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
