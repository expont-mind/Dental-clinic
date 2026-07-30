-- ============================================================================
-- Migration: per-service "multi-visit" flag.
--
-- iDoctor exposes only two configured services on this clinic's account:
-- "Эмчилгээ 1" (Treatment) and "Үзлэг 1" (Examination/Checkup). Every
-- booking pushed through the API must land on one of those two. Which one
-- depends on whether the patient's first visit is the actual procedure
-- (cleaning, whitening — Treatment) or just a planning consultation
-- (implant, ortho, surgery — Checkup, with the real procedure scheduled
-- by reception out-of-band).
--
-- This flag drives:
--   1. iDoctor service_id routing (Checkup vs Treatment, via env vars
--      ITDOCTOR_CHECKUP_SERVICE_ID / ITDOCTOR_TREATMENT_SERVICE_ID).
--   2. Customer-facing banner on the booking confirm page ("Анхны үзлэг").
--   3. Detail-page label change from "Үргэлжлэх" to "Нийт эмчилгээ".
--
-- It does NOT alter the ghost-chain slot math — duration_min still drives
-- how many iDoctor slots get blocked, since a consultation can be 20, 30,
-- 40, or 60 minutes depending on the service.
--
-- Default false: existing rows behave as one-shot procedures (current
-- behaviour). Admins flip implants/ortho/surgery to true one-by-one in
-- /admin/services.
--
-- Idempotent.
-- ============================================================================

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS is_multi_visit boolean NOT NULL DEFAULT false;
