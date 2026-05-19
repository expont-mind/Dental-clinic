-- ============================================================================
-- Dentexgo v1.2 — branches as first-class entities, plus per-service /
-- per-doctor branch assignment via join tables. Additive and re-runnable.
--
-- Contract reference: docs/integration-contract-dentexgo.md (v1.2).
-- The absence of any rows in service_branches / doctor_branches for a given
-- service / doctor encodes the "available at all branches" default — the
-- API transforms emit an empty branchIds array in that case, which Dentexgo
-- treats as "all branches".
-- ============================================================================

create table if not exists public.branches (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name_mn     text not null,
  name_en     text not null,
  address_mn  text,
  address_en  text,
  phone       text,
  hours       jsonb not null default
    '{"mon":null,"tue":null,"wed":null,"thu":null,"fri":null,"sat":null,"sun":null}'::jsonb,
  timezone    text not null default 'Asia/Ulaanbaatar',
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists branches_active_idx on public.branches(sort_order) where is_active;

drop trigger if exists set_updated_at on public.branches;
create trigger set_updated_at
  before update on public.branches
  for each row execute function public.set_updated_at();

alter table public.branches enable row level security;

drop policy if exists "branches_read_public" on public.branches;
create policy "branches_read_public" on public.branches
  for select to anon, authenticated using (true);

drop policy if exists "branches_write_authed" on public.branches;
create policy "branches_write_authed" on public.branches
  for all to authenticated using (true) with check (true);

-- ----------------------------------------------------------------------------
-- service_branches: empty rowset for a service = "available at all branches".
-- ----------------------------------------------------------------------------
create table if not exists public.service_branches (
  service_id uuid not null references public.services(id) on delete cascade,
  branch_id  uuid not null references public.branches(id) on delete cascade,
  primary key (service_id, branch_id)
);
create index if not exists service_branches_branch_idx on public.service_branches(branch_id);

alter table public.service_branches enable row level security;

drop policy if exists "service_branches_read_public" on public.service_branches;
create policy "service_branches_read_public" on public.service_branches
  for select to anon, authenticated using (true);

drop policy if exists "service_branches_write_authed" on public.service_branches;
create policy "service_branches_write_authed" on public.service_branches
  for all to authenticated using (true) with check (true);

-- ----------------------------------------------------------------------------
-- doctor_branches: same semantics. Empty rowset = "works at all branches".
-- ----------------------------------------------------------------------------
create table if not exists public.doctor_branches (
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete cascade,
  primary key (doctor_id, branch_id)
);
create index if not exists doctor_branches_branch_idx on public.doctor_branches(branch_id);

alter table public.doctor_branches enable row level security;

drop policy if exists "doctor_branches_read_public" on public.doctor_branches;
create policy "doctor_branches_read_public" on public.doctor_branches
  for select to anon, authenticated using (true);

drop policy if exists "doctor_branches_write_authed" on public.doctor_branches;
create policy "doctor_branches_write_authed" on public.doctor_branches
  for all to authenticated using (true) with check (true);
