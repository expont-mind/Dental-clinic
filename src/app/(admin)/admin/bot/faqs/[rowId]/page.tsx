import Link from "next/link";
import { notFound } from "next/navigation";
import { BotTabs } from "@/components/admin/BotTabs";
import { FaqForm } from "@/components/admin/FaqForm";
import { listFaqs } from "@/lib/dentexgo/client";

export default async function AdminBotFaqEditPage({
  params,
}: {
  params: Promise<{ rowId: string }>;
}) {
  const { rowId } = await params;

  // The API has no GET-single endpoint — listFaqs() is the only read path.
  const all = await listFaqs();
  const existing = all.find((f) => f.source_id === rowId);
  if (!existing) notFound();

  return (
    <div>
      <header className="flex items-center gap-4 border-b border-line bg-white/90 px-6 py-5 backdrop-blur sm:px-10">
        <Link
          href="/admin/bot/faqs"
          className="text-[12px] font-semibold text-[#6b7280] hover:text-[#0f172a]"
        >
          ← Буцах
        </Link>
        <h1 className="font-display text-[20px] font-extrabold uppercase tracking-tight text-[#0f172a] sm:text-[24px]">
          FAQ засах
        </h1>
      </header>

      <div className="space-y-6 px-6 py-8 sm:px-10 sm:py-10">
        <BotTabs active="faqs" />

        <div className="rounded-[22px] bg-white p-6 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.18)] sm:p-8">
          <FaqForm existing={existing} />
        </div>
      </div>
    </div>
  );
}
