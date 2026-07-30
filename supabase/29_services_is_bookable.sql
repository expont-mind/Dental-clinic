-- ============================================================================
-- Migration: per-service "is_bookable" flag.
--
-- Previously the admin form's "Захиалга боломжтой" checkbox controlled
-- whether we wrote a default iDoctor service_id to the row. Now that
-- routing happens via env vars (ITDOCTOR_TREATMENT_SERVICE_ID /
-- ITDOCTOR_CHECKUP_SERVICE_ID) the checkbox had nothing to write to, so
-- flipping it was a no-op. The detail page meanwhile gated the Book CTA
-- on `is_active`, which conflates "show on the public site" with "accept
-- online bookings". Making is_bookable a first-class column splits them:
--
--   is_active   = show the service on /services and on the detail page
--   is_bookable = render the "Захиалах" button + accept submissions
--
-- Default true so every existing service stays bookable (current
-- behaviour). Admin flips it off for info-only services (e.g. phone
-- consultations, services we want to advertise but route off-website).
--
-- Idempotent.
-- ============================================================================

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS is_bookable boolean NOT NULL DEFAULT true;
