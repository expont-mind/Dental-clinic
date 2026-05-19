"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Link as LinkIcon } from "lucide-react";

type Props = {
  name: string;
  label: string;
  hint?: string;
  aspect?: "square" | "card" | "portrait";
  defaultValue?: string;
};

export function ImageUploadField({
  name,
  label,
  hint,
  aspect = "card",
  defaultValue,
}: Props) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setValue(data.url);
      } else {
        setError(data.error || "Upload failed");
      }
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const aspectClass =
    aspect === "portrait"
      ? "aspect-[4/5]"
      : aspect === "square"
        ? "aspect-square"
        : "aspect-[4/3]";

  return (
    <div>
      <label className="mb-2 block text-[12px] font-semibold text-[#374151]">
        {label}
      </label>
      {hint && (
        <p className="-mt-1 mb-2 text-[11px] leading-5 text-[#6b7280]">
          {hint}
        </p>
      )}
      <input type="hidden" name={name} value={value} />
      <div className="flex items-stretch gap-4">
        <div
          className={
            "relative w-32 shrink-0 overflow-hidden rounded-2xl bg-[#f3f4f6] ring-1 ring-line " +
            aspectClass
          }
        >
          {value ? (
            <Image
              src={value}
              alt={label}
              fill
              sizes="128px"
              className="object-cover"
              unoptimized={!value.startsWith("/") && !value.startsWith("http")}
            />
          ) : (
            <div className="grid h-full place-items-center text-[10px] text-[#9ca3af]">
              {aspect === "portrait" ? "4 : 5" : "4 : 3"}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-[12px] font-semibold text-ink hover:bg-[#f3f4f6] transition-colors disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5" strokeWidth={2.25} />
              {uploading
                ? "Хуулж байна…"
                : value
                  ? "Зураг солих"
                  : "Зураг хуулах"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => setValue("")}
                className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-3 py-2 text-[12px] font-semibold text-[#6b7280] hover:bg-rose-50 hover:text-rose-600 transition-colors"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.25} />
                Хасах
              </button>
            )}
          </div>
          <div className="relative">
            <LinkIcon
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9ca3af]"
              strokeWidth={2.25}
            />
            <input
              type="url"
              placeholder="эсвэл URL: https://… эсвэл /p1.jpg"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-4 py-2 pl-9 text-[12px] outline-none placeholder:text-[#c1c7cf] focus:border-primary"
            />
          </div>
          {error && (
            <p className="text-[11px] font-semibold text-rose-600">{error}</p>
          )}
          <p className="text-[10px] text-[#9ca3af]">
            JPG / PNG / WebP, дээд тал нь 2MB
          </p>
        </div>
      </div>
    </div>
  );
}
