-- ============================================================================
-- Migration: track ghost iDoctor booking references on each pending row.
--
-- iDoctor caps every booking at `branch.slot_duration` (typically 20 min).
-- For services that actually take longer we now create N additional
-- placeholder ("ghost") iDoctor bookings at slot+20, slot+40, … so the
-- dentist's iDoctor calendar reflects the real duration and reception /
-- walk-ins can't double-book on top of a real appointment.
--
-- We store every ghost's `booking_reference` on the same pending_bookings
-- row so the cancel flow can iterate them and delete each ghost from
-- iDoctor when the main booking is cancelled.
--
-- Idempotent.
-- ============================================================================

ALTER TABLE public.pending_bookings
  ADD COLUMN IF NOT EXISTS ghost_booking_refs text[] DEFAULT NULL;
