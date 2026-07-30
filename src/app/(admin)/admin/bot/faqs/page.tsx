import { Suspense } from "react";
import Link from "next/link";
import { BotTabs } from "@/components/admin/BotTabs";
import { FaqTable } from "@/components/admin/FaqTable";
import {
  listFaqs,
  isConfigured,
  DentexgoError,
  type Faq,
} from "@/lib/dentexgo/client";

export const dynamic = "force-dynamic";

export default function AdminBotFaqsPage() {
  const configured = isConfigured();

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-white/90 px-6 py-5 backdrop-blur sm:px-10">
        <div>
          <h1 className="font-display text-[20px] font-extrabold uppercase tracking-tight text-[#0f172a] sm:text-[24px]">
            Бот
          </h1>
          <p className="mt-0.5 text-[12px] text-[#6b7280]">
            Dentexgo мэдлэгийн сан ба тохиргоо
          </p>
        </div>
        <Link
          href="/admin/bot/faqs/new"
          className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-[12px] font-semibold text-white shadow-sm hover:bg-primary-hover"
        >
          + Шинэ асуулт
        </Link>
      </header>

      <div className="space-y-6 px-6 py-8 sm:px-10 sm:py-10">
        <BotTabs active="faqs" />

        {!configured ? (
          <ConfigMissing />
        ) : (
          <Suspense fallback={<FaqTableSkeleton />}>
            <FaqList />
          </Suspense>
        )}
      </div>
    </div>
  );
}

async function FaqList() {
  let items: Faq[] = [];
  let errorMessage: string | null = null;

  try {
    items = await listFaqs();
  } catch (e) {
    console.error("[admin/bot/faqs] listFaqs failed:", e);
    errorMessage = friendlyDentexgoError(e);
  }

  if (errorMessage) {
    return (
      <p className="rounded-2xl border border-warn/30 bg-warn/10 px-4 py-3 text-[13px] text-warn">
        {errorMessage}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold text-[#6b7280]">
          Нийт{" "}
          <span className="text-[#0f172a]">{items.length}</span> асуулт хариулт
        </p>
      </div>
      <FaqTable items={items} />
    </div>
  );
}

function friendlyDentexgoError(e: unknown): string {
  // Network-level failures: host unresolvable or refused (Dentexgo not deployed
  // / not running locally). next/node surfaces these as "fetch failed" with a
  // cause carrying ENOTFOUND / ECONNREFUSED.
  const cause = (e as { cause?: { code?: string; errors?: { code?: string }[] } })?.cause;
  const codes = new Set<string>();
  if (cause?.code) codes.add(cause.code);
  for (const inner of cause?.errors ?? []) {
    if (inner?.code) codes.add(inner.code);
  }
  if (
    codes.has("ENOTFOUND") ||
    codes.has("ECONNREFUSED") ||
    codes.has("EAI_AGAIN") ||
    (e instanceof Error && e.message === "fetch failed")
  ) {
    return "Dentexgo үйлчилгээ түр холбогдохгүй байна. DENTEXGO_API_BASE_URL зөв тохируулагдсан эсэхээ шалгана уу.";
  }

  if (e instanceof DentexgoError) return `${e.code}: ${e.message}`;
  if (e instanceof Error) return e.message;
  return "Алдаа гарлаа.";
}

function ConfigMissing() {
  return (
    <p className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-[13px] text-danger">
      Dentexgo тохиргоо ороогүй байна. .env-д DENTEXGO_SHARED_SECRET болон
      CLINIC_SLUG-г оруулна уу.
    </p>
  );
}

function FaqTableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-4 w-40 animate-pulse rounded-full bg-[#eef0f6]" />
      <div className="overflow-hidden rounded-[22px] bg-white shadow-[0_10px_30px_-18px_rgba(15,23,42,0.18)]">
        <div className="border-b border-line bg-[#fafbff] px-5 py-4">
          <div className="h-3 w-24 animate-pulse rounded-full bg-[#eef0f6]" />
        </div>
        <ul className="divide-y divide-line">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="grid gap-3 px-5 py-5 sm:grid-cols-3">
              <div className="space-y-2">
                <div className="h-3 w-3/4 animate-pulse rounded-full bg-[#eef0f6]" />
                <div className="h-3 w-1/2 animate-pulse rounded-full bg-[#f3f4f9]" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-2/3 animate-pulse rounded-full bg-[#f3f4f9]" />
                <div className="h-3 w-1/2 animate-pulse rounded-full bg-[#f3f4f9]" />
              </div>
              <div className="h-3 w-24 animate-pulse rounded-full bg-[#f3f4f9]" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
