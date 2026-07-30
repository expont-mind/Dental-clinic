"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { syncFromITDoctorAction } from "@/lib/actions/sync";

export function SyncButton() {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSync() {
    setSyncing(true);
    setResult(null);
    try {
      const r = await syncFromITDoctorAction();
      if (r.ok) {
        const names = r.deactivatedNames?.length
          ? ` (${r.deactivatedNames.join(", ")})`
          : "";
        setResult(
          `Sync амжилттай! Эмч: ${r.dentistsSynced}, Үйлчилгээ: ${r.servicesSynced}, Идэвхгүй болгосон: ${r.deactivated}${names}`,
        );
        router.refresh();
      } else {
        setResult(`Алдаа: ${r.error}`);
      }
    } catch {
      setResult("Sync амжилтгүй боллоо.");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleSync}
        disabled={syncing}
        className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-[11px] font-bold text-sky-700 hover:bg-sky-100 transition-colors disabled:opacity-50"
      >
        {syncing ? (
          <>
            <span className="inline-block h-3 w-3 animate-spin rounded-full border border-sky-400 border-t-transparent" />
            Sync хийж байна…
          </>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
            IT Doctor sync
          </>
        )}
      </button>
      {result && (
        <span className="text-[10px] text-[#6b7280]">{result}</span>
      )}
    </div>
  );
}
