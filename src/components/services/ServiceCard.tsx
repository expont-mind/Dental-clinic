import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export type ServiceCardItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  priceLabel: string | null;
  imageUrl: string;
  category: string | null;
  isFeatured: boolean;
};

export function ServiceCard({
  item,
  lang,
  viewLabel,
  index,
}: {
  item: ServiceCardItem;
  lang: string;
  viewLabel: string;
  index: number;
}) {
  return (
    <Link
      href={`/${lang}/services/${item.slug}`}
      className="reveal group block h-full overflow-hidden rounded-[24px] bg-surface ring-1 ring-line transition-all duration-300 hover:-translate-y-1 hover:ring-primary/40 hover:shadow-[0_20px_40px_-20px_rgba(26,132,120,0.25)]"
      style={{ ["--reveal-delay" as string]: `${Math.min(index, 8) * 60}ms` }}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-primary-soft">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"
        />
        {item.priceLabel && (
          <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-primary shadow-sm backdrop-blur">
            {item.priceLabel}
          </span>
        )}
      </div>

      <div className="p-5 sm:p-6">
        <h2 className="font-display text-[18px] font-bold leading-tight tracking-tight text-ink group-hover:text-primary transition-colors sm:text-[20px]">
          {item.title}
        </h2>
        {item.description && (
          <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-muted">
            {item.description}
          </p>
        )}
        <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold text-primary">
          {viewLabel}
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
            strokeWidth={2.5}
          />
        </span>
      </div>
    </Link>
  );
}
