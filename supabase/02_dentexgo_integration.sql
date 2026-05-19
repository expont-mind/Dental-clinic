-- ============================================================================
-- Dentexgo integration — additive migration on top of schema.sql.
-- Re-runnable. Adds clinic_profile + services tables, is_active/updated_at
-- columns, updated_at triggers, public-read RLS for new tables, and seeds
-- the 9 SERVICE_CATALOG items from src/lib/data/services.ts.
-- Apply via: Supabase Dashboard → SQL Editor → New query → paste → run.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Shared trigger: sets updated_at on UPDATE. Dentexgo's daily resync compares
-- timestamps to skip re-embedding unchanged rows.
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- DEPARTMENTS: add is_active + updated_at
-- ----------------------------------------------------------------------------
alter table public.departments
  add column if not exists is_active  boolean     not null default true,
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists set_updated_at on public.departments;
create trigger set_updated_at
  before update on public.departments
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- DOCTORS: add updated_at (is_active already exists)
-- ----------------------------------------------------------------------------
alter table public.doctors
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists set_updated_at on public.doctors;
create trigger set_updated_at
  before update on public.doctors
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- SERVICES: promoted from src/lib/data/services.ts SERVICE_CATALOG.
-- price_cents / duration_min are nullable so the migration succeeds without
-- guessing numbers; admin fills them in through /admin/services.
-- ----------------------------------------------------------------------------
create table if not exists public.services (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  department_id   uuid not null references public.departments(id) on delete restrict,
  name_mn         text not null,
  name_en         text not null,
  description_mn  text,
  description_en  text,
  category        text,
  price_cents     bigint,
  currency        text not null default 'MNT',
  duration_min    int,
  is_active       boolean not null default true,
  sort_order      int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists services_department_idx on public.services(department_id);
create index if not exists services_active_idx on public.services(sort_order) where is_active;

drop trigger if exists set_updated_at on public.services;
create trigger set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

alter table public.services enable row level security;

drop policy if exists "services_read_public" on public.services;
create policy "services_read_public" on public.services
  for select to anon, authenticated using (true);

drop policy if exists "services_write_authed" on public.services;
create policy "services_write_authed" on public.services
  for all to authenticated using (true) with check (true);

-- ----------------------------------------------------------------------------
-- CLINIC_PROFILE: singleton row. The boolean PK + CHECK pins it to one row.
-- ----------------------------------------------------------------------------
create table if not exists public.clinic_profile (
  singleton    boolean primary key default true check (singleton),
  slug         text not null,
  name_mn      text not null default '',
  name_en      text not null default '',
  address_mn   text,
  address_en   text,
  phone        text,
  insurance_mn text,
  insurance_en text,
  timezone     text not null default 'Asia/Ulaanbaatar',
  hours        jsonb not null default
    '{"mon":null,"tue":null,"wed":null,"thu":null,"fri":null,"sat":null,"sun":null}'::jsonb,
  updated_at   timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.clinic_profile;
create trigger set_updated_at
  before update on public.clinic_profile
  for each row execute function public.set_updated_at();

alter table public.clinic_profile enable row level security;

drop policy if exists "clinic_profile_read_public" on public.clinic_profile;
create policy "clinic_profile_read_public" on public.clinic_profile
  for select to anon, authenticated using (true);

drop policy if exists "clinic_profile_write_authed" on public.clinic_profile;
create policy "clinic_profile_write_authed" on public.clinic_profile
  for all to authenticated using (true) with check (true);

insert into public.clinic_profile (
  singleton, slug, name_mn, name_en, address_mn, address_en,
  phone, insurance_mn, insurance_en, hours
) values (
  true,
  'dentaris',
  'Dentaris Dental Clinic',
  'Dentaris Dental Clinic',
  'Улаанбаатар хот, Сүхбаатар дүүрэг',
  'Ulaanbaatar, Sukhbaatar district',
  '+976 7700 0000',
  null,
  null,
  '{"mon":"09:00-18:00","tue":"09:00-18:00","wed":"09:00-18:00","thu":"09:00-18:00","fri":"09:00-18:00","sat":"09:00-14:00","sun":null}'::jsonb
)
on conflict (singleton) do nothing;

-- ----------------------------------------------------------------------------
-- SEED DENTAL DEPARTMENTS. The base schema's seed.sql carries a generic-
-- hospital taxonomy (internal/cardiology/etc) that doesn't match the slugs
-- the dental clinic code expects. We add the dental taxonomy here without
-- disturbing existing rows.
-- ----------------------------------------------------------------------------
insert into public.departments (slug, name_mn, name_en, description_mn, description_en, icon_key, sort_order)
values
  ('general',       'Ерөнхий шүдний эмчилгээ',  'General Dentistry',
                    'Шүдний цэвэрлэгээ, ломбо, үзлэг — гэр бүлийн шүдний үйлчилгээ.',
                    'Cleaning, fillings and check-ups — everyday dental care for the whole family.',
                    'tooth',     10),
  ('cosmetic',      'Гоо засал',                'Cosmetic Dentistry',
                    'Шүд цайруулах, винир, инээмсэглэлийн дизайн.',
                    'Whitening, veneers and full smile design.',
                    'sparkles',  20),
  ('orthodontics',  'Гажиг засал',              'Orthodontics',
                    'Брэкэт, шууд биш системийн эмчилгээ — нүүр амны гажиг засал.',
                    'Braces, clear aligners and bite correction.',
                    'align',     30),
  ('pediatric',     'Хүүхдийн шүдний эмчилгээ', 'Pediatric Dentistry',
                    'Хүүхдэд ээлтэй, тайван орчинд хийгддэг шүдний үйлчилгээ.',
                    'Gentle, kid-friendly dental care from baby teeth onward.',
                    'baby',      40),
  ('restorative',   'Имплант ба сэргээх эмчилгээ', 'Implant & Restorative',
                    'Шүдний имплант, бүрээс, гүүр — сэргээх цогц шийдэл.',
                    'Implants, crowns and bridges — full restorative solutions.',
                    'implant',   50)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- SEED SERVICES from SERVICE_CATALOG. Each row joins departments.slug to get
-- the FK. Idempotent via unique slug + on conflict do nothing.
-- ----------------------------------------------------------------------------
insert into public.services (slug, department_id, name_mn, name_en, description_mn, description_en, sort_order)
select 'implant', d.id, 'Имплант', 'Implant',
  'хиймэл шүд, авагддаг авагддагүй шүдэлбэр',
  'dental implants, removable & fixed prosthetics',
  10
from public.departments d where d.slug = 'restorative'
on conflict (slug) do nothing;

insert into public.services (slug, department_id, name_mn, name_en, description_mn, description_en, sort_order)
select 'orthodontics', d.id, 'Шүдний гажиг засал', 'Orthodontics',
  'шүдний аппарат төрөл, үнэ ханш',
  'braces, aligners and bite correction',
  20
from public.departments d where d.slug = 'orthodontics'
on conflict (slug) do nothing;

insert into public.services (slug, department_id, name_mn, name_en, description_mn, description_en, sort_order)
select 'oral-surgery', d.id, 'Шүдний мэс заслын эмчилгээ', 'Oral surgery',
  'шүд авах, агт араа авах, шүдний мэс засал',
  'extractions, wisdom teeth, surgical dentistry',
  30
from public.departments d where d.slug = 'restorative'
on conflict (slug) do nothing;

insert into public.services (slug, department_id, name_mn, name_en, description_mn, description_en, sort_order)
select 'pediatric', d.id, 'Хүүхдийн шүд', 'Pediatric dentistry',
  'сүүн шүд, ломбо, угаах заалт, урьдчилан сэргийлэлт',
  'baby teeth, fillings, brushing & prevention',
  40
from public.departments d where d.slug = 'pediatric'
on conflict (slug) do nothing;

insert into public.services (slug, department_id, name_mn, name_en, description_mn, description_en, sort_order)
select 'general', d.id, 'Байнгын шүдний эмчилгээ', 'Routine dentistry',
  'ломбо, цайруулалт, фторт түрхлэг, шүдний чулуу',
  'fillings, whitening, fluoride, tartar removal',
  50
from public.departments d where d.slug = 'general'
on conflict (slug) do nothing;

insert into public.services (slug, department_id, name_mn, name_en, description_mn, description_en, sort_order)
select 'hygiene', d.id, 'Нүүр амны эрүүл ахуй', 'Oral hygiene',
  'бүх шүдний цэвэрлэгээ, шүд угаах заалт',
  'professional cleaning, brushing coaching',
  60
from public.departments d where d.slug = 'general'
on conflict (slug) do nothing;

insert into public.services (slug, department_id, name_mn, name_en, description_mn, description_en, sort_order)
select 'prosthetic', d.id, 'Согог заслын эмчилгээ', 'Prosthetic dentistry',
  'метал бүрээс, циркон бүрээс, хиймэл шүд',
  'metal crowns, zirconia crowns, prosthetics',
  70
from public.departments d where d.slug = 'restorative'
on conflict (slug) do nothing;

insert into public.services (slug, department_id, name_mn, name_en, description_mn, description_en, sort_order)
select 'periodontics', d.id, 'Шүдний тулгуур эд эмчилгээ', 'Periodontics',
  'буйл эмчилгээ, шүд сулрах, нөхөн сэргээх',
  'gum treatment, loose teeth, regeneration',
  80
from public.departments d where d.slug = 'general'
on conflict (slug) do nothing;

insert into public.services (slug, department_id, name_mn, name_en, description_mn, description_en, sort_order)
select 'cosmetic', d.id, 'Hollywood Smile', 'Hollywood Smile',
  'тэгш сайхан, өнгөлөг цагаан шүд',
  'perfect, bright white smile',
  90
from public.departments d where d.slug = 'cosmetic'
on conflict (slug) do nothing;
