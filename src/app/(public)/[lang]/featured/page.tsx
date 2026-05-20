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
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary sm:text-[11px]">
              ◦ {dict.about.featured_eyebrow}
            </p>
            <p className="font-script mt-2 text-[22px] leading-none text-primary sm:text-[32px] lg:text-[42px]">
              {dict.brand.name}
            </p>
            <h1 className="font-display mt-2 text-[24px] font-extrabold uppercase leading-tight tracking-tight sm:text-[32px] lg:text-[44px]">
              {dict.about.featured_title}
            </h1>
            <p className="mt-4 text-[13.5px] leading-7 text-white/65 sm:mt-5 sm:text-[14.5px] lg:text-[15px]">
              {dict.about.featured_lede}
            </p>
          </div>

          <ul className="mt-8 grid gap-4 sm:mt-12 sm:gap-6 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
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
