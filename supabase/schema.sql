-- ============================================================================
-- Hospital booking system — Supabase Postgres schema
-- Apply via: Supabase Dashboard → SQL Editor → New query → paste → run.
-- Order matters: tables → RLS policies → RPC functions.
-- ============================================================================

-- Make sure pgcrypto is available for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- DEPARTMENTS — clinic departments / тэнхимүүд
-- ----------------------------------------------------------------------------
create table if not exists public.departments (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name_mn       text not null,
  name_en       text not null,
  description_mn text,
  description_en text,
  icon_key      text,                        -- short key e.g. "stethoscope"
  sort_order    int  not null default 0,
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- DOCTORS
-- ----------------------------------------------------------------------------
create table if not exists public.doctors (
  id            uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete restrict,
  slug          text not null unique,
  name_mn       text not null,
  name_en       text not null,
  title_mn      text,
  title_en      text,
  bio_mn        text,
  bio_en        text,
  photo_url     text,
  years_exp     int,
  is_active     boolean not null default true,
  sort_order    int  not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists doctors_department_idx on public.doctors(department_id);

-- ----------------------------------------------------------------------------
-- TIME SLOTS — pre-generated rows. UNIQUE keeps generator idempotent.
-- ----------------------------------------------------------------------------
create table if not exists public.time_slots (
  id          uuid primary key default gen_random_uuid(),
  doctor_id   uuid not null references public.doctors(id) on delete cascade,
  slot_start  timestamptz not null,
  slot_end    timestamptz not null,
  is_booked   boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (doctor_id, slot_start)
);
create index if not exists time_slots_doctor_start_idx
  on public.time_slots(doctor_id, slot_start);
create index if not exists time_slots_available_idx
  on public.time_slots(slot_start) where is_booked = false;

-- ----------------------------------------------------------------------------
-- APPOINTMENTS
-- The UNIQUE on time_slot_id is the only correct race-condition guard.
-- ----------------------------------------------------------------------------
create table if not exists public.appointments (
  id            uuid primary key default gen_random_uuid(),
  time_slot_id  uuid not null references public.time_slots(id) on delete restrict,
  patient_name  text not null,
  patient_phone text not null,
  patient_notes text,
  status        text not null default 'confirmed'
                check (status in ('confirmed', 'completed', 'cancelled')),
  created_at    timestamptz not null default now(),
  unique (time_slot_id)
);
create index if not exists appointments_status_idx on public.appointments(status);
create index if not exists appointments_created_idx on public.appointments(created_at desc);

-- ============================================================================
-- ROW LEVEL SECURITY
-- Anonymous (public site) can read static catalog tables and INSERT bookings.
-- Authenticated (admin) can do anything.
-- ============================================================================

alter table public.departments  enable row level security;
alter table public.doctors      enable row level security;
alter table public.time_slots   enable row level security;
alter table public.appointments enable row level security;

-- DEPARTMENTS: public read; admin write.
drop policy if exists "departments_read_public" on public.departments;
create policy "departments_read_public" on public.departments
  for select to anon, authenticated using (true);

drop policy if exists "departments_write_authed" on public.departments;
create policy "departments_write_authed" on public.departments
  for all to authenticated using (true) with check (true);

-- DOCTORS: public read (active only is filtered in queries); admin write.
drop policy if exists "doctors_read_public" on public.doctors;
create policy "doctors_read_public" on public.doctors
  for select to anon, authenticated using (true);

drop policy if exists "doctors_write_authed" on public.doctors;
create policy "doctors_write_authed" on public.doctors
  for all to authenticated using (true) with check (true);

-- TIME SLOTS: public read; admin write.
-- The booking RPC runs as security definer, so anon doesn't need direct UPDATE.
drop policy if exists "time_slots_read_public" on public.time_slots;
create policy "time_slots_read_public" on public.time_slots
  for select to anon, authenticated using (true);

drop policy if exists "time_slots_write_authed" on public.time_slots;
create policy "time_slots_write_authed" on public.time_slots
  for all to authenticated using (true) with check (true);

-- APPOINTMENTS: anon CANNOT directly read or insert; goes through RPC only.
-- This protects patient PII. Admin reads/updates everything.
drop policy if exists "appointments_admin_all" on public.appointments;
create policy "appointments_admin_all" on public.appointments
  for all to authenticated using (true) with check (true);

-- ============================================================================
-- BOOKING RPC — atomic insert with race-condition protection
-- Runs as security definer so it bypasses RLS for the carefully-scoped writes.
-- ============================================================================

-- IMPORTANT: drop any prior signature so re-runs don't leave stale overloads
drop function if exists public.book_slot(uuid, text, text, text);

create or replace function public.book_slot(
  p_time_slot_id uuid,
  p_patient_name text,
  p_patient_phone text,
  p_patient_notes text default null
)
returns table (
  out_appointment_id uuid,
  out_slot_start     timestamptz,
  out_slot_end       timestamptz,
  out_doctor_id      uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_appointment_id uuid;
  v_slot_start     timestamptz;
  v_slot_end       timestamptz;
  v_doctor_id      uuid;
  v_is_booked      boolean;
begin
  -- Trim + validate inputs
  if p_patient_name is null or btrim(p_patient_name) = '' then
    raise exception 'patient_name_required';
  end if;
  if p_patient_phone is null or btrim(p_patient_phone) = '' then
    raise exception 'patient_phone_required';
  end if;

  -- Lock the slot row. Qualify columns with the table to avoid clashing
  -- with the function's OUT parameter names.
  select ts.slot_start, ts.slot_end, ts.doctor_id, ts.is_booked
    into v_slot_start, v_slot_end, v_doctor_id, v_is_booked
    from public.time_slots ts
   where ts.id = p_time_slot_id
   for update;

  if not found then
    raise exception 'slot_not_found';
  end if;

  if v_is_booked then
    raise exception 'slot_already_booked';
  end if;

  if v_slot_start <= now() then
    raise exception 'slot_in_the_past';
  end if;

  -- Insert appointment; the UNIQUE on time_slot_id makes this race-safe.
  insert into public.appointments (
    time_slot_id, patient_name, patient_phone, patient_notes
  ) values (
    p_time_slot_id, btrim(p_patient_name), btrim(p_patient_phone), p_patient_notes
  )
  on conflict (time_slot_id) do nothing
  returning id into v_appointment_id;

  if v_appointment_id is null then
    raise exception 'slot_already_booked';
  end if;

  update public.time_slots
     set is_booked = true
   where id = p_time_slot_id;

  out_appointment_id := v_appointment_id;
  out_slot_start     := v_slot_start;
  out_slot_end       := v_slot_end;
  out_doctor_id      := v_doctor_id;
  return next;
end;
$$;

-- Anyone (including anonymous patients) can call book_slot. The function
-- itself enforces every safety check.
grant execute on function public.book_slot(uuid, text, text, text)
  to anon, authenticated;

-- ============================================================================
-- ADMIN HELPER — bulk slot generation
-- ============================================================================

create or replace function public.generate_slots(
  p_doctor_id   uuid,
  p_from_date   date,
  p_to_date     date,
  p_start_time  time default '09:00',
  p_end_time    time default '17:00',
  p_minutes     int  default 30,
  p_skip_weekend boolean default true
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_d date;
  v_t timestamptz;
  v_inserted int := 0;
begin
  v_d := p_from_date;
  while v_d <= p_to_date loop
    if p_skip_weekend and extract(isodow from v_d) in (6, 7) then
      v_d := v_d + 1;
      continue;
    end if;
    v_t := (v_d::text || ' ' || p_start_time::text)::timestamptz at time zone 'Asia/Ulaanbaatar';
    while v_t < (v_d::text || ' ' || p_end_time::text)::timestamptz at time zone 'Asia/Ulaanbaatar' loop
      insert into public.time_slots (doctor_id, slot_start, slot_end)
      values (p_doctor_id, v_t, v_t + (p_minutes || ' minutes')::interval)
      on conflict (doctor_id, slot_start) do nothing;
      get diagnostics v_inserted = row_count;
      v_t := v_t + (p_minutes || ' minutes')::interval;
    end loop;
    v_d := v_d + 1;
  end loop;
  return v_inserted;
end;
$$;

revoke execute on function public.generate_slots(uuid, date, date, time, time, int, boolean) from public;
grant execute on function public.generate_slots(uuid, date, date, time, time, int, boolean) to authenticated;
