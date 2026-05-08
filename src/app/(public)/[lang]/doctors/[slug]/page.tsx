import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";
import { getDoctorBySlug } from "@/lib/queries/catalog";
import { Button } from "@/components/ui/Button";

export default async function DoctorDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const doctor = await getDoctorBySlug(slug);
  if (!doctor) notFound();

  const name = lang === "mn" ? doctor.name_mn : doctor.name_en;
  const title = lang === "mn" ? doctor.title_mn : doctor.title_en;
  const bio = lang === "mn" ? doctor.bio_mn : doctor.bio_en;
  const deptName =
    lang === "mn" ? doctor.department.name_mn : doctor.department.name_en;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-20">
      <Link
        href={`/${lang}/doctors`}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        ← {dict.common.back}
      </Link>
      <article className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-surface-2">
            {doctor.photo_url ? (
              <Image
                src={doctor.photo_url}
                alt={name}
                fill
                sizes="(max-width: 1024px) 100vw, 480px"
                priority
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-display text-8xl text-muted-2">
                {name.charAt(0)}
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-7">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
            ◦ {deptName}
          </p>
          <h1 className="font-display mt-3 text-4xl font-medium leading-[1.1] tracking-tight sm:text-5xl">
            {name}
          </h1>
          <p className="mt-2 text-lg text-muted">{title}</p>

          {doctor.years_exp != null && (
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              {doctor.years_exp}+ {dict.doctors.years_exp}
            </p>
          )}

          {bio && (
            <p className="mt-8 max-w-xl text-[17px] leading-8 text-ink-2">
              {bio}
            </p>
          )}

          <div className="mt-10 flex gap-3">
            <Button asChild size="lg">
              <Link
                href={`/${lang}/book/${doctor.department.slug}/${doctor.id}`}
              >
                {dict.doctors.book_cta}
                <span aria-hidden> →</span>
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={`/${lang}/contact`}>{dict.nav.contact}</Link>
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
}
