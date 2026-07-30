"use client";

import { useActionState } from "react";
import {
  confirmPendingBookingAction,
  cancelPendingBookingAction,
  type ConfirmBookingState,
  type CancelBookingState,
} from "@/lib/actions/appointments";

const confirmInitial: ConfirmBookingState = {};
const cancelInitial: CancelBookingState = {};

export function ConfirmAppointmentButton({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(
    confirmPendingBookingAction,
    confirmInitial,
  );

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center rounded-full bg-[#0f172a] px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Илгээж байна…" : "Баталгаажуулах"}
      </button>
      {state.error && (
        <p className="max-w-[180px] text-right text-[10px] text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}

export function CancelAppointmentButton({
  id,
  hasReference,
}: {
  id: string;
  hasReference: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    cancelPendingBookingAction,
    cancelInitial,
  );

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        title={
          hasReference
            ? "IT Doctor дээрээс цуцална"
            : "Зөвхөн дотоод төлөвийг шинэчилнэ"
        }
        className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-danger ring-1 ring-danger/30 transition-colors hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Цуцалж байна…" : "Цуцлах"}
      </button>
      {state.error && (
        <p className="max-w-[180px] text-right text-[10px] text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}
