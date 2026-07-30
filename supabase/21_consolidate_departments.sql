-- ============================================================================
-- Migration 21: Consolidate departments to a single `dental` row.
--
-- Background:
--   The original schema seeded 4 non-dental legacy departments (internal,
--   pediatrics-general, cardiology, dermatology) from a pre-pivot general
--   hospital, plus 5 dental specialty departments (general, cosmetic,
--   orthodontics, pediatric, restorative) that nobody is wired to anymore.
--   In practice all 19 doctors and all active services already live under
--   the `dental` department (Шүдний эмнэлэг). The other rows just clutter
--   admin dropdowns and inflate filter chips on /doctors.
--
-- Strategy:
--   1. Move every doctor and every service that still points elsewhere into
--      `dental` (covers parents, deactivated legacy children, and any
--      orphan rows that slipped through migration 20).
--   2. Delete the 9 unused departments.
--
-- After this, `departments` has exactly one row. The Dentexgo API contract
-- (which joins on departments) still works — it just always sees one. The
-- /doctors chip filter collapses to a single chip (UI tweak in a follow-up).
--
-- Safe to re-run.
-- ============================================================================

BEGIN;

-- 1a. Move every doctor to dental.
UPDATE public.doctors
SET department_id = (SELECT id FROM public.departments WHERE slug = 'dental'),
    updated_at = now()
WHERE department_id IS DISTINCT FROM (SELECT id FROM public.departments WHERE slug = 'dental');

-- 1b. Move every service (parents + deactivated legacy children + any orphans).
UPDATE public.services
SET department_id = (SELECT id FROM public.departments WHERE slug = 'dental'),
    updated_at = now()
WHERE department_id IS DISTINCT FROM (SELECT id FROM public.departments WHERE slug = 'dental');

-- 2. Delete every department row except `dental`.
DELETE FROM public.departments
WHERE slug <> 'dental';

-- 3. Make sure the surviving row is active and sits at sort 1.
UPDATE public.departments
SET is_active = true, sort_order = 1, updated_at = now()
WHERE slug = 'dental';

COMMIT;
