-- ============================================================================
-- Migration: Add `is_featured` column to services so the public listing's
-- larger "feature card" slot can be configured from admin instead of from
-- a hardcoded slug list in source.
-- Idempotent: safe to re-run.
-- ============================================================================

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

-- Preserve current behaviour: the three slugs that were hardcoded
-- as "featured" become DB-flagged so the listing looks unchanged
-- the moment the new code ships.
UPDATE public.services
SET is_featured = true
WHERE slug IN ('general', 'orthodontics', 'implant');

-- Confirm
SELECT slug, name_mn, is_featured, sort_order
FROM public.services
WHERE is_featured = true
ORDER BY sort_order;
