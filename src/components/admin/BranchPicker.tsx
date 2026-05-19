"use client";

type BranchOption = { id: string; name_mn: string; name_en: string };

export function BranchPicker({
  branches,
  defaultIds = [],
  name = "branch_ids",
  label = "Салбарууд",
  hint = "Хоосон үлдээвэл бүх салбарт хүчинтэй. Зарим салбарт хязгаарлахын тулд тэдгээрийг сонгоно уу.",
}: {
  branches: BranchOption[];
  defaultIds?: string[];
  name?: string;
  label?: string;
  hint?: string;
}) {
  if (branches.length === 0) return null;
  const selected = new Set(defaultIds);

  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-semibold text-[#374151]">
        {label}
      </label>
      <p className="mb-2 text-[11px] text-[#6b7280]">{hint}</p>
      <div className="flex flex-wrap gap-2 rounded-2xl border border-line bg-[#fafbfc] p-3">
        {branches.map((b) => (
          <label
            key={b.id}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-[12px] font-semibold text-[#0f172a] has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:checked]:text-primary cursor-pointer"
          >
            <input
              type="checkbox"
              name={name}
              value={b.id}
              defaultChecked={selected.has(b.id)}
              className="h-3.5 w-3.5 rounded border-line text-primary focus:ring-primary"
            />
            <span>{b.name_mn}</span>
            <span className="text-[10px] font-normal text-[#9ca3af]">/ {b.name_en}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
