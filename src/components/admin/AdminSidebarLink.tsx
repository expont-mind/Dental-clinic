"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminSidebarLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  const pathname = usePathname() ?? "";
  const isActive =
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={
        "flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-semibold transition-colors " +
        (isActive
          ? "bg-white text-[#0c7b6e] shadow-md"
          : "text-white/85 hover:bg-white/10")
      }
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
        <path d={icon} />
      </svg>
      {label}
    </Link>
  );
}
