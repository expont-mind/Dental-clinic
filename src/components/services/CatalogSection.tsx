import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ServiceCard, type ServiceCardItem } from "./ServiceCard";

type Props = {
  index: number;
  parentSlug: string;
  parentTitle: string;
  description?: string | null;
  items: ServiceCardItem[];
  lang: string;
  viewLabel: string;
  seeAllLabel: string;
};

export function CatalogSection({
  index,
  parentSlug,
  parentTitle,
  description,
  items,
  lang,
  viewLabel,
  seeAllLabel,
}: Props) {
  if (items.length === 0) return null;
  const seeAllHref = `/${lang}/services/${parentSlug}`;
  const eyebrow = `${String(index + 1).padStart(2, "0")} · ${parentTitle.toUpperCase()}`;

  return (
    <section className="mx-auto max-w-7xl px-5 pt-12 sm:px-8 sm:pt-14">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            {eyebrow}
          </p>
          {description && (
            <p className="mt-2 max-w-2xl text-[13px] leading-6 text-muted sm:text-[14px]">
              {description}
            </p>
          )}
        </div>
        <Link
          href={seeAllHref}
          className="inline-flex shrink-0 items-center gap-1.5 text-[12px] font-bold text-primary hover:text-primary-hover transition-colors"
        >
          {seeAllLabel}
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </Link>
      </header>

      {/* Vertical stack on mobile, grid on tablet+. No horizontal touch
          capture — page scrolls naturally on phones. */}
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {items.map((item, i) => (
          <li key={item.id}>
            <ServiceCard
              item={item}
              lang={lang}
              viewLabel={viewLabel}
              index={i}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
