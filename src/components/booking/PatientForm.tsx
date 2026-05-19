"use client";

import { useActionState } from "react";
import {
  bookSlotAction,
  type BookingFormState,
} from "@/lib/actions/booking";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Props = {
  lang: string;
  slotId: string;
  deptSlug: string;
  doctorId: string;
  branchId: number;
  serviceName: string;
  dict: Dictionary;
};

const initial: BookingFormState = { status: "idle" };

export function PatientForm({ lang, slotId, deptSlug, doctorId, branchId, serviceName, dict }: Props) {
  const [state, formAction, pending] = useActionState(
    bookSlotAction,
    initial,
  );

  const errorMessage =
    state.status === "error"
      ? dict.booking.errors[
          state.errorKey as keyof typeof dict.booking.errors
        ] ?? dict.booking.errors.unknown
      : null;

  return (
    <form action={formAction} className="mt-8 grid gap-5">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="slot_id" value={slotId} />
      <input type="hidden" name="dept_slug" value={deptSlug} />
      <input type="hidden" name="doctor_id" value={doctorId} />
      <input type="hidden" name="branch_id" value={branchId} />
      <input type="hidden" name="service_name" value={serviceName} />

      <Input
        name="name"
        label={dict.booking.field_name}
        placeholder={dict.booking.field_name_ph}
        defaultValue={state.values?.name ?? ""}
        autoComplete="name"
        required
      />
      <Input
        name="phone"
        type="tel"
        label={dict.booking.field_phone}
        placeholder={dict.booking.field_phone_ph}
        hint={dict.booking.field_phone_hint}
        defaultValue={state.values?.phone ?? ""}
        autoComplete="tel"
        required
      />

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name="first_visit"
          className="h-4 w-4 rounded border-line text-primary focus:ring-primary"
        />
        <span className="text-[13px] font-semibold text-ink">
          {lang === "mn" ? "Анхны үзлэг" : "First visit"}
        </span>
      </label>

      <Textarea
        name="notes"
        label={dict.booking.field_notes}
        placeholder={dict.booking.field_notes_ph}
        defaultValue={state.values?.notes ?? ""}
      />

      {errorMessage && (
        <div
          role="alert"
          className="rounded-xl border border-danger/30 bg-danger/8 px-4 py-3 text-sm text-danger"
        >
          {errorMessage}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? dict.booking.submitting : dict.booking.submit}
        </Button>
      </div>
    </form>
  );
}
