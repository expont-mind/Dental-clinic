import type { Locale } from "@/lib/i18n/dictionaries";

type ServiceLike =
  | {
      price_cents?: number | null;
      price_text_mn?: string | null;
      price_text_en?: string | null;
      duration_min?: number | null;
      duration_text_mn?: string | null;
      duration_text_en?: string | null;
      show_duration?: boolean | null;
    }
  | null
  | undefined;

/**
 * Derive the customer-facing price and duration labels for a service, matching
 * the resolution used on the booking landing page. Prefers the admin's custom
 * text (`price_text_*` / `duration_text_*`), falls back to the numeric fields.
 * Returns `null` for either when nothing usable is set — callers must omit the
 * field rather than show a wrong or empty value. Duration honours the
 * `show_duration` admin toggle.
 */
export function serviceMeta(
  service: ServiceLike,
  lang: Locale,
): { priceLabel: string | null; durationLabel: string | null } {
  if (!service) return { priceLabel: null, durationLabel: null };

  const priceText = (
    lang === "mn" ? service.price_text_mn : service.price_text_en
  )?.trim();
  let priceLabel: string | null = priceText || null;
  if (!priceLabel && service.price_cents && service.price_cents > 0) {
    priceLabel = `${Math.round(service.price_cents / 100).toLocaleString()}₮`;
  }

  let durationLabel: string | null = null;
  if (service.show_duration !== false) {
    const durText = (
      lang === "mn" ? service.duration_text_mn : service.duration_text_en
    )?.trim();
    if (durText) {
      durationLabel = durText;
    } else if (service.duration_min && service.duration_min > 0) {
      durationLabel = `${service.duration_min} ${lang === "mn" ? "мин" : "min"}`;
    }
  }

  return { priceLabel, durationLabel };
}
