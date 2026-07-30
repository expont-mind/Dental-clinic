-- ============================================================================
-- Migration: RLS for doctor_services
--
-- doctor_services was created in 09_doctor_services.sql without any RLS
-- policies. The admin write path bypasses RLS via the service-role client,
-- so assignments DO get saved — but every anon read (`listDoctorsForService`
-- on the public booking page, `listServiceIdsForDoctor` for the admin edit
-- form's pre-checked boxes) returns 0 rows. The result: admins assign
-- services to doctors, the form looks like nothing was saved, and the
-- public service page falls back to "show all iDoctor dentists".
--
-- Mirror the policies that `doctor_branches` already has in 05_branches.sql:
-- read-public, write-authed. Idempotent: safe to re-run.
-- ============================================================================

alter table public.doctor_services enable row level security;

drop policy if exists "doctor_services_read_public" on public.doctor_services;
create policy "doctor_services_read_public" on public.doctor_services
  for select using (true);

drop policy if exists "doctor_services_write_authed" on public.doctor_services;
create policy "doctor_services_write_authed" on public.doctor_services
  for all to authenticated using (true) with check (true);

-- Confirm
select count(*) as doctor_service_links from public.doctor_services;
