"use client";

import { usePathname } from "next/navigation";

/**
 * Hides the full site header on the booking flow — those routes render their
 * own minimal top bar (logo + exit) from the booking layout, for a focused,
 * app-like screen. The header is server-rendered and passed through as
 * children; this client gate only decides whether to show it.
 */
export function HeaderGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isBooking = /^\/[a-z]{2}\/book(\/|$)/.test(pathname);
  if (isBooking) return null;
  return <>{children}</>;
}
