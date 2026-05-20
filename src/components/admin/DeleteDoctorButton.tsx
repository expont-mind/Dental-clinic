"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteDoctorAction } from "@/lib/actions/team";

export function DeleteDoctorButton({
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
    if (!confirm(`"${name}" эмчийг устгах уу?`)) return;
    setError(null);
    startTransition(async () => {
      const r = await deleteDoctorAction(id);
      if (r.ok) {
        router.refresh();
      } else {
        setError(r.error ?? "Устгаж чадсангүй.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label="Устгах"
      title={error ?? "Устгах"}
      className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors disabled:opacity-50"
    >
      {pending ? (
        <span className="inline-block h-3 w-3 animate-spin rounded-full border border-rose-400 border-t-transparent" />
      ) : (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" />
        </svg>
      )}
    </button>
  );
}
