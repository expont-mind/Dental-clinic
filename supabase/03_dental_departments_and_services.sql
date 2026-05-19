-- ============================================================================
-- Patch: seed the 5 dental departments + re-run the 9 service inserts.
-- Run after 02_dentexgo_integration.sql. Idempotent.
--
-- Why this is needed: the existing departments table in this project is
-- leftover from a generic hospital (internal, pediatrics, cardiology,
-- dermatology, dental) — none of which match the slugs the dental clinic
-- code expects. We add the dental taxonomy without disturbing existing
-- doctors (they keep their legacy department_id values).
-- ============================================================================

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

-- Re-run the service inserts now that the FKs resolve. Already idempotent
-- via unique slug + on conflict do nothing.
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
