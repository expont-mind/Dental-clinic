import Link from "next/link";
import { requireAdminUser } from "@/lib/auth";
import { listBranchesAdmin } from "@/lib/queries/branches";
import { toggleBranchActiveAction } from "@/lib/actions/branches";

export default async function AdminBranchesPage() {
  await requireAdminUser();
  const branches = await listBranchesAdmin();

  return (
    <div>
      <header className="flex items-center justify-between gap-4 border-b border-line bg-white/90 px-6 py-5 backdrop-blur sm:px-10">
        <h1 className="font-display text-[20px] font-extrabold uppercase tracking-tight text-[#0f172a] sm:text-[24px]">
          Салбарууд
        </h1>
        <Link
          href="/admin/branches/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-[12px] font-bold text-white hover:bg-primary-hover transition-colors"
        >
          + Нэмэх
        </Link>
      </header>

      <div className="space-y-4 px-6 py-8 sm:px-10 sm:py-10">
        {branches.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-[13px] text-[#6b7280]">
            Салбар бүртгэгдээгүй байна. Олон салбартай эмнэлгийн хувьд&nbsp;
            <Link
              href="/admin/branches/new"
              className="font-bold text-primary hover:underline"
            >
              шинэ салбар нэмэх
            </Link>{" "}
            хэрэгтэй. Нэг л салбартай бол энэ хэсгийг хоосон үлдээж болно —
            Dentexgo үүнийг &ldquo;нэг далд салбар&rdquo; гэж үзнэ.
          </div>
        ) : (
          <div className="overflow-hidden rounded-[22px] bg-white shadow-[0_10px_30px_-18px_rgba(15,23,42,0.18)] ring-1 ring-line">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#fafbfc] text-[11px] font-bold uppercase tracking-wider text-[#6b7280]">
                <tr>
                  <th className="px-5 py-3">Нэр</th>
                  <th className="px-5 py-3">Хаяг</th>
                  <th className="px-5 py-3">Утас</th>
                  <th className="px-5 py-3">Идэвх</th>
                  <th className="px-5 py-3 text-right">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {branches.map((b) => (
                  <tr key={b.id} className="hover:bg-[#fafbfc]">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-[#0f172a]">
                        {b.name_mn}
                      </div>
                      <div className="text-[11px] text-[#6b7280]">
                        {b.name_en} · {b.slug}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#374151]">
                      {b.address_mn ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-[#374151]">
                      {b.phone ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <form action={toggleBranchActiveAction}>
                        <input type="hidden" name="id" value={b.id} />
                        <input
                          type="hidden"
                          name="active"
                          value={(!b.is_active).toString()}
                        />
                        <button
                          type="submit"
                          className={
                            b.is_active
                              ? "inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-200"
                              : "inline-flex items-center rounded-full bg-[#f3f4f6] px-2.5 py-1 text-[11px] font-bold text-[#6b7280] hover:bg-[#e5e7eb]"
                          }
                        >
                          {b.is_active ? "Идэвхтэй" : "Идэвхгүй"}
                        </button>
                      </form>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/branches/${b.id}`}
                        className="text-[12px] font-bold text-primary hover:underline"
                      >
                        Засах →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
