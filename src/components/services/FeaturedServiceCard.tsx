import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { ServiceCardItem } from "./ServiceCard";

export function FeaturedServiceCard({
  item,
  lang,
  viewLabel,
  featuredLabel,
  index,
}: {
  item: ServiceCardItem;
  lang: string;
  viewLabel: string;
  featuredLabel: string;
  index: number;
}) {
  return (
    <Link
      href={`/${lang}/services/${item.slug}`}
      className="reveal group relative col-span-1 grid h-full overflow-hidden rounded-[28px] bg-surface ring-1 ring-line transition-all duration-300 hover:-translate-y-1 hover:ring-primary/40 hover:shadow-[0_28px_50px_-22px_rgba(26,132,120,0.28)] sm:col-span-2 sm:grid-cols-2"
      style={{ ["--reveal-delay" as string]: `${Math.min(index, 8) * 60}ms` }}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-primary-soft sm:aspect-auto sm:h-full">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          priority
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-black/10"
        />
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white shadow-sm">
          <Sparkles className="h-3 w-3" strokeWidth={2.5} />
          {featuredLabel}
        </span>
      </div>

      <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
        <h2 className="font-display text-[24px] font-extrabold leading-[1.1] tracking-tight text-ink group-hover:text-primary transition-colors sm:text-[28px] lg:text-[34px]">
          {item.title}
        </h2>
        {item.description && (
          <p className="mt-3 line-clamp-3 text-[14px] leading-7 text-muted sm:text-[15px]">
            {item.description}
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {item.priceLabel && (
            <span className="rounded-full bg-primary-soft px-3.5 py-1.5 text-[12px] font-bold text-primary-ink">
              {item.priceLabel}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-primary">
            {viewLabel}
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              strokeWidth={2.5}
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
