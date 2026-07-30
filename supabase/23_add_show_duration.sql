-- ============================================================================
-- Migration: Add per-service `show_duration` opt-in flag.
--
-- Some services (consultations of variable length, multi-visit treatments,
-- products) shouldn't advertise a fixed duration on the website or in the
-- Messenger bot's service-carousel cards, even when `duration_min` is set
-- for internal scheduling. Adds a per-service boolean so the admin can
-- opt each service in/out of duration display.
--
-- Default: false (opt-in). The website hides duration when false; the
-- Dentexgo /api/dentexgo/services transform sends `durationMin: null`
-- for false rows so the bot's global show_duration_in_cards toggle can't
-- render a value that doesn't make sense for the service.
--
-- Idempotent: safe to re-run.
-- ============================================================================

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS show_duration boolean NOT NULL DEFAULT false;

-- Confirm
SELECT slug, name_mn, duration_min, show_duration
FROM public.services
ORDER BY sort_order
LIMIT 20;
