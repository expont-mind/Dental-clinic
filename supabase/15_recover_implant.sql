-- ============================================================================
-- One-shot recovery: clear the stray itdoctor_service_id on implant (and any
-- other service that was accidentally tagged 35 by the old admin-form default)
-- so the row reappears in both public and admin listings.
-- Idempotent: safe to re-run.
-- ============================================================================

-- 1. Audit what's currently set to 35 so you can see the damage first.
SELECT slug, name_mn, itdoctor_service_id, is_active
FROM public.services
WHERE itdoctor_service_id = 35
ORDER BY slug;

-- 2. Clear it. After this, every row above will reappear in /admin/services
--    and /[lang]/services (assuming is_active = true and parent_id IS NULL).
UPDATE public.services
SET itdoctor_service_id = NULL
WHERE itdoctor_service_id = 35;

-- 3. Confirm none left.
SELECT count(*) AS rows_still_set_to_35
FROM public.services
WHERE itdoctor_service_id = 35;
