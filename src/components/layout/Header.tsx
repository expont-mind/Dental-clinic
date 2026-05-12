import Image from "next/image";
import Link from "next/link";
import { LangToggle } from "./LangToggle";
import { MobileMenu } from "./MobileMenu";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Props = { lang: string; dict: Dictionary };

type NavLink = { href: string; label: string; hasDropdown?: boolean };

const Caret = () => (
  <svg
    width="9"
    height="9"
    viewBox="0 0 24 24"
    fill="none"
    className="opacity-60"
  >
    <path
      d="M6 9l6 6 6-6"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function NavItem({ link }: { link: NavLink }) {
  return (
    <Link
      href={link.href}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-semibold text-ink-2 hover:text-primary transition-colors"
    >
      {link.label}
      {link.hasDropdown && <Caret />}
    </Link>
  );
}

export function Header({ lang, dict }: Props) {
  const leftLinks: NavLink[] = [
    { href: `/${lang}/services`, label: dict.nav.services },
    { href: `/${lang}/featured`, label: dict.nav.featured },
    { href: `/${lang}/about`, label: dict.nav.about },
  ];
  const rightLinks: NavLink[] = [
    { href: `/${lang}/doctors`, label: dict.nav.doctors },
    { href: `/${lang}/book`, label: dict.nav.book },
    { href: `/${lang}/contact`, label: dict.nav.contact },
  ];
  const mobileLinks = [...leftLinks, ...rightLinks];

  return (
    <>
      {/* Top announcement bar — hidden on mobile, shows lang + auth on tablet+ */}
      <div className="hidden bg-forest text-white sm:block">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-1 text-[11px] sm:px-8">
          <div className="shrink-0">
            <LangToggle current={lang} />
          </div>
          <p className="flex-1 truncate text-center text-white/85">
            <span className="font-semibold">Modern Care.</span>{" "}
            <span className="hidden text-white/70 md:inline">
              Genuine Connections.
            </span>{" "}
            <span className="font-semibold">Healthy Smiles for Life.</span>{" "}
            <Link
              href={`/${lang}/about`}
              className="ml-1 inline-flex items-center gap-1 font-bold text-white underline underline-offset-2 hover:text-primary"
            >
              Read More
              <span aria-hidden>→</span>
            </Link>
          </p>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href={`/${lang}/login`}
              className="text-[11px] font-semibold text-white/85 hover:text-primary transition-colors"
            >
              {dict.auth.login}
            </Link>
            <span aria-hidden className="h-3 w-px bg-white/20" />
            <Link
              href={`/${lang}/signup`}
              className="text-[11px] font-semibold text-primary hover:text-white transition-colors"
            >
              {dict.auth.signup}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile-only top strip — just lang toggle */}
      <div className="bg-forest text-white sm:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-1 text-[11px]">
          <LangToggle current={lang} />
          <Link
            href={`/${lang}/login`}
            className="text-[11px] font-semibold text-primary hover:text-white transition-colors"
          >
            {dict.auth.login}
          </Link>
        </div>
      </div>

      {/* Main header */}
      <header className="relative z-30 bg-surface">
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:h-[72px] sm:gap-6 sm:px-8 lg:grid-cols-[1fr_auto_1fr]">
          {/* Left nav (lg+) / Mobile menu trigger (< lg) */}
          <nav className="hidden items-center justify-start gap-1 lg:flex">
            {leftLinks.map((l) => (
              <NavItem key={l.label} link={l} />
            ))}
          </nav>
          <div className="lg:hidden">
            <MobileMenu
              links={mobileLinks}
              loginLabel={dict.auth.login}
              signupLabel={dict.auth.signup}
              loginHref={`/${lang}/login`}
              signupHref={`/${lang}/signup`}
            />
          </div>

          {/* Center placeholder reserves grid space for the logo tab */}
          <div
            aria-hidden
            className="mx-auto h-1 w-32 sm:w-48 lg:w-64"
          />

          {/* Right nav (lg+) / Book CTA (< lg) */}
          <nav className="hidden items-center justify-end gap-1 lg:flex">
            {rightLinks.map((l) => (
              <NavItem key={l.label} link={l} />
            ))}
          </nav>
          <Link
            href={`/${lang}/book`}
            className="inline-flex items-center justify-self-end gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-[11px] font-bold text-white hover:bg-primary-hover transition-colors sm:px-4 sm:py-2 sm:text-[12px] lg:hidden"
          >
            {dict.nav.book}
            <span aria-hidden>→</span>
          </Link>
        </div>

        {/* White tab extending below header — gentle curve, snug around the logo */}
        <Link
          href={`/${lang}`}
          aria-label={dict.brand.name}
          className="group absolute left-1/2 top-0 z-40 flex -translate-x-1/2 items-center justify-center rounded-b-[28px] bg-surface px-6 pb-2 pt-2 shadow-[0_8px_18px_-14px_rgba(10,23,20,0.18)] sm:rounded-b-[36px] sm:px-10 sm:pb-4 sm:pt-2.5"
        >
          <Image
            src="/logo.png"
            alt={dict.brand.name}
            width={360}
            height={120}
            priority
            className="h-12 w-auto sm:h-20"
          />
        </Link>
      </header>
    </>
  );
}
