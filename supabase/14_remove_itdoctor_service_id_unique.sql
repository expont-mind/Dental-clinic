-- ============================================================================
-- Migration: Drop the UNIQUE constraint on services.itdoctor_service_id.
-- Every service can now point to the same IT Doctor service id (e.g. when
-- multiple display rows map to one upstream service).
-- Depends on: 06_itdoctor_service_id.sql which added the column as UNIQUE.
-- Idempotent: safe to re-run.
-- ============================================================================

ALTER TABLE public.services
  DROP CONSTRAINT IF EXISTS services_itdoctor_service_id_key;

-- Verify the constraint is gone (returns 0 rows when successful)
SELECT conname
FROM pg_constraint
WHERE conrelid = 'public.services'::regclass
  AND contype  = 'u'
  AND conname  = 'services_itdoctor_service_id_key';
