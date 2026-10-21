-- ============================================================================
-- Migration: public contact fields on clinic_profile.
--
-- WHY: the site footer, contact page and landing hero showed hardcoded contact
-- details from the i18n dictionaries (hello@dentaris.mn, +976 7700 0909, social
-- links pointing at "#"). Phone/address/hours already live on clinic_profile;
-- this adds the remaining fields so /admin/clinic is the single source.
--
-- Re-runnable. Apply via: Supabase Dashboard → SQL Editor → paste → run.
-- Existing RLS (clinic_profile_read_public) already covers the new columns.
-- ============================================================================

alter table public.clinic_profile
  add column if not exists email         text,
  add column if not exists facebook_url  text,
  add column if not exists instagram_url text,
  add column if not exists youtube_url   text;

-- Make the API see the new columns right away instead of failing the admin
-- save with "column not found" until the schema cache refreshes.
notify pgrst, 'reload schema';
