import Link from "next/link";
import {
  INTENT_LABELS_MN,
  type FaqGapCluster,
  type InsightsSummary,
} from "@/lib/dentexgo/insights";
import type { BotSectionError } from "@/lib/queries/dentexgo-dashboard";

const LOCALE_LABELS_MN: Record<string, string> = {
  mn: "Монгол",
  en: "Англи",
  "mn-Latn": "Монгол (латин)",
};

/**
 * Read-only rollup from GET /insights/summary. Server-rendered — insights move
 * slowly, so unlike the needs-human queue this needs no polling.
 */
export function BotInsightsStrip({
  insights,
  error,
  clusters,
}: {
  insights: InsightsSummary | null;
  error: BotSectionError | null;
  /**
   * FAQ gaps grouped by meaning. Shown instead of raw individual questions: one
   * patient's phrasing ("aprat une") makes a poor FAQ entry, while a topic with
   * a count tells staff what to write first. Empty on a clusters-only failure —
   * the rest of the strip still renders.
   */
  clusters: FaqGapCluster[];
}) {
  if (error) {
    return (
      <section className="rounded-[16px] bg-white p-5 shadow-[0_8px_20px_-14px_rgba(15,23,42,0.15)]">
        <h2 className="font-display text-[15px] font-extrabold text-[#0f172a]">
          Ботын тойм
        </h2>
        <p className="mt-2 text-[11px] text-[#9ca3af]">{error.message}</p>
      </section>
    );
  }
  if (!insights) return null;

  const ratePct = Math.round((insights.needsHumanRate.rate ?? 0) * 100);
  const topIntents = insights.intents.slice(0, 3);
  const topClusters = clusters.slice(0, 3);

  return (
    <section className="rounded-[16px] bg-white p-5 shadow-[0_8px_20px_-14px_rgba(15,23,42,0.15)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-[15px] font-extrabold text-[#0f172a]">
          Ботын тойм
        </h2>
        <span className="text-[10px] text-[#9ca3af]">
          Сүүлийн {insights.days} хоног
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {/* Needs-human rate */}
        <div>
          <p className="text-[11px] font-medium text-[#6b7280]">
            Хүн рүү шилжсэн
          </p>
          <p className="mt-1 font-display text-[22px] font-extrabold leading-none text-[#0f172a]">
            {ratePct}%
          </p>
          <p className="mt-1 text-[10px] text-[#9ca3af]">
            {insights.needsHumanRate.needsHuman} / {insights.needsHumanRate.total} яриа
          </p>
        </div>

        {/* Top intents */}
        <div>
          <p className="text-[11px] font-medium text-[#6b7280]">
            Хамгийн их асуусан
          </p>
          {topIntents.length === 0 ? (
            <p className="mt-1 text-[11px] text-[#9ca3af]">Мэдээлэл байхгүй</p>
          ) : (
            <ul className="mt-1.5 space-y-1">
              {topIntents.map((i) => (
                <li
                  key={i.intent}
                  className="flex items-baseline justify-between gap-2 text-[11px]"
                >
                  <span className="truncate text-[#374151]">
                    {INTENT_LABELS_MN[i.intent] ?? i.intent}
                  </span>
                  <span className="font-bold text-[#0f172a]">{i.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Languages */}
        <div>
          <p className="text-[11px] font-medium text-[#6b7280]">Хэл</p>
          {insights.languages.length === 0 ? (
            <p className="mt-1 text-[11px] text-[#9ca3af]">Мэдээлэл байхгүй</p>
          ) : (
            <ul className="mt-1.5 space-y-1">
              {insights.languages.map((l) => (
                <li
                  key={l.locale}
                  className="flex items-baseline justify-between gap-2 text-[11px]"
                >
                  <span className="truncate text-[#374151]">
                    {LOCALE_LABELS_MN[l.locale] ?? l.locale}
                  </span>
                  <span className="font-bold text-[#0f172a]">{l.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recurring questions the bot couldn't answer, grouped by meaning.
          Read-only here — drafting a bilingual question is a POST, so it lives
          on /admin/bot/faq-gaps where each row gets its own button. */}
      {topClusters.length > 0 && (
        <div className="mt-5 border-t border-line pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-medium text-[#6b7280]">
              Хамгийн их давтагдсан хариулагдаагүй асуулт
            </p>
            <Link
              href="/admin/bot/faq-gaps"
              className="text-[10px] font-bold text-[#0c7b6e] hover:underline"
            >
              Бүгдийг харах →
            </Link>
          </div>
          <ul className="mt-2 space-y-2">
            {topClusters.map((c) => (
              <li
                key={c.topic}
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <span className="min-w-0 flex-1 truncate text-[11px] text-[#374151]">
                  {c.topic}
                </span>
                <span className="shrink-0 rounded-full bg-[#f3f4f6] px-2 py-0.5 text-[10px] font-bold text-[#6b7280]">
                  {c.count} хүн
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
