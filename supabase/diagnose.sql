-- ============================================================================
-- Run this in Supabase SQL Editor to diagnose booking issues.
-- It returns 4 result sets — paste them back if you need help reading them.
-- ============================================================================

-- 1) Does the book_slot function exist?
select
  n.nspname as schema,
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as args,
  pg_get_function_result(p.oid) as returns,
  case p.prosecdef when true then 'security definer' else 'security invoker' end as security_mode
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'book_slot';

-- 2) Does the anon role have EXECUTE on book_slot?
-- If this returns 0 rows, run schema.sql again — the GRANT didn't apply.
select grantee, privilege_type
from information_schema.routine_privileges
where specific_schema = 'public'
  and routine_name = 'book_slot'
  and grantee in ('anon', 'authenticated');

-- 3) Is the appointments table's UNIQUE constraint on time_slot_id present?
-- If absent, the race-condition guard is missing.
select conname, pg_get_constraintdef(c.oid) as definition
from pg_constraint c
join pg_class t on t.oid = c.conrelid
where t.relname = 'appointments'
  and c.contype = 'u';

-- 4) Try a dry-run book on a real slot (read-only — wraps in a rolled-back txn).
-- Replace <YOUR_SLOT_ID> with a real time_slots.id, then run.
-- begin;
--   select * from public.book_slot(
--     '<YOUR_SLOT_ID>'::uuid,
--     'Diagnostic Tester',
--     '+976 9999 0000',
--     null
--   );
-- rollback;
