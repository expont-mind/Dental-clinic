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
 * The same escalated questions as `faqGaps`, grouped by meaning — so nine
 * people asking about braces pricing in nine wordings collapse into one row
 * with `count: 9`. Embedding-based, so Cyrillic, romanized Mongolian
 * (`mn-Latn`) and English phrasings of one question land in the same cluster.
 */
export interface FaqGapCluster {
  /** Representative question — the member closest to the cluster centroid. */
  topic: string;
  /** How many escalated questions fell into this topic. */
  count: number;
  /** Up to 5 distinct member phrasings. Feed these to `draftFaqQuestion`. */
  examples: string[];
  /** The conversations behind the cluster, for drill-in. */
  conversationIds: string[];
  /** Dominant locale in the cluster. */
  locale: string;
}

/** Normalized bilingual FAQ question. No answer — see `draftFaqQuestion`. */
export interface FaqDraft {
  qMn: string;
  qEn: string;
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

/**
 * FAQ gaps grouped by meaning, most frequent first (the API sorts by `count`
 * desc; the order is preserved). Deliberately a separate call: `/insights/summary`
 * predates this endpoint and does not carry clusters.
 *
 * `days` defaults to 30 upstream (max 365), `limit` to 20 (max 100).
 */
export async function getFaqGapClusters(
  opts: { days?: number; limit?: number } = {},
): Promise<FaqGapCluster[]> {
  const data = await apiFetch<{ clusters: FaqGapCluster[] }>(
    "/insights/faq-gaps/clusters",
    { searchParams: { days: opts.days, limit: opts.limit } },
  );
  // Normalize: a malformed 200 must not crash a server render.
  return (data.clusters ?? []).map((c) => ({
    topic: c.topic,
    count: c.count ?? 0,
    examples: c.examples ?? [],
    conversationIds: c.conversationIds ?? [],
    locale: c.locale,
  }));
}

/**
 * Turn a cluster's phrasings into one clean bilingual question.
 *
 * Returns the QUESTION only. The bot escalated precisely because it had no
 * answer, so staff supply `aMn`/`aEn` before POSTing to `/faqs`. Called on
 * demand from the FAQ-gaps page — never for every cluster on page load, since
 * each call is a POST upstream.
 *
 * The contract accepts 1–20 questions, each ≤1000 chars.
 */
export async function draftFaqQuestion(
  questions: string[],
): Promise<FaqDraft> {
  const data = await apiFetch<{ draft: FaqDraft }>(
    "/insights/faq-gaps/draft",
    { method: "POST", body: JSON.stringify({ questions }) },
  );
  return data.draft;
}
