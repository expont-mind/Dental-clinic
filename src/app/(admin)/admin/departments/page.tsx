import Link from "next/link";
import { requireAdminUser } from "@/lib/auth";
import {
  listDepartmentsAdmin,
  countDepartmentDependents,
} from "@/lib/queries/admin";
import {
  toggleDepartmentActiveAction,
  deleteDepartmentAction,
} from "@/lib/actions/departments";

export default async function AdminDepartmentsPage() {
  await requireAdminUser();
  const [departments, dependents] = await Promise.all([
    listDepartmentsAdmin(),
    countDepartmentDependents(),
  ]);

  return (
    <div>
      <header className="flex items-center justify-between gap-4 border-b border-line bg-white/90 px-6 py-5 backdrop-blur sm:px-10">
        <div>
          <h1 className="font-display text-[20px] font-extrabold uppercase tracking-tight text-[#0f172a] sm:text-[24px]">
            Тасгууд
          </h1>
          <p className="mt-0.5 text-[11px] text-[#6b7280]">
            Эмчилгээний тасгууд — эмч болон үйлчилгээ энд хамаарна.
          </p>
        </div>
        <Link
          href="/admin/departments/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-[12px] font-bold text-white hover:bg-primary-hover transition-colors"
        >
          + Нэмэх
        </Link>
      </header>

      <div className="px-6 py-8 sm:px-10 sm:py-10">
        {departments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-[13px] text-[#6b7280]">
            Тасаг алга. + Нэмэх дээр дарж эхний тасгийг үүсгэнэ үү.
          </div>
        ) : (
          <div className="overflow-hidden rounded-[22px] bg-white shadow-[0_10px_30px_-18px_rgba(15,23,42,0.18)] ring-1 ring-line">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#fafbfc] text-[11px] font-bold uppercase tracking-wider text-[#6b7280]">
                <tr>
                  <th className="px-5 py-3">Нэр</th>
                  <th className="px-5 py-3">Эмч</th>
                  <th className="px-5 py-3">Үйлчилгээ</th>
                  <th className="px-5 py-3">Sort</th>
                  <th className="px-5 py-3">Төлөв</th>
                  <th className="px-5 py-3 text-right">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {departments.map((d) => {
                  const dep = dependents.get(d.id) ?? {
                    doctors: 0,
                    services: 0,
                  };
                  const canDelete = dep.doctors === 0 && dep.services === 0;
                  return (
                    <tr key={d.id} className="hover:bg-[#fafbfc]">
                      <td className="px-5 py-3">
                        <div className="font-semibold text-[#0f172a]">
                          {d.name_mn}
                        </div>
                        <div className="text-[11px] text-[#6b7280]">
                          {d.name_en} · {d.slug}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[#374151]">
                        {dep.doctors > 0 ? (
                          <span className="font-semibold">{dep.doctors}</span>
                        ) : (
                          <span className="text-[#9ca3af]">0</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-[#374151]">
                        {dep.services > 0 ? (
                          <span className="font-semibold">{dep.services}</span>
                        ) : (
                          <span className="text-[#9ca3af]">0</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-[#374151]">
                        {d.sort_order}
                      </td>
                      <td className="px-5 py-3">
                        <form action={toggleDepartmentActiveAction}>
                          <input type="hidden" name="id" value={d.id} />
                          <input
                            type="hidden"
                            name="active"
                            value={(!d.is_active).toString()}
                          />
                          <button
                            type="submit"
                            className={
                              d.is_active
                                ? "inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800 hover:bg-emerald-200"
                                : "inline-flex items-center rounded-full bg-[#f3f4f6] px-2.5 py-1 text-[10px] font-bold text-[#6b7280] hover:bg-[#e5e7eb]"
                            }
                          >
                            {d.is_active ? "Идэвхтэй" : "Идэвхгүй"}
                          </button>
                        </form>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/admin/departments/${d.id}`}
                            className="text-[12px] font-bold text-primary hover:underline"
                          >
                            Засах →
                          </Link>
                          <form
                            action={async (fd) => {
                              "use server";
                              await deleteDepartmentAction(fd);
                            }}
                          >
                            <input type="hidden" name="id" value={d.id} />
                            <button
                              type="submit"
                              disabled={!canDelete}
                              title={
                                canDelete
                                  ? "Тасгийг устгах"
                                  : "Холбоотой эмч / үйлчилгээ байгаа учир устгах боломжгүй"
                              }
                              className="text-[12px] font-semibold text-rose-600 hover:underline disabled:cursor-not-allowed disabled:text-[#9ca3af] disabled:no-underline"
                            >
                              Устгах
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
