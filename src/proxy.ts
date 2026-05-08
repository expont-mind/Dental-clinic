import { NextResponse, type NextRequest } from "next/server";
import { LOCALES, DEFAULT_LOCALE, hasLocale } from "@/lib/i18n/dictionaries";

const PUBLIC_FILE = /\.(.*)$/;

function pickLocale(req: NextRequest) {
  const accept = req.headers.get("accept-language") || "";
  // crude but dependency-free: scan in order, first matching locale wins
  for (const item of accept.split(",")) {
    const tag = item.split(";")[0].trim().toLowerCase();
    if (!tag) continue;
    const base = tag.split("-")[0];
    if (hasLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}

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

  // Redirect bare path to user's preferred locale
  const locale = pickLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/|api/|.*\\..*).*)"],
};

// Make tree-shaking happy if these end up unused
void LOCALES;
