"use client";

import { useActionState } from "react";
import {
  cancelMyBookingAction,
  type CancelMyBookingState,
} from "@/lib/actions/my-bookings";

const initial: CancelMyBookingState = {};

type Props = {
  id: string;
  lang: string;
  label: string;
  loadingLabel: string;
  confirmText: string;
};

export function CancelMyBookingButton({
  id,
  lang,
  label,
  loadingLabel,
  confirmText,
}: Props) {
  const [state, formAction, pending] = useActionState(
    cancelMyBookingAction,
    initial,
  );

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
      className="flex flex-col items-end gap-1"
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="lang" value={lang} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center rounded-full bg-white px-4 py-2 text-[12px] font-bold text-danger ring-1 ring-danger/30 transition-colors hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? loadingLabel : label}
      </button>
      {state.error && (
        <p className="max-w-[220px] text-right text-[11px] text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}
