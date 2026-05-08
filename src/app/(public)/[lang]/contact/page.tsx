import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  // Sukhbaatar district approximate coords
  const mapSrc =
    "https://www.openstreetmap.org/export/embed.html?bbox=106.910%2C47.916%2C106.928%2C47.926&layer=mapnik&marker=47.921%2C106.919";

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
          ◦ {dict.nav.contact}
        </p>
        <h1 className="font-display mt-3 text-4xl font-medium leading-tight tracking-tight sm:text-6xl">
          {dict.contact.title}
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-muted">
          {dict.contact.lede}
        </p>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-12">
        {/* Info */}
        <dl className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line lg:col-span-5">
          <Field label={dict.contact.address_label} value={dict.contact.address} />
          <Field
            label={dict.contact.phone_label}
            value={dict.contact.phone}
            href={`tel:${dict.contact.phone.replace(/\s/g, "")}`}
          />
          <Field
            label={dict.contact.email_label}
            value={dict.contact.email}
            href={`mailto:${dict.contact.email}`}
          />
          <Field
            label={dict.contact.hours_label}
            value={dict.contact.hours}
            multiline
          />
        </dl>

        {/* Map */}
        <div className="overflow-hidden rounded-3xl border border-line lg:col-span-7">
          <iframe
            title="Lumen hospital location"
            src={mapSrc}
            className="block h-[400px] w-full sm:h-[480px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  href,
  multiline,
}: {
  label: string;
  value: string;
  href?: string;
  multiline?: boolean;
}) {
  const inner = multiline ? (
    <span className="block whitespace-pre-line text-base leading-7 text-ink-2">
      {value}
    </span>
  ) : (
    <span className="block text-base leading-7 text-ink-2">{value}</span>
  );
  return (
    <div className="bg-surface p-6">
      <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
        {label}
      </dt>
      <dd className="mt-2">
        {href ? (
          <a href={href} className="hover:text-primary transition-colors">
            {inner}
          </a>
        ) : (
          inner
        )}
      </dd>
    </div>
  );
}
