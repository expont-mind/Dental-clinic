import Image from "next/image";
import Link from "next/link";

/**
 * Booking runs as a focused, app-like flow: the full site header/footer are
 * hidden (see HeaderGate/FooterGate) and replaced with this minimal top bar —
 * just the logo and an exit button back to the home page.
 */
export default async function BookLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const isMn = lang === "mn";

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-surface/90 px-4 py-2.5 backdrop-blur sm:px-6">
        <Link href={`/${lang}`} aria-label="Dentaris" className="shrink-0">
          <Image
            src="/logo.png"
            alt="Dentaris"
            width={160}
            height={52}
            priority
            className="h-8 w-auto sm:h-9"
          />
        </Link>
        <Link
          href={`/${lang}`}
          aria-label={isMn ? "Гарах" : "Exit"}
          className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </Link>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
