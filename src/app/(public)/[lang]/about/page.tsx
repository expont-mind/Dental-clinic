import Image from "next/image";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      {/* Editorial intro */}
      <section className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
            ◦ {dict.about.eyebrow}
          </p>
          <h1 className="font-display mt-4 text-4xl font-medium leading-[1.05] tracking-tight sm:text-6xl">
            {dict.about.title}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
            {dict.about.lede}
          </p>
        </div>
        <div className="lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line">
            <Image
              src="https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=900&q=80&auto=format&fit=crop"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 480px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <div className="hairline my-20" />

      {/* Mission */}
      <section className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">
            01
          </p>
          <h2 className="font-display mt-3 text-3xl font-medium leading-tight tracking-tight">
            {dict.about.section_mission}
          </h2>
        </div>
        <div className="lg:col-span-8">
          <p className="font-display text-2xl leading-snug text-ink-2 sm:text-3xl">
            “{dict.about.mission_body}”
          </p>
        </div>
      </section>

      <div className="hairline my-20" />

      {/* Values */}
      <section className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">
            02
          </p>
          <h2 className="font-display mt-3 text-3xl font-medium leading-tight tracking-tight">
            {dict.about.section_values}
          </h2>
        </div>
        <ul className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line lg:col-span-8 sm:grid-cols-1">
          {dict.about.values.map((v, i) => (
            <li key={i} className="bg-surface p-7">
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-xs text-muted-2">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-xl font-medium tracking-tight">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-7 text-muted">
                    {v.body}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
