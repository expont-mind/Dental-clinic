import Link from "next/link";
import { LangToggle } from "./LangToggle";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Props = { lang: string; dict: Dictionary };

export function Header({ lang, dict }: Props) {
  const links = [
    { href: `/${lang}`, label: dict.nav.home },
    { href: `/${lang}/about`, label: dict.nav.about },
    { href: `/${lang}/doctors`, label: dict.nav.doctors },
    { href: `/${lang}/services`, label: dict.nav.services },
    { href: `/${lang}/contact`, label: dict.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-bg/80 border-b border-line">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5 sm:px-8">
        <Link href={`/${lang}`} className="flex items-center gap-2 group">
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white font-display font-medium"
            style={{ fontFeatureSettings: '"ss01"' }}
          >
            L
          </span>
          <span className="font-display text-[17px] font-medium tracking-tight">
            {dict.brand.name}
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 text-sm text-ink-2 hover:text-ink rounded-full hover:bg-surface-2 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <LangToggle current={lang} />
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href={`/${lang}/book`}>{dict.nav.book}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
