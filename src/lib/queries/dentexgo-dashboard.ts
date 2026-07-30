import "server-only";
import { DentexgoError, isConfigured } from "@/lib/dentexgo/client";
import {
  listConversations,
  type DentexgoConversation,
} from "@/lib/dentexgo/conversations";
import {
  getInsightsSummary,
  type InsightsSummary,
} from "@/lib/dentexgo/insights";

export type BotSectionError = {
  message: string;
  code: string;
};

export type BotDashboardData = {
  /** false → the clinic has no Dentexgo secret; hide both sections entirely. */
  configured: boolean;
  queue: DentexgoConversation[];
  queueError: BotSectionError | null;
  insights: InsightsSummary | null;
  insightsError: BotSectionError | null;
};

function toSectionError(e: unknown): BotSectionError {
  if (e instanceof DentexgoError) {
    if (e.code === "NO_AI_MODULE") {
      return { message: "AI модуль активгүй байна.", code: e.code };
    }
    return { message: `${e.code}: ${e.message}`, code: e.code };
  }
  return {
    message: "Dentexgo-той холбогдож чадсангүй.",
    code: "NETWORK_ERROR",
  };
}

/**
 * First-paint data for the dashboard's bot sections. Both calls are settled
 * independently: Dentexgo sits on the critical path of the clinic's home
 * screen, so one failing section must never take the other — or the booking
 * stats — down with it.
 */
export async function loadBotDashboardData(): Promise<BotDashboardData> {
  if (!isConfigured()) {
    return {
      configured: false,
      queue: [],
      queueError: null,
      insights: null,
      insightsError: null,
    };
  }

  const [queueRes, insightsRes] = await Promise.allSettled([
    listConversations({ needsHuman: true, limit: 100 }),
    getInsightsSummary(30),
  ]);

  if (queueRes.status === "rejected") {
    console.error("[loadBotDashboardData] queue failed:", queueRes.reason);
  }
  if (insightsRes.status === "rejected") {
    console.error("[loadBotDashboardData] insights failed:", insightsRes.reason);
  }

  return {
    configured: true,
    queue: queueRes.status === "fulfilled" ? queueRes.value : [],
    queueError:
      queueRes.status === "rejected" ? toSectionError(queueRes.reason) : null,
    insights: insightsRes.status === "fulfilled" ? insightsRes.value : null,
    insightsError:
      insightsRes.status === "rejected"
        ? toSectionError(insightsRes.reason)
        : null,
  };
}
