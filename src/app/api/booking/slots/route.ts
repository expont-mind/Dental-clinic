import { NextRequest, NextResponse } from "next/server";
import { getDentists, getSlots, ITDoctorError, type ITSlot } from "@/lib/itdoctor/client";
import { createSupabaseAdmin, isAdminConfigured } from "@/lib/supabase/admin";

type HeldBooking = {
  dentist_id: number;
  slot_datetime: string;
  duration_min: number | null;
  /**
   * `confirmed` — pushed to iDoctor, which already hides the start cell, so
   * only the trailing cells a long appointment consumes need removing.
   * `hold` — awaiting payment. iDoctor knows nothing about it, so the start
   * cell has to be removed too or two customers can buy the same slot.
   */
  kind: "confirmed" | "hold";
};

/**
 * Fetch every booking at this branch that occupies part of `date`:
 *
 * - `paid` rows (already in iDoctor), for their trailing cells; and
 * - unexpired `pending` / `processing` rows, which hold a slot for the length
 *   of the payment window but are invisible to iDoctor.
 *
 * Without the second group, two customers can both reach the payment page for
 * the same slot, both pay, and the second iDoctor push fails — money taken,
 * no appointment.
 *
 * Known gap: "any doctor" bookings store `dentist_id = null`, so their holds
 * can't be attributed to a dentist and are skipped here. Blocking the start
 * cell for every dentist would be wrong (iDoctor picks whoever is free), so
 * those remain first-past-the-post, as before.
 */
async function getHeldBookings(
  branchId: number,
  date: string,
  dentistId?: number,
): Promise<HeldBooking[]> {
  if (!isAdminConfigured()) return [];
  const supabase = createSupabaseAdmin();

  // slot_datetime is "YYYY-MM-DD HH:MM:SS" (clinic-local). String range works
  // because the prefix is lexicographically equivalent to date ordering.
  const dayStart = `${date} 00:00:00`;
  const dayEnd = `${date} 23:59:59`;

  let q = supabase
    .from("pending_bookings")
    .select("dentist_id, slot_datetime, duration_min, status, expires_at")
    .in("status", ["paid", "pending", "processing"])
    .eq("branch_id", branchId)
    .gte("slot_datetime", dayStart)
    .lte("slot_datetime", dayEnd)
    .not("dentist_id", "is", null);

  if (dentistId && dentistId > 0) {
    q = q.eq("dentist_id", dentistId);
  }

  const { data, error } = await q;
  if (error) {
    console.error("[slots route] held-booking lookup failed:", error);
    return [];
  }

  const now = Date.now();
  const rows = (data ?? []) as {
    dentist_id: number;
    slot_datetime: string;
    duration_min: number | null;
    status: string;
    expires_at: string;
  }[];

  return rows
    .filter((r) => {
      // A lapsed hold no longer blocks anything; fulfil marks it `expired` on
      // the next poll, but the slot must free up immediately regardless.
      if (r.status === "paid") return true;
      return new Date(r.expires_at).getTime() > now;
    })
    .map((r) => ({
      dentist_id: r.dentist_id,
      slot_datetime: r.slot_datetime,
      duration_min: r.duration_min,
      kind: r.status === "paid" ? ("confirmed" as const) : ("hold" as const),
    }));
}

/** Parse "YYYY-MM-DD HH:MM:SS" (clinic-local, no tz). UTC is fine because we
 * only do arithmetic and string comparisons within the same source. */
function parseLocal(ts: string): number {
  return Date.parse(ts.replace(" ", "T") + "Z");
}

/**
 * Remove slots that fall inside a booked or held window.
 *
 * For `confirmed` bookings iDoctor has already dropped the start cell, so only
 * cells strictly after the start are trimmed. For `hold` rows nothing has been
 * pushed upstream yet, so the start cell is removed as well — that is what
 * stops a second customer from buying a slot someone is mid-payment on.
 *
 * A hold with no `duration_min` still occupies its own start cell.
 */
function subtractHeldWindows(
  slots: ITSlot[],
  bookings: HeldBooking[],
): ITSlot[] {
  if (bookings.length === 0) return slots;
  const windows = bookings.map((b) => {
    const start = parseLocal(b.slot_datetime);
    return {
      start,
      end: start + (b.duration_min ?? 0) * 60_000,
      inclusiveStart: b.kind === "hold",
    };
  });
  return slots.filter((s) => {
    const ts = parseLocal(s.start);
    return !windows.some((w) => {
      if (w.inclusiveStart && ts === w.start) return true;
      return ts > w.start && ts < w.end;
    });
  });
}

/**
 * Keep only start cells that have enough *consecutive* free cells to fit a
 * service of `durationMin`. iDoctor quantizes every booking into slot_duration
 * cells and a long service books a chain of `ceil(durationMin / cell)` of them;
 * if any trailing cell is taken the chain rolls back and the booking errors.
 * So a 9:00 start with only 9:00–10:00 free must be hidden for a 120-min
 * service — the cell length is read from each slot's own start/end span.
 */
function filterByDuration(slots: ITSlot[], durationMin: number): ITSlot[] {
  if (!durationMin || durationMin <= 0) return slots;
  const freeStarts = new Set(slots.map((s) => parseLocal(s.start)));
  return slots.filter((s) => {
    const t0 = parseLocal(s.start);
    const cell = parseLocal(s.end) - t0; // ms
    if (cell <= 0) return true;
    const need = Math.ceil(durationMin / (cell / 60_000));
    for (let k = 1; k < need; k++) {
      if (!freeStarts.has(t0 + k * cell)) return false;
    }
    return true;
  });
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const dentistId = Number(sp.get("dentist_id") ?? "0");
  const date = sp.get("date");
  const branchId = Number(sp.get("branch_id") ?? "1");
  const durationMin = Number(sp.get("duration") ?? "0");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "date is required (YYYY-MM-DD)" },
      { status: 400 },
    );
  }

  try {
    // "Any doctor" — union every dentist's slots at the branch, dedup by start.
    // iDoctor's slots endpoint is per-dentist (/dentists/{id}/slots), so there's
    // no first-class "any" call. When the booking is later POSTed without a
    // dentist_id, iDoctor auto-assigns whichever dentist is free at that start.
    if (dentistId === 0) {
      const dentists = await getDentists(branchId);
      const [perDentistResults, heldBookings] = await Promise.all([
        Promise.allSettled(dentists.map((d) => getSlots(d.id, date, branchId))),
        getHeldBookings(branchId, date),
      ]);
      const bookingsByDentist = new Map<number, HeldBooking[]>();
      for (const b of heldBookings) {
        const list = bookingsByDentist.get(b.dentist_id) ?? [];
        list.push(b);
        bookingsByDentist.set(b.dentist_id, list);
      }
      const byStart = new Map<string, ITSlot>();
      perDentistResults.forEach((r, i) => {
        if (r.status !== "fulfilled") return;
        const did = dentists[i].id;
        const filtered = filterByDuration(
          subtractHeldWindows(r.value, bookingsByDentist.get(did) ?? []),
          durationMin,
        );
        for (const s of filtered) byStart.set(s.start, s);
      });
      const slots = Array.from(byStart.values()).sort((a, b) =>
        a.start.localeCompare(b.start),
      );
      return NextResponse.json({ slots });
    }

    const [rawSlots, heldBookings] = await Promise.all([
      getSlots(dentistId, date, branchId),
      getHeldBookings(branchId, date, dentistId),
    ]);
    const slots = filterByDuration(
      subtractHeldWindows(rawSlots, heldBookings),
      durationMin,
    );
    return NextResponse.json({ slots });
  } catch (e) {
    if (e instanceof ITDoctorError) {
      // Clamp before handing the upstream code to NextResponse — a transport
      // failure can surface as status 0, which throws on construction.
      const status =
        Number.isInteger(e.status) && e.status >= 400 && e.status <= 599
          ? e.status
          : 502;
      return NextResponse.json({ error: e.message }, { status });
    }
    throw e;
  }
}
