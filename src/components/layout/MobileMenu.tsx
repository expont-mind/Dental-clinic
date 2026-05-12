"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type NavLink = { href: string; label: string };

type Props = {
  links: NavLink[];
  loginLabel: string;
  signupLabel: string;
  loginHref: string;
  signupHref: string;
};

export function MobileMenu({
  links,
  loginLabel,
  signupLabel,
  loginHref,
  signupHref,
}: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="grid h-10 w-10 place-items-center rounded-full text-ink-2 hover:bg-primary-soft transition-colors lg:hidden"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 6h16M4 12h16M4 18h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
          />
          <aside className="absolute left-0 top-0 flex h-full w-[280px] max-w-[80vw] flex-col bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <p className="font-display text-[14px] font-bold uppercase tracking-wider text-ink">
                Цэс
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-full bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col gap-1 overflow-y-auto px-3 py-4">
              {links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-[14px] font-semibold text-ink-2 hover:bg-primary-soft hover:text-primary transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto grid gap-2 border-t border-line px-5 py-4">
              <Link
                href={loginHref}
                onClick={() => setOpen(false)}
                className="rounded-full border border-line bg-white py-2.5 text-center text-[13px] font-bold text-ink hover:bg-primary-soft transition-colors"
              >
                {loginLabel}
              </Link>
              <Link
                href={signupHref}
                onClick={() => setOpen(false)}
                className="rounded-full bg-primary py-2.5 text-center text-[13px] font-bold text-white hover:bg-primary-hover transition-colors"
              >
                {signupLabel}
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
