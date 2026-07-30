import "server-only";
import { apiFetch } from "./client";

// ---------- Types (mirrors docs/dentexgo-admin-api-contract.md § Insights) ----------

export interface IntentCount {
  intent: string;
  count: number;
}

export interface LanguageCount {
  /** "mn", "en", or "mn-Latn" (romanized Mongolian). */
  locale: string;
  count: number;
}

export interface NeedsHumanRate {
  needsHuman: number;
  total: number;
  /** needsHuman / total, clamped to 0..1. */
  rate: number;
}

export interface FaqGap {
  conversationId: string;
  text: string;
  locale: string;
  classifiedAt: string;
}

export interface UsageDay {
  day: string;
  inbound_count: number;
  bot_out_count: number;
  admin_out_count: number;
  tokens_in: number;
  tokens_out: number;
  est_cost_usd: number;
  /** null when there were no replies that day. */
  latency_p50_ms: number | null;
  latency_p95_ms: number | null;
}

export interface InsightsSummary {
  days: number;
  intents: IntentCount[];
  languages: LanguageCount[];
  needsHumanRate: NeedsHumanRate;
  faqGaps: FaqGap[];
  usage: UsageDay[];
}

/**
 * Mongolian labels for the contract's closed set of intent values. Unknown
 * intents fall through to the raw value so a new label added upstream still
 * renders rather than disappearing.
 */
export const INTENT_LABELS_MN: Record<string, string> = {
  service_inquiry: "Үйлчилгээний асуулт",
  price_question: "Үнийн асуулт",
  hours_location: "Цаг/хаяг",
  book: "Цаг захиалга",
  insurance: "Даатгал",
  complaint: "Гомдол",
  staff_question: "Эмчийн талаар",
  small_talk: "Энгийн яриа",
  unclear: "Тодорхойгүй",
  other: "Бусад",
};

// ---------- Endpoints ----------

/**
 * Every insight in one round-trip. The contract offers this specifically for
 * clinic-admin dashboards; the five per-dimension endpoints return the same
 * payloads and are intentionally not wrapped.
 *
 * `days` defaults to 30 upstream; max 365.
 */
export async function getInsightsSummary(
  days = 30,
): Promise<InsightsSummary> {
  const data = await apiFetch<InsightsSummary>("/insights/summary", {
    searchParams: { days },
  });
  // Normalize at the boundary: a malformed 200 must not crash the dashboard's
  // server render. Every consumer can then treat these as present.
  return {
    days: data.days ?? days,
    intents: data.intents ?? [],
    languages: data.languages ?? [],
    needsHumanRate: data.needsHumanRate ?? { needsHuman: 0, total: 0, rate: 0 },
    faqGaps: data.faqGaps ?? [],
    usage: data.usage ?? [],
  };
}
