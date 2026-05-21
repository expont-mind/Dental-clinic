-- ============================================================================
-- Hard-delete the legacy `implant-single` ("Dental Implant" placeholder).
-- The new `implant-korean` + `implant-japanese` rows (seeded by migration 18)
-- now cover what this row used to represent.
--
-- Deletes junction rows first so FK constraints don't block the service delete.
-- Idempotent — re-running after the row is gone is a no-op.
-- ============================================================================

-- Cache the id once
DO $$
DECLARE
  target_id uuid;
BEGIN
  SELECT id INTO target_id
  FROM public.services
  WHERE slug = 'implant-single';

  IF target_id IS NULL THEN
    RAISE NOTICE 'implant-single not found — nothing to delete';
    RETURN;
  END IF;

  -- Junction rows (safe even if rows don't exist)
  DELETE FROM public.service_branches WHERE service_id = target_id;
  DELETE FROM public.doctor_services  WHERE service_id = target_id;

  -- The service itself
  DELETE FROM public.services WHERE id = target_id;

  RAISE NOTICE 'Deleted implant-single (id=%)', target_id;
END $$;

-- Confirm it's gone
SELECT count(*) AS remaining
FROM public.services
WHERE slug = 'implant-single';
