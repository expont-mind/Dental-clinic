"use client";

import { useMemo, useState } from "react";
import { Search, X, ChevronDown } from "lucide-react";

type ServiceOption = {
  id: string;
  name_mn: string;
  name_en: string;
  parent_id: string | null;
  parent_name_mn: string | null;
  department_name_mn: string | null;
};

type Group = {
  key: string;
  label: string;
  rows: ServiceOption[];
};

const UNGROUPED = "__ungrouped__";

export function ServicePicker({
  services,
  defaultIds = [],
}: {
  services: ServiceOption[];
  defaultIds?: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(defaultIds),
  );
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const groups = useMemo<Group[]>(() => {
    // Children grouped by their parent service. Parents themselves go in
    // their own group as "selectable category" so admins can flag a doctor
    // for the whole umbrella service. Standalone (parentless, childless)
    // services fall into the department group.
    const childIds = new Set(services.map((s) => s.parent_id).filter(Boolean));
    const byKey = new Map<string, Group>();

    for (const s of services) {
      if (s.parent_id && s.parent_name_mn) {
        const g = byKey.get(s.parent_id) ?? {
          key: s.parent_id,
          label: s.parent_name_mn,
          rows: [],
        };
        g.rows.push(s);
        byKey.set(s.parent_id, g);
        continue;
      }
      if (childIds.has(s.id)) {
        // Parent with children — show the parent as its own row inside its group
        const g = byKey.get(s.id) ?? {
          key: s.id,
          label: s.name_mn,
          rows: [],
        };
        g.rows.unshift(s);
        byKey.set(s.id, g);
        continue;
      }
      // True standalone — bucket by department (or single fallback group)
      const deptKey = s.department_name_mn ?? UNGROUPED;
      const g = byKey.get(deptKey) ?? {
        key: deptKey,
        label: s.department_name_mn ?? "Бусад",
        rows: [],
      };
      g.rows.push(s);
      byKey.set(deptKey, g);
    }

    return Array.from(byKey.values()).sort((a, b) =>
      a.label.localeCompare(b.label, "mn"),
    );
  }, [services]);

  const q = query.trim().toLocaleLowerCase();
  const visibleGroups = useMemo(() => {
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        rows: g.rows.filter(
          (s) =>
            `${s.name_mn} ${s.name_en}`.toLocaleLowerCase().includes(q) ||
            (s.parent_name_mn ?? "").toLocaleLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.rows.length > 0);
  }, [groups, q]);

  const selectedRows = useMemo(
    () => services.filter((s) => selected.has(s.id)),
    [services, selected],
  );

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleGroup = (group: Group) => {
    const ids = group.rows.map((r) => r.id);
    const allOn = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOn) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const toggleCollapsed = (key: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  if (services.length === 0) return null;

  return (
    <div>
      {/* Server-readable hidden inputs — the actual data the form submits. */}
      {Array.from(selected).map((id) => (
        <input key={id} type="hidden" name="service_ids" value={id} />
      ))}

      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label className="block text-[12px] font-semibold text-[#374151]">
          Үйлчилгээ
          <span className="ml-2 text-[11px] font-normal text-[#6b7280]">
            {selected.size} / {services.length} сонгосон
          </span>
        </label>
        {selected.size > 0 && (
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-[11px] font-bold text-[#6b7280] hover:text-danger"
          >
            Бүгдийг арилгах
          </button>
        )}
      </div>
      <p className="mb-3 text-[11px] text-[#6b7280]">
        Энэ эмчийн хийдэг үйлчилгээг сонгоно уу. Хайх эсвэл ангилалаар нь
        бүхэлд нь сонгож болно.
      </p>

      {/* Search */}
      <div className="relative mb-3">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9ca3af]"
          strokeWidth={2.25}
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Үйлчилгээ хайх (нэр, ангилал)"
          className="h-10 w-full rounded-full border border-line bg-white pl-9 pr-9 text-[12px] outline-none placeholder:text-[#c1c7cf] focus:border-primary"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-[#9ca3af] hover:bg-[#f3f4f6]"
            aria-label="Clear"
          >
            <X className="h-3 w-3" strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Selected chips strip — quick-remove without scrolling back to the row */}
      {selectedRows.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5 rounded-2xl border border-primary/20 bg-primary-soft/50 p-2.5">
          {selectedRows.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-primary ring-1 ring-primary/20 hover:bg-danger/10 hover:text-danger hover:ring-danger/30"
            >
              {s.name_mn}
              <X className="h-3 w-3" strokeWidth={2.5} />
            </button>
          ))}
        </div>
      )}

      {/* Groups */}
      <div className="rounded-2xl border border-line bg-[#fafbfc] p-2">
        {visibleGroups.length === 0 ? (
          <p className="p-4 text-center text-[12px] italic text-[#9ca3af]">
            Хайлтад тохирох үйлчилгээ алга.
          </p>
        ) : (
          <div className="space-y-2">
            {visibleGroups.map((g) => {
              const selCount = g.rows.filter((r) => selected.has(r.id)).length;
              const allOn = selCount === g.rows.length && g.rows.length > 0;
              const partial = selCount > 0 && !allOn;
              const isCollapsed = collapsed.has(g.key) && !q;

              return (
                <section
                  key={g.key}
                  className="overflow-hidden rounded-xl bg-white ring-1 ring-line"
                >
                  <header className="flex items-center gap-2 border-b border-line px-3 py-2">
                    <button
                      type="button"
                      onClick={() => toggleCollapsed(g.key)}
                      className="grid h-5 w-5 place-items-center rounded text-[#9ca3af] hover:bg-[#f3f4f6]"
                      aria-label="Toggle"
                    >
                      <ChevronDown
                        className={
                          "h-3.5 w-3.5 transition-transform " +
                          (isCollapsed ? "-rotate-90" : "")
                        }
                        strokeWidth={2.25}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleGroup(g)}
                      className="flex flex-1 items-center gap-2 text-left"
                    >
                      <input
                        type="checkbox"
                        checked={allOn}
                        ref={(el) => {
                          if (el) el.indeterminate = partial;
                        }}
                        onChange={() => toggleGroup(g)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-3.5 w-3.5 rounded border-line text-primary focus:ring-primary"
                      />
                      <span className="text-[12px] font-bold text-ink">
                        {g.label}
                      </span>
                      <span className="text-[10px] text-[#9ca3af]">
                        {selCount}/{g.rows.length}
                      </span>
                    </button>
                  </header>
                  {!isCollapsed && (
                    <div className="flex flex-wrap gap-1.5 p-2.5">
                      {g.rows.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggle(s.id)}
                          className={
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition-colors " +
                            (selected.has(s.id)
                              ? "border-primary bg-primary-soft text-primary"
                              : "border-line bg-white text-[#374151] hover:border-primary/40")
                          }
                        >
                          {s.name_mn}
                        </button>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
