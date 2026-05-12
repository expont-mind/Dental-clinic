import type { Metadata } from "next";
import { Manrope, Fraunces } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "../../globals.css";
import { cookies } from "next/headers";
import { createSupabaseServer } from "@/lib/supabase/server";
import { DEV_ADMIN } from "@/lib/auth";
import { AdminSidebarLink } from "@/components/admin/AdminSidebarLink";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dentaris Admin",
  robots: { index: false, follow: false },
};

const NAV = [
  {
    href: "/admin",
    label: "Хянах самбар",
    icon: "M3 9.5l9-7 9 7V20a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2V9.5z",
  },
  {
    href: "/admin/appointments",
    label: "Захиалгууд",
    icon: "M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM9 14h6M9 18h4",
  },
  {
    href: "/admin/slots",
    label: "Чөлөөт цагууд",
    icon: "M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  },
  {
    href: "/admin/feedback",
    label: "Санал хүсэлт",
    icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2zM8 9h8M8 13h6",
  },
  {
    href: "/admin/team",
    label: "Манай хамт олон",
    icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M18 3.1a4 4 0 0 1 0 7.8",
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let isLoggedIn = false;
  let userEmail: string | null = null;
  let isDev = false;

  const jar = await cookies();
  if (jar.get(DEV_ADMIN.cookieName)?.value === "1") {
    isLoggedIn = true;
    isDev = true;
    userEmail = DEV_ADMIN.email;
  } else {
    try {
      const supabase = await createSupabaseServer();
      const { data } = await supabase.auth.getUser();
      isLoggedIn = Boolean(data.user);
      userEmail = data.user?.email ?? null;
    } catch {
      isLoggedIn = false;
    }
  }

  const displayName = userEmail ? userEmail.split("@")[0] : "Admin";

  return (
    <html lang="mn" className={`${manrope.variable} ${fraunces.variable} antialiased`}>
      <body className="min-h-screen bg-[#f3f4f6] text-ink font-sans">
        {isLoggedIn ? (
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="bg-admin-sidebar sticky top-0 hidden h-screen w-52 shrink-0 flex-col text-white shadow-2xl lg:flex">
              {/* Brand */}
              <div className="flex justify-center px-5 pt-5">
                <Link
                  href="/admin"
                  aria-label="Dentaris Admin"
                  className="block"
                >
                  <Image
                    src="/logo.png"
                    alt="Dentaris"
                    width={180}
                    height={180}
                    className="h-20 w-auto object-contain"
                    style={{
                      filter: "brightness(0) invert(1)",
                    }}
                    priority
                  />
                </Link>
              </div>

              {/* User info */}
              <div className="mt-3 flex flex-col items-center px-5">
                <div className="relative h-14 w-14 overflow-hidden rounded-full bg-white/15 ring-2 ring-white/20">
                  <div className="grid h-full w-full place-items-center font-display text-xl font-extrabold text-white">
                    {(displayName[0] ?? "A").toUpperCase()}
                  </div>
                </div>
                <p className="mt-2 font-display text-[14px] font-bold tracking-tight">
                  {displayName}
                </p>
                <span className="mt-0.5 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                  Admin
                </span>
              </div>

              {/* Nav */}
              <nav className="mt-5 flex flex-1 flex-col gap-0.5 overflow-y-auto px-2.5">
                {NAV.map((n) => (
                  <AdminSidebarLink
                    key={n.href}
                    href={n.href}
                    label={n.label}
                    icon={n.icon}
                  />
                ))}
              </nav>

              {/* Bottom actions */}
              <div className="border-t border-white/15 px-2.5 py-3">
                <form action="/admin/api/sign-out" method="post">
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-semibold text-white/85 hover:bg-white/10 transition-colors"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                    </svg>
                    Гарах
                  </button>
                </form>
                <Link
                  href="/mn"
                  className="mt-0.5 flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-semibold text-white/85 hover:bg-white/10 transition-colors"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 12l9-9 9 9M5 10v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10" />
                  </svg>
                  Сайт руу буцах
                </Link>
              </div>
            </aside>

            {/* Main content */}
            <div className="flex min-w-0 flex-1 flex-col">
              {/* Mobile top bar (sidebar collapsed) */}
              <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-white/90 px-5 backdrop-blur lg:hidden">
                <Link href="/admin" className="flex items-center gap-2">
                  <Image
                    src="/logo.png"
                    alt="Dentaris"
                    width={32}
                    height={32}
                    className="h-7 w-7"
                  />
                  <span className="font-display text-[15px] font-bold tracking-tight">
                    Dentaris Admin
                  </span>
                </Link>
                <nav className="ml-auto flex items-center gap-1">
                  {NAV.map((n) => (
                    <Link
                      key={n.href}
                      href={n.href}
                      className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-ink-2 hover:bg-primary-soft hover:text-primary transition-colors"
                    >
                      {n.label}
                    </Link>
                  ))}
                </nav>
              </header>

              <main className="flex-1">
                {children}
                {isDev && (
                  <div className="fixed bottom-4 right-4 z-50 rounded-2xl bg-yellow-100 px-4 py-2 text-[11px] font-semibold text-yellow-900 shadow-lg ring-1 ring-yellow-300">
                    ⚠️ Dev-горимоор нэвтэрсэн
                  </div>
                )}
              </main>
            </div>
          </div>
        ) : (
          <main>{children}</main>
        )}
      </body>
    </html>
  );
}
