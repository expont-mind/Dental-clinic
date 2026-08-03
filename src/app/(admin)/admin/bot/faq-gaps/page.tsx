import { requireAdminUser } from "@/lib/auth";
import { BotTabs } from "@/components/admin/BotTabs";
import { FaqGapClusters } from "@/components/admin/FaqGapClusters";
import { isConfigured } from "@/lib/dentexgo/client";
import { describeDentexgoError } from "@/lib/dentexgo/errors";
import {
  getFaqGapClusters,
  type FaqGapCluster,
} from "@/lib/dentexgo/insights";

/** Contract caps `limit` at 100; 50 is plenty for a review queue. */
const CLUSTER_LIMIT = 50;
const DAYS = 30;

export default async function AdminBotFaqGapsPage() {
  await requireAdminUser();

  let clusters: FaqGapCluster[] = [];
  let errorMessage: string | null = null;

  if (!isConfigured()) {
    errorMessage =
      "Dentexgo тохиргоо ороогүй байна. .env-д DENTEXGO_SHARED_SECRET болон CLINIC_SLUG-г оруулна уу.";
  } else {
    try {
      clusters = await getFaqGapClusters({ days: DAYS, limit: CLUSTER_LIMIT });
    } catch (e) {
      console.error("[admin/bot/faq-gaps] getFaqGapClusters failed:", e);
      errorMessage = describeDentexgoError(e).message;
    }
  }

  return (
    <div>
      <header className="flex items-center justify-between gap-4 border-b border-line bg-white/90 px-6 py-5 backdrop-blur sm:px-10">
        <div>
          <h1 className="font-display text-[20px] font-extrabold uppercase tracking-tight text-[#0f172a] sm:text-[24px]">
            FAQ санал
          </h1>
          <p className="mt-0.5 text-[12px] text-[#6b7280]">
            Бот хариулж чадаагүй асуултууд, утгаараа бүлэглэсэн
          </p>
        </div>
      </header>

      <div className="space-y-6 px-6 py-8 sm:px-10 sm:py-10">
        <BotTabs active="gaps" />

        <div className="rounded-[22px] bg-white p-6 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.18)] sm:p-8">
          <p className="text-[12px] leading-6 text-[#6b7280]">
            Сүүлийн {DAYS} хоногт бот хариулт олж чадаагүй асуултууд. Ижил
            утгатай асуултууд — кирилл, латин, англи бичлэг хамаарахгүй — нэг
            бүлэг болж, хэн хэдэн удаа асуусныг харуулна. Хамгийн их
            давтагдсанаас эрэмбэлсэн.
          </p>
          <p className="mt-2 text-[12px] leading-6 text-[#6b7280]">
            <strong className="font-semibold text-[#374151]">
              FAQ болгох
            </strong>{" "}
            дарахад асуултыг хоёр хэл дээр цэгцлээд шинэ FAQ-ийн форм нээгдэнэ.
            Хариултыг та бичнэ — бот хариулт байхгүйгээс л хүн рүү шилжүүлсэн.
          </p>

          {errorMessage ? (
            <p className="mt-5 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-[13px] text-danger">
              {errorMessage}
            </p>
          ) : (
            <div className="mt-5">
              <FaqGapClusters clusters={clusters} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
