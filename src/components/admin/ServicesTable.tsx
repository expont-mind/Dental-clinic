"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { toggleServiceActiveAction } from "@/lib/actions/services";

export type AdminServiceRow = {
  id: string;
  slug: string;
  name_mn: string;
  name_en: string;
  department_mn: string;
  parent_id: string | null;
  parent_name_mn: string | null;
  price_cents: number | null;
  duration_min: number | null;
  is_active: boolean;
  itdoctor_service_id: number | null;
};

type Filter = "all" | "parent" | "child" | "inactive" | "external";

type Group = {
  parent: AdminServiceRow;
  children: AdminServiceRow[];
};

function formatMnt(cents: number | null): string {
  if (cents == null) return "—";
  return new Intl.NumberFormat("mn-MN").format(cents / 100) + " ₮";
}

function rowMatchesFilter(s: AdminServiceRow, filter: Filter): boolean {
  switch (filter) {
    case "parent":
      return s.parent_id === null;
    case "child":
      return s.parent_id !== null;
    case "inactive":
      return !s.is_active;
    case "external":
      return s.itdoctor_service_id != null;
    default:
      return true;
  }
}

function rowMatchesQuery(s: AdminServiceRow, q: string): boolean {
  if (!q) return true;
  return `${s.name_mn} ${s.name_en} ${s.slug} ${s.department_mn}`
    .toLocaleLowerCase()
    .includes(q);
}

export function ServicesTable({ rows }: { rows: AdminServiceRow[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  // Build the parent/children tree once from the flat row list.
  const tree = useMemo<Group[]>(() => {
    const parents = rows.filter((r) => r.parent_id === null);
    const childrenByParent = new Map<string, AdminServiceRow[]>();
    for (const r of rows) {
      if (r.parent_id) {
        const list = childrenByParent.get(r.parent_id) ?? [];
        list.push(r);
        childrenByParent.set(r.parent_id, list);
      }
    }
    return parents.map((p) => ({
      parent: p,
      children: childrenByParent.get(p.id) ?? [],
    }));
  }, [rows]);

  // Apply chip + search filters across the tree. A group surfaces if its
  // parent OR any child matches. When a child filter is active, the parent
  // header still renders (as a category label) but its own "parent row"
  // doesn't unless it independently matches.
  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return tree
      .map((g) => {
        const parentMatches =
          rowMatchesFilter(g.parent, filter) && rowMatchesQuery(g.parent, q);
        const children = g.children.filter(
          (c) => rowMatchesFilter(c, filter) && rowMatchesQuery(c, q),
        );
        return { ...g, _showParent: parentMatches, _children: children };
      })
      .filter((g) => g._showParent || g._children.length > 0);
  }, [tree, filter, query]);

  const counts = useMemo(
    () => ({
      all: rows.length,
      parent: rows.filter((s) => s.parent_id === null).length,
      child: rows.filter((s) => s.parent_id !== null).length,
      inactive: rows.filter((s) => !s.is_active).length,
      external: rows.filter((s) => s.itdoctor_service_id != null).length,
    }),
    [rows],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Chip
            label={`Бүгд · ${counts.all}`}
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          <Chip
            label={`Эцэг · ${counts.parent}`}
            active={filter === "parent"}
            onClick={() => setFilter("parent")}
          />
          <Chip
            label={`Хүүхэд · ${counts.child}`}
            active={filter === "child"}
            onClick={() => setFilter("child")}
          />
          <Chip
            label={`Идэвхгүй · ${counts.inactive}`}
            active={filter === "inactive"}
            onClick={() => setFilter("inactive")}
          />
          <Chip
            label={`Захиалга боломжтой · ${counts.external}`}
            active={filter === "external"}
            onClick={() => setFilter("external")}
          />
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9ca3af]"
            strokeWidth={2.25}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Үйлчилгээ хайх (нэр, slug, ангилал)"
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
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-[13px] text-[#6b7280]">
          Хайлтад тохирох үйлчилгээ алга.
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((g) => (
            <CategoryCard
              key={g.parent.id}
              parent={g.parent}
              showParentRow={g._showParent}
              rows={g._children}
              totalChildren={g.children.length}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryCard({
  parent,
  rows,
  showParentRow,
  totalChildren,
}: {
  parent: AdminServiceRow;
  rows: AdminServiceRow[];
  showParentRow: boolean;
  totalChildren: number;
}) {
  return (
    <section className="overflow-hidden rounded-[22px] bg-white shadow-[0_10px_30px_-18px_rgba(15,23,42,0.18)] ring-1 ring-line">
      {/* Section header — the parent acts as the category label */}
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line bg-[#fafbfc] px-5 py-3.5">
        <div className="flex items-baseline gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            Ангилал
          </span>
          <h3 className="font-display text-[15px] font-bold tracking-tight text-ink">
            {parent.name_mn}
          </h3>
          <span className="text-[11px] text-[#9ca3af]">
            {parent.name_en} · {parent.slug}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold text-[#6b7280]">
            {totalChildren > 0
              ? `${totalChildren} үйлчилгээ`
              : "Дотроо үйлчилгээгүй"}
          </span>
          <Link
            href={`/admin/services/${parent.id}`}
            className="text-[11px] font-bold text-primary hover:underline"
          >
            Засах →
          </Link>
        </div>
      </header>

      <table className="w-full text-left text-[13px]">
        <thead className="bg-white text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
          <tr>
            <th className="px-5 py-2.5">Үйлчилгээ</th>
            <th className="px-5 py-2.5">Тасаг</th>
            <th className="px-5 py-2.5">Үнэ</th>
            <th className="px-5 py-2.5">Үргэлжлэл</th>
            <th className="px-5 py-2.5">Төлөв</th>
            <th className="px-5 py-2.5 text-right">Үйлдэл</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line/70">
          {showParentRow && <Row row={parent} isParent />}
          {rows.map((c) => (
            <Row key={c.id} row={c} isParent={false} />
          ))}
          {!showParentRow && rows.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-5 py-6 text-center text-[12px] italic text-[#9ca3af]"
              >
                Энэ ангилалд тохирох үйлчилгээ алга.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

function Row({ row, isParent }: { row: AdminServiceRow; isParent: boolean }) {
  return (
    <tr className="hover:bg-[#fafbfc]">
      <td className="px-5 py-3">
        <div className="flex items-center gap-2">
          {!isParent && (
            <span aria-hidden className="text-[#cbd5e1]">
              └
            </span>
          )}
          <div>
            <div className="font-semibold text-[#0f172a]">{row.name_mn}</div>
            <div className="text-[11px] text-[#6b7280]">
              {row.name_en} · {row.slug}
            </div>
          </div>
        </div>
      </td>
      <td className="px-5 py-3 text-[12px] text-[#374151]">
        {row.department_mn || <span className="text-[#9ca3af]">—</span>}
      </td>
      <td className="px-5 py-3 text-[#374151]">{formatMnt(row.price_cents)}</td>
      <td className="px-5 py-3 text-[#374151]">
        {row.duration_min ? `${row.duration_min} мин` : "—"}
      </td>
      <td className="px-5 py-3">
        <div className="flex flex-wrap gap-1.5">
          <form action={toggleServiceActiveAction}>
            <input type="hidden" name="id" value={row.id} />
            <input
              type="hidden"
              name="active"
              value={(!row.is_active).toString()}
            />
            <button
              type="submit"
              className={
                row.is_active
                  ? "inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800 hover:bg-emerald-200"
                  : "inline-flex items-center rounded-full bg-[#f3f4f6] px-2.5 py-1 text-[10px] font-bold text-[#6b7280] hover:bg-[#e5e7eb]"
              }
            >
              {row.is_active ? "Идэвхтэй" : "Идэвхгүй"}
            </button>
          </form>
          {row.itdoctor_service_id != null && (
            <span
              title={`Захиалга боломжтой — IT Doctor ID ${row.itdoctor_service_id}`}
              className="inline-flex items-center rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-bold text-primary-ink"
            >
              Захиалга
            </span>
          )}
        </div>
      </td>
      <td className="px-5 py-3 text-right">
        <Link
          href={`/admin/services/${row.id}`}
          className="text-[12px] font-bold text-primary hover:underline"
        >
          Засах →
        </Link>
      </td>
    </tr>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "rounded-full border px-3.5 py-1.5 text-[11px] font-semibold transition-colors " +
        (active
          ? "border-primary bg-primary text-white"
          : "border-line bg-white text-[#374151] hover:border-line-strong")
      }
    >
      {label}
    </button>
  );
}

