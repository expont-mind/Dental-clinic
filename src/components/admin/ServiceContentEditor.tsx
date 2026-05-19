"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { ServiceContentBlock } from "@/lib/supabase/types";

type Lang = "mn" | "en";

type Props = {
  defaultMn?: ServiceContentBlock | null;
  defaultEn?: ServiceContentBlock | null;
};

// Icon keys supported by the public ServiceTimeline component
const TIMELINE_ICONS = [
  "stethoscope",
  "clipboard",
  "sparkles",
  "calendar",
  "shield",
  "smile",
  "heart",
  "hand",
] as const;

function emptyBlock(): ServiceContentBlock {
  return {
    treatments: [],
    benefits: [],
    faq: [],
    pricing: [],
    timeline: [],
    testimonials: [],
  };
}

function normalise(block: ServiceContentBlock | null | undefined): ServiceContentBlock {
  if (!block) return emptyBlock();
  return {
    treatments: block.treatments ?? [],
    benefits: block.benefits ?? [],
    faq: block.faq ?? [],
    pricing: block.pricing ?? [],
    timeline: block.timeline ?? [],
    testimonials: block.testimonials ?? [],
  };
}

export function ServiceContentEditor({ defaultMn, defaultEn }: Props) {
  const [mn, setMn] = useState<ServiceContentBlock>(() => normalise(defaultMn));
  const [en, setEn] = useState<ServiceContentBlock>(() => normalise(defaultEn));
  const [lang, setLang] = useState<Lang>("mn");

  const current = lang === "mn" ? mn : en;
  const setCurrent = lang === "mn" ? setMn : setEn;

  // Strip empty entries before serialising so hidden inputs stay small.
  const serialisedMn = useMemo(() => JSON.stringify(prune(mn)), [mn]);
  const serialisedEn = useMemo(() => JSON.stringify(prune(en)), [en]);

  return (
    <div className="rounded-2xl border border-line bg-[#fafbfc] p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-[16px] font-bold text-ink">
            Үйлчилгээний агуулга
          </h3>
          <p className="mt-0.5 text-[11px] text-[#6b7280]">
            Дэлгэрэнгүй хуудсанд харагдах эмчилгээ, давуу тал, үе шат,
            үйлчлүүлэгчийн сэтгэгдэл, асуулт хариулт, үнийн жагсаалт.
          </p>
        </div>
        <div className="inline-flex rounded-full bg-white p-1 ring-1 ring-line">
          {(["mn", "en"] as Lang[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={
                "rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors " +
                (lang === l
                  ? "bg-primary text-white"
                  : "text-[#6b7280] hover:text-ink")
              }
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <input type="hidden" name="content_mn" value={serialisedMn} />
      <input type="hidden" name="content_en" value={serialisedEn} />

      <div className="space-y-6">
        <TreatmentsSection
          values={current.treatments ?? []}
          onChange={(treatments) => setCurrent({ ...current, treatments })}
          lang={lang}
        />
        <BenefitsSection
          values={current.benefits ?? []}
          onChange={(benefits) => setCurrent({ ...current, benefits })}
          lang={lang}
        />
        <TimelineSection
          values={current.timeline ?? []}
          onChange={(timeline) => setCurrent({ ...current, timeline })}
          lang={lang}
        />
        <FaqSection
          values={current.faq ?? []}
          onChange={(faq) => setCurrent({ ...current, faq })}
          lang={lang}
        />
        <PricingSection
          values={current.pricing ?? []}
          onChange={(pricing) => setCurrent({ ...current, pricing })}
          lang={lang}
        />
        <TestimonialsSection
          values={current.testimonials ?? []}
          onChange={(testimonials) => setCurrent({ ...current, testimonials })}
          lang={lang}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Section helpers
// ============================================================================

function SectionShell({
  title,
  hint,
  onAdd,
  addLabel,
  children,
}: {
  title: string;
  hint: string;
  onAdd: () => void;
  addLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl bg-white p-4 ring-1 ring-line">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4 className="text-[13px] font-bold text-ink">{title}</h4>
          <p className="mt-0.5 text-[11px] text-[#6b7280]">{hint}</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[11px] font-semibold text-primary hover:border-primary hover:bg-primary-soft/40 transition-colors"
        >
          <Plus className="h-3 w-3" strokeWidth={2.5} />
          {addLabel}
        </button>
      </header>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function RowWrap({
  onRemove,
  children,
}: {
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="group flex items-start gap-2 rounded-lg bg-[#fafbfc] p-2.5 ring-1 ring-line">
      <div className="flex-1 space-y-2">{children}</div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove"
        className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-md text-[#9ca3af] hover:bg-rose-50 hover:text-rose-600 transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={2.25} />
      </button>
    </div>
  );
}

const inputClasses =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-[12px] outline-none placeholder:text-[#c1c7cf] focus:border-primary";
const textareaClasses = inputClasses + " min-h-[64px] resize-y";

// ============================================================================
// Treatments — string[]
// ============================================================================

function TreatmentsSection({
  values,
  onChange,
  lang,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  lang: Lang;
}) {
  return (
    <SectionShell
      title={lang === "mn" ? "Эмчилгээний жагсаалт" : "Treatments included"}
      hint={
        lang === "mn"
          ? "Энэ үйлчилгээнд багтсан жижиг эмчилгээний бүртгэл."
          : "Sub-treatments grouped under this service."
      }
      onAdd={() => onChange([...values, ""])}
      addLabel={lang === "mn" ? "Нэмэх" : "Add"}
    >
      {values.length === 0 && <EmptyHint lang={lang} />}
      {values.map((v, i) => (
        <RowWrap
          key={i}
          onRemove={() => onChange(values.filter((_, j) => j !== i))}
        >
          <input
            type="text"
            value={v}
            placeholder={
              lang === "mn"
                ? "Жнь: Шүдний цэвэрлэгээ"
                : "e.g. Teeth cleaning"
            }
            onChange={(e) =>
              onChange(values.map((x, j) => (j === i ? e.target.value : x)))
            }
            className={inputClasses}
          />
        </RowWrap>
      ))}
    </SectionShell>
  );
}

// ============================================================================
// Benefits — { title, body }[]
// ============================================================================

function BenefitsSection({
  values,
  onChange,
  lang,
}: {
  values: { title: string; body: string }[];
  onChange: (next: { title: string; body: string }[]) => void;
  lang: Lang;
}) {
  return (
    <SectionShell
      title={lang === "mn" ? "Бид яагаад онцгой вэ" : "Why we're different"}
      hint={
        lang === "mn"
          ? "Үйлчилгээний 2–4 онцлох давуу талыг гарчиг + тайлбараар."
          : "2–4 selling points with a title and short body."
      }
      onAdd={() => onChange([...values, { title: "", body: "" }])}
      addLabel={lang === "mn" ? "Нэмэх" : "Add"}
    >
      {values.length === 0 && <EmptyHint lang={lang} />}
      {values.map((v, i) => (
        <RowWrap
          key={i}
          onRemove={() => onChange(values.filter((_, j) => j !== i))}
        >
          <input
            type="text"
            value={v.title}
            placeholder={lang === "mn" ? "Гарчиг" : "Title"}
            onChange={(e) =>
              onChange(
                values.map((x, j) =>
                  j === i ? { ...x, title: e.target.value } : x,
                ),
              )
            }
            className={inputClasses}
          />
          <textarea
            value={v.body}
            placeholder={lang === "mn" ? "Тайлбар" : "Body"}
            onChange={(e) =>
              onChange(
                values.map((x, j) =>
                  j === i ? { ...x, body: e.target.value } : x,
                ),
              )
            }
            className={textareaClasses}
          />
        </RowWrap>
      ))}
    </SectionShell>
  );
}

// ============================================================================
// Timeline — { title, body, icon? }[]
// ============================================================================

function TimelineSection({
  values,
  onChange,
  lang,
}: {
  values: { title: string; body: string; icon?: string }[];
  onChange: (next: { title: string; body: string; icon?: string }[]) => void;
  lang: Lang;
}) {
  return (
    <SectionShell
      title={lang === "mn" ? "Эмчилгээний үе шат" : "What to expect timeline"}
      hint={
        lang === "mn"
          ? "Үйлчилгээний явц 3–5 алхмаар. Дүрс заавал биш."
          : "3–5 steps your patient will go through. Icon optional."
      }
      onAdd={() =>
        onChange([
          ...values,
          { title: "", body: "", icon: TIMELINE_ICONS[0] },
        ])
      }
      addLabel={lang === "mn" ? "Алхам нэмэх" : "Add step"}
    >
      {values.length === 0 && <EmptyHint lang={lang} />}
      {values.map((v, i) => (
        <RowWrap
          key={i}
          onRemove={() => onChange(values.filter((_, j) => j !== i))}
        >
          <div className="grid gap-2 sm:grid-cols-[1fr_140px]">
            <input
              type="text"
              value={v.title}
              placeholder={lang === "mn" ? "Алхмын нэр" : "Step title"}
              onChange={(e) =>
                onChange(
                  values.map((x, j) =>
                    j === i ? { ...x, title: e.target.value } : x,
                  ),
                )
              }
              className={inputClasses}
            />
            <select
              value={v.icon ?? ""}
              onChange={(e) =>
                onChange(
                  values.map((x, j) =>
                    j === i
                      ? { ...x, icon: e.target.value || undefined }
                      : x,
                  ),
                )
              }
              className={inputClasses}
            >
              <option value="">{lang === "mn" ? "(дүрс)" : "(icon)"}</option>
              {TIMELINE_ICONS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={v.body}
            placeholder={lang === "mn" ? "Тайлбар" : "Description"}
            onChange={(e) =>
              onChange(
                values.map((x, j) =>
                  j === i ? { ...x, body: e.target.value } : x,
                ),
              )
            }
            className={textareaClasses}
          />
        </RowWrap>
      ))}
    </SectionShell>
  );
}

// ============================================================================
// FAQ — { q, a }[]
// ============================================================================

function FaqSection({
  values,
  onChange,
  lang,
}: {
  values: { q: string; a: string }[];
  onChange: (next: { q: string; a: string }[]) => void;
  lang: Lang;
}) {
  return (
    <SectionShell
      title={lang === "mn" ? "Түгээмэл асуултууд" : "Frequently asked questions"}
      hint={
        lang === "mn"
          ? "Үйлчлүүлэгчид түгээмэл асуудаг асуултууд + хариулт."
          : "Q&A pairs that come up most often."
      }
      onAdd={() => onChange([...values, { q: "", a: "" }])}
      addLabel={lang === "mn" ? "Асуулт нэмэх" : "Add Q&A"}
    >
      {values.length === 0 && <EmptyHint lang={lang} />}
      {values.map((v, i) => (
        <RowWrap
          key={i}
          onRemove={() => onChange(values.filter((_, j) => j !== i))}
        >
          <input
            type="text"
            value={v.q}
            placeholder={lang === "mn" ? "Асуулт" : "Question"}
            onChange={(e) =>
              onChange(
                values.map((x, j) =>
                  j === i ? { ...x, q: e.target.value } : x,
                ),
              )
            }
            className={inputClasses}
          />
          <textarea
            value={v.a}
            placeholder={lang === "mn" ? "Хариулт" : "Answer"}
            onChange={(e) =>
              onChange(
                values.map((x, j) =>
                  j === i ? { ...x, a: e.target.value } : x,
                ),
              )
            }
            className={textareaClasses}
          />
        </RowWrap>
      ))}
    </SectionShell>
  );
}

// ============================================================================
// Pricing — { label, price, note? }[]
// ============================================================================

function PricingSection({
  values,
  onChange,
  lang,
}: {
  values: { label: string; price: string; note?: string }[];
  onChange: (next: { label: string; price: string; note?: string }[]) => void;
  lang: Lang;
}) {
  return (
    <SectionShell
      title={lang === "mn" ? "Үнийн жагсаалт" : "Price list"}
      hint={
        lang === "mn"
          ? "Дэлгэрэнгүй хуудсанд харагдах үнийн мөрүүд."
          : "Each row shows a label and a price (+ optional note)."
      }
      onAdd={() =>
        onChange([...values, { label: "", price: "", note: "" }])
      }
      addLabel={lang === "mn" ? "Мөр нэмэх" : "Add row"}
    >
      {values.length === 0 && <EmptyHint lang={lang} />}
      {values.map((v, i) => (
        <RowWrap
          key={i}
          onRemove={() => onChange(values.filter((_, j) => j !== i))}
        >
          <div className="grid gap-2 sm:grid-cols-[1fr_160px]">
            <input
              type="text"
              value={v.label}
              placeholder={lang === "mn" ? "Үйлчилгээ" : "Item"}
              onChange={(e) =>
                onChange(
                  values.map((x, j) =>
                    j === i ? { ...x, label: e.target.value } : x,
                  ),
                )
              }
              className={inputClasses}
            />
            <input
              type="text"
              value={v.price}
              placeholder={lang === "mn" ? "Үнэ (текст)" : "Price (text)"}
              onChange={(e) =>
                onChange(
                  values.map((x, j) =>
                    j === i ? { ...x, price: e.target.value } : x,
                  ),
                )
              }
              className={inputClasses}
            />
          </div>
          <input
            type="text"
            value={v.note ?? ""}
            placeholder={
              lang === "mn"
                ? "Нэмэлт тайлбар (заавал биш)"
                : "Note (optional, e.g. lease plan)"
            }
            onChange={(e) =>
              onChange(
                values.map((x, j) =>
                  j === i ? { ...x, note: e.target.value } : x,
                ),
              )
            }
            className={inputClasses}
          />
        </RowWrap>
      ))}
    </SectionShell>
  );
}

// ============================================================================
// Testimonials — { quote, author, role? }[]
// ============================================================================

function TestimonialsSection({
  values,
  onChange,
  lang,
}: {
  values: { quote: string; author: string; role?: string }[];
  onChange: (next: { quote: string; author: string; role?: string }[]) => void;
  lang: Lang;
}) {
  return (
    <SectionShell
      title={lang === "mn" ? "Үйлчлүүлэгчийн сэтгэгдэл" : "Patient testimonials"}
      hint={
        lang === "mn"
          ? "Үйлчилгээтэй холбоотой 1+ ишлэл. Эзэмшигчийн нэр заавал."
          : "One or more service-specific quotes. Author name required."
      }
      onAdd={() =>
        onChange([...values, { quote: "", author: "", role: "" }])
      }
      addLabel={lang === "mn" ? "Сэтгэгдэл нэмэх" : "Add quote"}
    >
      {values.length === 0 && <EmptyHint lang={lang} />}
      {values.map((v, i) => (
        <RowWrap
          key={i}
          onRemove={() => onChange(values.filter((_, j) => j !== i))}
        >
          <textarea
            value={v.quote}
            placeholder={lang === "mn" ? "Ишлэл" : "Quote"}
            onChange={(e) =>
              onChange(
                values.map((x, j) =>
                  j === i ? { ...x, quote: e.target.value } : x,
                ),
              )
            }
            className={textareaClasses}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              type="text"
              value={v.author}
              placeholder={lang === "mn" ? "Зохиогч" : "Author"}
              onChange={(e) =>
                onChange(
                  values.map((x, j) =>
                    j === i ? { ...x, author: e.target.value } : x,
                  ),
                )
              }
              className={inputClasses}
            />
            <input
              type="text"
              value={v.role ?? ""}
              placeholder={
                lang === "mn" ? "Үүрэг (заавал биш)" : "Role (optional)"
              }
              onChange={(e) =>
                onChange(
                  values.map((x, j) =>
                    j === i ? { ...x, role: e.target.value } : x,
                  ),
                )
              }
              className={inputClasses}
            />
          </div>
        </RowWrap>
      ))}
    </SectionShell>
  );
}

function EmptyHint({ lang }: { lang: Lang }) {
  return (
    <p className="rounded-md bg-white px-3 py-2 text-[11px] italic text-[#9ca3af] ring-1 ring-line/60">
      {lang === "mn"
        ? "Хоосон — нэмэхгүй бол энэ хэсэг нийтийн хуудсанд харагдахгүй."
        : "Empty — leave empty and this section won't render on the public page."}
    </p>
  );
}

// ============================================================================
// Strip empty rows before serialising so we don't bloat the JSON with blanks.
// ============================================================================

function prune(b: ServiceContentBlock): ServiceContentBlock {
  return {
    treatments: (b.treatments ?? []).filter((t) => t.trim().length > 0),
    benefits: (b.benefits ?? []).filter(
      (x) => (x.title?.trim() ?? "") || (x.body?.trim() ?? ""),
    ),
    faq: (b.faq ?? []).filter(
      (x) => (x.q?.trim() ?? "") || (x.a?.trim() ?? ""),
    ),
    pricing: (b.pricing ?? [])
      .filter((x) => (x.label?.trim() ?? "") || (x.price?.trim() ?? ""))
      .map((x) => ({
        label: x.label,
        price: x.price,
        ...(x.note && x.note.trim() ? { note: x.note } : {}),
      })),
    timeline: (b.timeline ?? [])
      .filter((x) => (x.title?.trim() ?? "") || (x.body?.trim() ?? ""))
      .map((x) => ({
        title: x.title,
        body: x.body,
        ...(x.icon ? { icon: x.icon } : {}),
      })),
    testimonials: (b.testimonials ?? [])
      .filter((x) => (x.quote?.trim() ?? "") || (x.author?.trim() ?? ""))
      .map((x) => ({
        quote: x.quote,
        author: x.author,
        ...(x.role && x.role.trim() ? { role: x.role } : {}),
      })),
  };
}
