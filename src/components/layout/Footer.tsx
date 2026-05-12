import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const SOCIAL_ICONS = [
  // Facebook
  "M14 9V7c0-1 .5-1.5 1.5-1.5H17V3h-2.5C12 3 10.5 4.5 10.5 7v2H8v3h2.5v9h3v-9H17l.5-3H13.5z",
  // X / Twitter
  "M4 4l8.5 11L20 4M4 20l7-9M13 11l7 9",
  // Pinterest
  "M12 3a9 9 0 0 0-3.3 17.4c-.1-.7-.2-1.8 0-2.6l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.5 1.8-2.5.9 0 1.3.7 1.3 1.5 0 .9-.6 2.3-.9 3.6-.3 1 .6 1.9 1.6 1.9 1.9 0 3.4-2 3.4-5 0-2.6-1.9-4.5-4.5-4.5a4.7 4.7 0 0 0-4.9 4.7c0 .9.4 1.9.8 2.4.1.1.1.2.1.3l-.3 1.2c0 .2-.2.2-.4.1-1.4-.7-2.3-2.7-2.3-4.4 0-3.5 2.6-6.8 7.4-6.8 3.9 0 6.9 2.8 6.9 6.5 0 3.9-2.4 7-5.8 7-1.1 0-2.2-.6-2.6-1.3l-.7 2.7c-.3 1-.9 2.2-1.4 3a9 9 0 1 0 3.3-17.4z",
  // Instagram
  "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm5-1.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z",
  // YouTube
  "M22 12s0-3.5-.5-5c-.3-1-1-1.7-2-2C17.5 4.5 12 4.5 12 4.5s-5.5 0-7.5.5c-1 .3-1.7 1-2 2C2 8.5 2 12 2 12s0 3.5.5 5c.3 1 1 1.7 2 2 2 .5 7.5.5 7.5.5s5.5 0 7.5-.5c1-.3 1.7-1 2-2 .5-1.5.5-5 .5-5zM10 9l5 3-5 3z",
];

export function Footer({
  dict,
  lang,
}: {
  dict: Dictionary;
  lang?: string;
}) {
  const langPrefix = lang ? `/${lang}` : "";
  const companyLinks = [
    { href: `${langPrefix}/about`, label: dict.nav.about },
    { href: `${langPrefix}/services`, label: dict.nav.services },
    { href: `${langPrefix}/doctors`, label: dict.nav.doctors },
    { href: `${langPrefix}/book`, label: dict.nav.book },
    { href: `${langPrefix}/contact`, label: dict.nav.contact },
  ];
  const items = [...dict.footer.marquee_items, ...dict.footer.marquee_items];

  return (
    <footer className="mt-16">
      {/* Marquee strip */}
      <div className="overflow-hidden bg-primary text-primary-ink">
        <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap py-3">
          {items.map((label, i) => (
            <span
              key={`${label}-${i}`}
              className="mx-6 inline-flex items-center gap-6 text-[15px] font-bold tracking-tight"
            >
              {label}
              <span aria-hidden className="text-primary-ink/70">
                ✱
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div className="bg-forest text-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
          <div className="grid gap-10 md:grid-cols-12">
            {/* Brand */}
            <div className="md:col-span-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-ink">
                  <Image
                    src="/logo.png"
                    alt={dict.brand.name}
                    width={36}
                    height={36}
                    className="h-7 w-7 object-contain"
                  />
                </span>
                <p className="font-display text-[18px] font-bold tracking-tight">
                  {dict.brand.name}
                </p>
              </div>
              <p className="mt-4 max-w-xs text-[13px] leading-6 text-white/65">
                {dict.footer.intro}
              </p>
              {/* Social */}
              <ul className="mt-6 flex items-center gap-2.5">
                {SOCIAL_ICONS.map((path, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="grid h-9 w-9 place-items-center rounded-full bg-white/8 text-white/80 ring-1 ring-white/10 hover:bg-primary hover:text-primary-ink hover:ring-primary transition-colors"
                      aria-label={`Social ${i + 1}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d={path}
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="md:col-span-2">
              <h4 className="text-[14px] font-bold tracking-tight">
                {dict.footer.company_label}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {companyLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[13px] text-white/65 hover:text-primary transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="md:col-span-3">
              <h4 className="text-[14px] font-bold tracking-tight">
                {dict.contact.title}
              </h4>
              <ul className="mt-4 space-y-2.5 text-[13px] text-white/65">
                <li>{dict.contact.phone}</li>
                <li>{dict.contact.email}</li>
                <li className="leading-6">{dict.contact.address}</li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="md:col-span-3">
              <h4 className="text-[14px] font-bold tracking-tight">
                {dict.footer.newsletter_label}
              </h4>
              <form className="mt-4 flex items-center gap-1 rounded-full bg-white/8 p-1 ring-1 ring-white/10">
                <input
                  type="email"
                  placeholder={dict.footer.newsletter_placeholder}
                  className="min-w-0 flex-1 bg-transparent px-4 py-2 text-[13px] text-white placeholder:text-white/45 outline-none"
                />
                <button
                  type="submit"
                  aria-label={dict.footer.newsletter_submit}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-ink hover:bg-primary-hover transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12h14m-6-6 6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </form>
            </div>
          </div>

          <div className="mt-12 h-px w-full bg-white/10" />

          <div className="mt-6 flex flex-col items-start justify-between gap-3 text-[12px] text-white/55 sm:flex-row sm:items-center">
            <p>
              Copyright © 2026{" "}
              <span className="text-primary">{dict.brand.name}</span>.{" "}
              {dict.footer.copyright.split(".").slice(1).join(".").trim()}
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary transition-colors">
                {dict.footer.links.terms}
              </a>
              <span aria-hidden>|</span>
              <a href="#" className="hover:text-primary transition-colors">
                {dict.footer.links.privacy}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
