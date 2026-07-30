"use client";

import { usePathname } from "next/navigation";

/**
 * Hides the site footer on the booking flow so those steps read as a focused,
 * app-like screen (no tall marquee footer crowding the viewport). The footer is
 * rendered on the server and passed through as children; this client gate only
 * decides whether to show it, based on the current path.
 */
export function FooterGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isBooking = /^\/[a-z]{2}\/book(\/|$)/.test(pathname);
  if (isBooking) return null;
  return <>{children}</>;
}
