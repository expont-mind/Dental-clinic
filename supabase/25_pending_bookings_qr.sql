-- ============================================================================
-- Migration: cache QPay QR image on the pending_bookings row.
--
-- The payment page was previously redirected to with the base64 PNG embedded
-- in the URL (`?qr=iVBORw…` ~6KB), which Node rejects with HTTP 431 once
-- combined with cookies. We now persist the QR alongside the booking and
-- redirect with just `?id=…`.
--
-- Idempotent.
-- ============================================================================

ALTER TABLE public.pending_bookings
  ADD COLUMN IF NOT EXISTS qr_image text;
