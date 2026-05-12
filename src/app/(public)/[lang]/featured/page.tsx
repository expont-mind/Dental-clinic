import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries";

export default async function FeaturedPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <div className="bg-bg">
      <section className="bg-forest-grain text-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
              ◦ {dict.about.featured_eyebrow}
            </p>
            <p className="font-script mt-2 text-[34px] leading-none text-primary sm:text-[42px]">
              {dict.brand.name}
            </p>
            <h1 className="mt-2 text-[32px] font-extrabold uppercase leading-tight tracking-tight sm:text-[44px]">
              {dict.about.featured_title}
            </h1>
            <p className="mt-5 text-[15px] leading-7 text-white/65">
              {dict.about.featured_lede}
            </p>
          </div>

          <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {dict.about.featured_items.map((item) => (
              <li
                key={item.image}
                className="group overflow-hidden rounded-[24px] bg-white/[0.04] ring-1 ring-white/10 transition-all hover:-translate-y-1 hover:ring-primary/40"
              >
                <Link
                  href={`/${lang}/book`}
                  className="block"
                  aria-label={item.title}
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-white">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
