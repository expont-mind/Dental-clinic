"use client";

type Mode = "input" | "textarea";

export function BilingualField({
  label,
  nameMn,
  nameEn,
  required,
  mode = "input",
  placeholderMn,
  placeholderEn,
  defaultMn,
  defaultEn,
  rows = 3,
}: {
  label: string;
  nameMn: string;
  nameEn: string;
  required?: boolean;
  mode?: Mode;
  placeholderMn?: string;
  placeholderEn?: string;
  defaultMn?: string;
  defaultEn?: string;
  rows?: number;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 block text-[12px] font-semibold text-[#374151]">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <LangSlot
          flag="MN"
          name={nameMn}
          required={required}
          mode={mode}
          placeholder={placeholderMn}
          defaultValue={defaultMn}
          rows={rows}
        />
        <LangSlot
          flag="EN"
          name={nameEn}
          required={required}
          mode={mode}
          placeholder={placeholderEn}
          defaultValue={defaultEn}
          rows={rows}
        />
      </div>
    </fieldset>
  );
}

function LangSlot({
  flag,
  name,
  required,
  mode,
  placeholder,
  defaultValue,
  rows,
}: {
  flag: string;
  name: string;
  required?: boolean;
  mode: Mode;
  placeholder?: string;
  defaultValue?: string;
  rows: number;
}) {
  const base =
    "w-full rounded-xl border border-line bg-white px-4 py-2.5 pl-12 text-[13px] outline-none placeholder:text-[#c1c7cf] focus:border-primary";
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-2.5 grid h-6 w-6 place-items-center rounded-md bg-[#f3f4f6] text-[9px] font-bold uppercase tracking-wider text-[#6b7280] ring-1 ring-line">
        {flag}
      </span>
      {mode === "textarea" ? (
        <textarea
          name={name}
          required={required}
          placeholder={placeholder}
          defaultValue={defaultValue}
          rows={rows}
          className={`${base} resize-none`}
        />
      ) : (
        <input
          name={name}
          type="text"
          required={required}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className={base}
        />
      )}
    </div>
  );
}
