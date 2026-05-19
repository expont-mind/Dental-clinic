"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Watches a form action state and fires toast notifications on changes.
 * Replaces inline success/error <p> blocks in admin forms.
 */
export function useFormToast(
  state: { ok?: boolean; error?: string },
  successMsg = "Хадгалагдлаа.",
) {
  const prev = useRef(state);
  useEffect(() => {
    if (state === prev.current) return;
    prev.current = state;
    if (state.ok) toast.success(successMsg);
    if (state.error) toast.error(state.error);
  }, [state, successMsg]);
}
