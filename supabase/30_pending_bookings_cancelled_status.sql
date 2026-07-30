-- ============================================================================
-- Migration: add a distinct `cancelled` status to pending_bookings.
--
-- Cancelling a confirmed booking used to reuse the `failed` status, so the
-- admin appointments list mislabelled admin-cancelled bookings as "Алдаатай"
-- (Failed) even though the iDoctor cancel succeeded. Split the two: genuine
-- push/creation errors stay `failed`, admin cancellations become `cancelled`.
--
-- Historical rows cancelled before this migration remain `failed` — they can't
-- be told apart from real failures retroactively.
--
-- Idempotent.
-- ============================================================================

ALTER TABLE public.pending_bookings
  DROP CONSTRAINT IF EXISTS pending_bookings_status_check;

ALTER TABLE public.pending_bookings
  ADD CONSTRAINT pending_bookings_status_check
  CHECK (status IN ('pending', 'processing', 'paid', 'expired', 'failed', 'cancelled'));
