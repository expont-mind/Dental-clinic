import type { Dictionary } from "@/lib/i18n/dictionaries";

export function Footer({ dict }: { dict: Dictionary }) {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white font-display"
              >
                L
              </span>
              <span className="font-display text-lg font-medium">
                {dict.brand.name}
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-6 text-muted">
              {dict.brand.tagline}
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.18em] text-muted-2">
              {dict.contact.address_label}
            </h4>
            <p className="mt-3 text-sm leading-6 text-ink-2">
              {dict.contact.address}
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.18em] text-muted-2">
              {dict.contact.hours_label}
            </h4>
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-ink-2">
              {dict.contact.hours}
            </p>
          </div>
        </div>

        <div className="hairline my-8" />

        <div className="flex flex-col items-start justify-between gap-3 text-xs text-muted sm:flex-row sm:items-center">
          <p>{dict.footer.copyright}</p>
          <div className="flex gap-5">
            <a className="hover:text-ink transition-colors" href="#">
              {dict.footer.links.privacy}
            </a>
            <a className="hover:text-ink transition-colors" href="#">
              {dict.footer.links.terms}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
