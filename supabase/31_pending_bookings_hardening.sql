-- ============================================================================
-- Migration: lock down pending_bookings (and feedback), add failure diagnostics,
-- shorten the payment hold window to 5 minutes.
--
-- WHY: 12_booking_payment.sql created pending_bookings without enabling row
-- level security. Every other table in this schema enables it. Supabase grants
-- anon/authenticated DML on public-schema tables by default and the anon key
-- ships in the browser bundle — so patient names, phone numbers, notes and
-- appointment times were world-readable, and anyone could UPDATE or DELETE the
-- whole booking table.
--
-- The application only ever touches pending_bookings through the service-role
-- client (createSupabaseAdmin), and service_role bypasses RLS. So the correct
-- posture is: RLS on, privileges revoked, and NO policies at all.
-- ============================================================================

-- 1. pending_bookings — service_role only ------------------------------------

alter table public.pending_bookings enable row level security;

-- Belt and braces: RLS alone leaves the GRANTs in place, and a future policy
-- added by mistake would immediately expose the table.
revoke all on public.pending_bookings from anon, authenticated;

-- Deliberately no CREATE POLICY statements here. With RLS enabled and no
-- policy, anon/authenticated see zero rows and can write none, while
-- service_role continues to work.

-- 2. Failure diagnostics ------------------------------------------------------

-- Reason a fulfil attempt failed, so the admin retry button shows the cause
-- instead of a bare "failed" badge.
alter table public.pending_bookings
  add column if not exists last_error text;

comment on column public.pending_bookings.last_error is
  'Last fulfilment error (IT Doctor / QPay). Cleared on success.';

-- 3. Payment hold window: 15 → 5 minutes -------------------------------------

-- The slot picker now hides slots held by unpaid pending rows, so this value is
-- also how long one abandoned attempt can block a slot for everyone else.
alter table public.pending_bookings
  alter column expires_at set default (now() + interval '5 minutes');

-- 4. Index for the slot-hold lookup ------------------------------------------

-- api/booking/slots queries by branch + day-prefixed slot_datetime.
create index if not exists idx_pending_bookings_hold
  on public.pending_bookings (branch_id, slot_datetime);

-- The old partial index only covered status = 'pending'; the hold query also
-- reads 'processing' and 'paid'.
create index if not exists idx_pending_bookings_status_all
  on public.pending_bookings (status);

-- 5. feedback — same treatment, if the table exists --------------------------

-- `feedback` was created by hand rather than by a migration in this repo, so
-- guard on its existence. Patient messages are at least as sensitive as
-- bookings; reads/writes go through the server, never the browser.
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'feedback'
  ) then
    execute 'alter table public.feedback enable row level security';
    execute 'revoke all on public.feedback from anon, authenticated';
    -- The public contact form submits through a server action using the
    -- service-role client, so anon needs no INSERT grant of its own.
  end if;
end $$;

-- 6. Verify -------------------------------------------------------------------

-- Expect rls_enabled = true and policy_count = 0 for both tables.
-- select
--   c.relname            as table_name,
--   c.relrowsecurity     as rls_enabled,
--   count(p.polname)     as policy_count
-- from pg_class c
-- join pg_namespace n on n.oid = c.relnamespace
-- left join pg_policy p on p.polrelid = c.oid
-- where n.nspname = 'public' and c.relname in ('pending_bookings', 'feedback')
-- group by 1, 2;
