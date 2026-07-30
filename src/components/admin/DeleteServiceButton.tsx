"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteServiceAction } from "@/lib/actions/services";

export function DeleteServiceButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!confirm(`"${name}" үйлчилгээг устгах уу? Энэ үйлдлийг буцаах боломжгүй.`))
      return;
    setError(null);
    startTransition(async () => {
      const r = await deleteServiceAction(id);
      if (r.ok) {
        router.push("/admin/services");
      } else {
        setError(r.error ?? "Устгаж чадсангүй.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white px-3 py-1.5 text-[12px] font-bold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? (
          <span className="inline-block h-3 w-3 animate-spin rounded-full border border-rose-400 border-t-transparent" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" strokeWidth={2.25} />
        )}
        {pending ? "Устгаж байна…" : "Устгах"}
      </button>
      {error && (
        <p className="max-w-[260px] text-right text-[10px] text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
