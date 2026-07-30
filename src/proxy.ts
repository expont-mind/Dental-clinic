import { NextResponse, type NextRequest } from "next/server";
import { LOCALES, DEFAULT_LOCALE, hasLocale } from "@/lib/i18n/dictionaries";

const PUBLIC_FILE = /\.(.*)$/;

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip Next internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return;
  }

  // Already locale-prefixed?
  const segs = pathname.split("/").filter(Boolean);
  if (segs.length > 0 && hasLocale(segs[0])) return;

  // Admin routes don't need locale (admin panel is single-language Mongolian).
  // We keep them un-prefixed; auth gate is handled inside the admin layout.
  if (segs[0] === "admin") return;

  // Default every un-prefixed path to Mongolian — the clinic's audience is
  // overwhelmingly Mongolian, so we ignore the browser's Accept-Language
  // (which sent English browsers to /en). English stays reachable via the
  // in-page language toggle.
  const url = req.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/|api/|.*\\..*).*)"],
};

// Make tree-shaking happy if these end up unused
void LOCALES;
