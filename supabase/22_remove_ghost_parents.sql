-- ============================================================================
-- Migration 22: Remove 4 ghost top-level service rows.
--
-- After migrations 20 + 21 we still have 4 parent rows (parent_id IS NULL)
-- that don't belong to the brochure catalog:
--   - `general`      — inactive, 0 children (legacy from mig 17 consolidation)
--   - `hygiene`      — inactive, 0 children (legacy)
--   - `periodontics` — active,   0 children (orphan from earlier seeding)
--   - `restorative`  — active,   0 children, name duplicates `prosthetic`
--                                            (both "Согог заслын эмчилгээ")
--
-- All four have zero children. junction tables (doctor_services,
-- branch_services) cascade-delete. bookings.service_id is an IT Doctor
-- integer id, not a uuid FK — payments unaffected.
--
-- Safe to re-run.
-- ============================================================================

BEGIN;

DELETE FROM public.services
WHERE parent_id IS NULL
  AND slug IN ('general', 'hygiene', 'periodontics', 'restorative');

COMMIT;
