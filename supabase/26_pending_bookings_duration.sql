-- ============================================================================
-- Migration: track real service duration on pending_bookings.
--
-- iDoctor's `POST /bookings` accepts no duration knob — the booking is
-- always sized to `branch.slot_duration` (typically 20 min). For services
-- that actually take longer (e.g. 60-min cleanings, implants), we need
-- two things our way:
--   1. The receptionist sees the real duration on the iDoctor side — handled
--      by prepending "Үргэлжлэх: 60 минут" to the booking note.
--   2. The website's slot picker skips the trailing 20-min cells the long
--      booking actually consumes — needs duration on every booking row so
--      the slot API can subtract `[start, start+duration_min)` per booking.
--
-- Idempotent.
-- ============================================================================

ALTER TABLE public.pending_bookings
  ADD COLUMN IF NOT EXISTS duration_min integer;

-- Index for fast per-dentist/per-day slot lookup (with duration_min filter
-- applied in the query layer; only paid+long bookings matter).
CREATE INDEX IF NOT EXISTS idx_pending_bookings_dentist_slot
  ON public.pending_bookings (dentist_id, slot_datetime)
  WHERE status = 'paid' AND duration_min IS NOT NULL;
