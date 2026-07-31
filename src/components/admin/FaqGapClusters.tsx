"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { draftFaqQuestionAction } from "@/lib/actions/dentexgo-insights";
import type { FaqGapCluster } from "@/lib/dentexgo/insights";

const LOCALE_LABELS_MN: Record<string, string> = {
  mn: "Монгол",
  en: "Англи",
  "mn-Latn": "Монгол (латин)",
};

/**
 * Recurring questions the bot couldn't answer, grouped by meaning.
 *
 * "FAQ болгох" drafts a clean bilingual question from the cluster's phrasings
 * and opens the new-FAQ form pre-filled with it. That round-trip is a POST
 * upstream, so it happens per click — never for every row on load. The draft is
 * the question only: the bot escalated because it had no answer, so staff write
 * `aMn`/`aEn` themselves.
 */
export function FaqGapClusters({ clusters }: { clusters: FaqGapCluster[] }) {
  const router = useRouter();
  const [busyTopic, setBusyTopic] = useState<string | null>(null);

  async function handleDraft(cluster: FaqGapCluster) {
    setBusyTopic(cluster.topic);
    // The topic itself is the centroid phrasing, so include it alongside the
    // examples — it is usually the cleanest wording in the group.
    const questions = [cluster.topic, ...cluster.examples];
    const res = await draftFaqQuestionAction(questions);
    setBusyTopic(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    const params = new URLSearchParams({
      qMn: res.draft.qMn,
      qEn: res.draft.qEn,
    });
    router.push(`/admin/bot/faqs/new?${params.toString()}`);
  }

  if (clusters.length === 0) {
    return (
      <p className="text-[13px] text-[#6b7280]">
        Хариулагдаагүй давтагдсан асуулт олдсонгүй. Бот бүх асуултад хариулж
        байна.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {clusters.map((c) => {
        const busy = busyTopic === c.topic;
        // The centroid is already shown as the topic; repeating it in the
        // examples line would just look like a duplicate.
        const otherPhrasings = c.examples.filter((e) => e !== c.topic);
        return (
          <li
            key={c.topic}
            className="rounded-[14px] border border-line px-4 py-3.5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[13px] font-bold text-[#0f172a]">
                    {c.topic}
                  </p>
                  <span className="shrink-0 rounded-full bg-[#f3f4f6] px-2 py-0.5 text-[10px] font-bold text-[#6b7280]">
                    {c.count} хүн асуусан
                  </span>
                  <span className="shrink-0 text-[10px] text-[#6b7280]">
                    {LOCALE_LABELS_MN[c.locale] ?? c.locale}
                  </span>
                </div>
                {otherPhrasings.length > 0 && (
                  <p className="mt-1.5 text-[11px] leading-5 text-[#6b7280]">
                    Бусад хэлбэр: {otherPhrasings.join(" · ")}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => void handleDraft(c)}
                disabled={busy}
                className="inline-flex min-h-9 shrink-0 cursor-pointer items-center rounded-full bg-[#0f172a] px-3.5 py-2 text-[11px] font-bold text-white transition-colors hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c7b6e] focus-visible:ring-offset-2"
              >
                {busy ? "Бэлтгэж байна…" : "FAQ болгох"}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
