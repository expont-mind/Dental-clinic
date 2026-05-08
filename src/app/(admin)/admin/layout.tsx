import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import Link from "next/link";
import "../../globals.css";
import { createSupabaseServer } from "@/lib/supabase/server";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lumen Admin",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Хяналт" },
  { href: "/admin/appointments", label: "Захиалгууд" },
  { href: "/admin/slots", label: "Чөлөөт цагууд" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let isLoggedIn = false;
  let userEmail: string | null = null;
  try {
    const supabase = await createSupabaseServer();
    const { data } = await supabase.auth.getUser();
    isLoggedIn = Boolean(data.user);
    userEmail = data.user?.email ?? null;
  } catch {
    isLoggedIn = false;
  }

  return (
    <html lang="mn" className={`${manrope.variable} antialiased`}>
      <body className="min-h-screen flex flex-col bg-bg text-ink font-sans">
        {isLoggedIn ? (
          <header className="border-b border-line bg-surface">
            <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-5 sm:px-8">
              <Link
                href="/admin"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <span
                  aria-hidden
                  className="grid h-7 w-7 place-items-center rounded-md bg-ink text-white text-xs"
                >
                  L
                </span>
                Lumen Admin
              </Link>
              <nav className="hidden items-center gap-1 sm:flex">
                {NAV.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    className="px-3 py-1.5 text-sm text-ink-2 hover:text-ink rounded-full hover:bg-surface-2 transition-colors"
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>
              <div className="ml-auto flex items-center gap-3">
                <span className="hidden text-xs text-muted sm:inline">
                  {userEmail}
                </span>
                <form action="/admin/api/sign-out" method="post">
                  <button
                    type="submit"
                    className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-2 hover:border-line-strong"
                  >
                    Гарах
                  </button>
                </form>
              </div>
            </div>
          </header>
        ) : null}
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}

