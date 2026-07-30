import Link from "next/link";
import { deleteFaqAction } from "@/lib/actions/bot";
import type { Faq } from "@/lib/dentexgo/client";

export function FaqTable({ items }: { items: Faq[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-[22px] border border-dashed border-line bg-white px-6 py-16 text-center shadow-[0_10px_30px_-18px_rgba(15,23,42,0.18)]">
        <p className="font-display text-[16px] font-extrabold text-[#0f172a]">
          Асуулт хариулт алга байна
        </p>
        <p className="mt-2 text-[13px] text-[#6b7280]">
          Эхний асуулт хариултаа нэмж, ботын мэдлэгийн санг эхлүүлнэ үү.
        </p>
        <Link
          href="/admin/bot/faqs/new"
          className="mt-5 inline-flex h-10 items-center rounded-full bg-primary px-5 text-[12px] font-semibold text-white shadow-sm hover:bg-primary-hover"
        >
          + Эхний асуулт нэмэх
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[22px] bg-white shadow-[0_10px_30px_-18px_rgba(15,23,42,0.18)]">
      <table className="w-full min-w-[720px] text-left text-[13px]">
        <thead className="border-b border-line bg-[#fafbff] text-[10px] uppercase tracking-[0.18em] text-[#6b7280]">
          <tr>
            <th className="px-5 py-4 font-bold">Монгол</th>
            <th className="px-5 py-4 font-bold">Англи</th>
            <th className="px-5 py-4 font-bold">Дугаар</th>
            <th className="px-5 py-4" />
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((f) => (
            <tr key={f.source_id} className="align-top hover:bg-[#fafbff]">
              <td className="px-5 py-4">
                <p className="font-semibold text-[#0f172a]">{f.q_mn}</p>
                <p className="mt-1 max-w-prose whitespace-pre-line text-[12px] text-[#6b7280] line-clamp-3">
                  {f.a_mn}
                </p>
              </td>
              <td className="px-5 py-4 align-top">
                <p className="text-[12px] text-[#374151]">
                  {f.q_en || (
                    <span className="italic text-[#9ca3af]">Орчуулга алга</span>
                  )}
                </p>
                <p className="mt-1 max-w-prose whitespace-pre-line text-[11px] text-[#9ca3af] line-clamp-3">
                  {f.a_en}
                </p>
              </td>
              <td className="px-5 py-4 font-mono text-[11px] text-[#9ca3af]">
                {f.source_id}
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                  <Link
                    href={`/admin/bot/faqs/${encodeURIComponent(f.source_id)}`}
                    className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-[#0f172a] ring-1 ring-line hover:bg-[#fafbff]"
                  >
                    Засах
                  </Link>
                  <form action={deleteFaqAction}>
                    <input type="hidden" name="rowId" value={f.source_id} />
                    <button
                      type="submit"
                      className="rounded-full bg-rose-50 px-3 py-1.5 text-[11px] font-semibold text-rose-600 ring-1 ring-rose-200 hover:bg-rose-100"
                    >
                      Устгах
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
