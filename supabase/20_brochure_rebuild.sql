-- ============================================================================
-- Migration 20: Brochure-driven catalog rebuild.
--
-- Mirrors the printed Dentaris brochure 1:1: 12 parent categories with their
-- full set of child services (~62 rows). Every active service is bookable
-- through a shared IT Doctor service ID (35) and lives under the single
-- `dental` department (consolidated by migration 21).
--
-- Strategy:
--   1. Deactivate every existing child (parent_id IS NOT NULL).
--   2. Upsert brochure children by slug. ON CONFLICT (slug) DO UPDATE
--      refreshes identity, parent, department, price, duration, is_active
--      and itdoctor_service_id — and importantly flips matching brochure
--      slugs back to is_active = true. It does NOT overwrite jsonb content,
--      descriptions, or image URLs that admins may have edited.
--   3. Hard-delete any child still inactive — i.e. legacy rows that don't
--      match a brochure slug. Junction rows in doctor_services and
--      branch_services cascade-delete automatically. The bookings table
--      uses an integer IT Doctor service id (not a uuid FK), so payments
--      are unaffected.
--   4. Final pass: itdoctor_service_id = 35 for every active row so the
--      bookable-only filter in /book surfaces them all.
--
-- Safe to re-run.
-- ============================================================================

BEGIN;

-- 0. Re-promote the 12 brochure-parent slugs to top-level + active.
--    Migration 17 demoted some of these (e.g. `prosthetic`, `general` slugs)
--    to children of other parents, which breaks the catalog rebuild here —
--    children would inherit a demoted-and-inactive parent_id, and step 3's
--    DELETE then trips the parent_id FK because new active rows reference
--    those inactive rows.
UPDATE public.services
SET parent_id = NULL, is_active = true, updated_at = now()
WHERE slug IN (
  'cosmetic', 'diagnostic', 'prosthetic', 'orthodontics',
  'fixed-prosthetics', 'removable-prosthetics', 'implant',
  'oral-surgery', 'preventive', 'pediatric',
  'adult-treatment', 'braces-types'
);

-- 1. Deactivate every child first. Brochure slugs get flipped back to
--    is_active = true by the UPSERTs below; anything that's still false
--    afterwards is a legacy row that no longer belongs in the catalog.
UPDATE public.services
SET is_active = false, updated_at = now()
WHERE parent_id IS NOT NULL;

-- Helper macro: each block selects the parent's id + department_id, then
-- INSERTs/UPSERTs the brochure rows under it. Slug = primary identity key.

-- ----------------------------------------------------------------------------
-- 1. cosmetic — Шүдний гоо заслын эмчилгээ
-- ----------------------------------------------------------------------------
INSERT INTO public.services (
  slug, parent_id, department_id, category,
  name_mn, name_en,
  price_cents, price_text_mn, price_text_en,
  duration_min,
  itdoctor_service_id, is_active, sort_order
)
SELECT v.slug, p.id, (SELECT id FROM public.departments WHERE slug = 'dental'), 'cosmetic',
       v.name_mn, v.name_en,
       v.price_cents, v.price_text_mn, v.price_text_en,
       v.duration_min,
       35, true, v.sort_order
FROM (SELECT id FROM public.services WHERE slug ='cosmetic') p,
  (VALUES
    ('cosmetic-whitening-clinic', 'Шүд цайруулалт (эмнэлгийн нөхцөлд)', 'In-clinic teeth whitening',
       20000000, '200,000₮ - 350,000₮', '₮200,000 - ₮350,000', 90, 10),
    ('cosmetic-whitening-home',   'Шүд цайруулалт (гэрийн нөхцөлд)',   'At-home teeth whitening',
       35000000, '350,000₮',           '₮350,000',             45, 20),
    ('cosmetic-tooth-gem',        'Шүдэнд шигтгээ наах',                'Tooth gem application',
        1500000, '15,000₮',            '₮15,000',              15, 30)
  ) AS v(slug, name_mn, name_en, price_cents, price_text_mn, price_text_en, duration_min, sort_order)
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  department_id = EXCLUDED.department_id,
  category = EXCLUDED.category,
  name_mn = EXCLUDED.name_mn,
  name_en = EXCLUDED.name_en,
  price_cents = EXCLUDED.price_cents,
  price_text_mn = EXCLUDED.price_text_mn,
  price_text_en = EXCLUDED.price_text_en,
  duration_min = EXCLUDED.duration_min,
  itdoctor_service_id = EXCLUDED.itdoctor_service_id,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- ----------------------------------------------------------------------------
-- 2. diagnostic — Бусад эмчилгээ
-- ----------------------------------------------------------------------------
INSERT INTO public.services (
  slug, parent_id, department_id, category,
  name_mn, name_en,
  price_cents,
  duration_min,
  itdoctor_service_id, is_active, sort_order
)
SELECT v.slug, p.id, (SELECT id FROM public.departments WHERE slug = 'dental'), 'diagnostic',
       v.name_mn, v.name_en,
       v.price_cents,
       v.duration_min,
       35, true, v.sort_order
FROM (SELECT id FROM public.services WHERE slug ='diagnostic') p,
  (VALUES
    ('diagnostic-xray-regional',  'Хэсгийн шүдний рентген зураг',   'Regional dental X-ray',
       1500000, 10, 10),
    ('diagnostic-xray-panoramic', 'Дэлгэмэл шүдний рентген зураг',  'Panoramic dental X-ray',
       3000000, 15, 20),
    ('diagnostic-xray-lateral',   'Хажуугийн шүдний рентген зураг', 'Lateral dental X-ray',
       3000000, 15, 30),
    ('diagnostic-anesthesia',     'Мэдээ алдуулах, зүү, тариа',     'Local anesthesia / injection',
       1000000,  5, 40)
  ) AS v(slug, name_mn, name_en, price_cents, duration_min, sort_order)
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  department_id = EXCLUDED.department_id,
  category = EXCLUDED.category,
  name_mn = EXCLUDED.name_mn,
  name_en = EXCLUDED.name_en,
  price_cents = EXCLUDED.price_cents,
  duration_min = EXCLUDED.duration_min,
  itdoctor_service_id = EXCLUDED.itdoctor_service_id,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- ----------------------------------------------------------------------------
-- 3. prosthetic — Согог заслын эмчилгээ
-- ----------------------------------------------------------------------------
INSERT INTO public.services (
  slug, parent_id, department_id, category,
  name_mn, name_en,
  price_cents, price_text_mn, price_text_en,
  duration_min,
  itdoctor_service_id, is_active, sort_order
)
SELECT v.slug, p.id, (SELECT id FROM public.departments WHERE slug = 'dental'), 'prosthetic',
       v.name_mn, v.name_en,
       v.price_cents, v.price_text_mn, v.price_text_en,
       v.duration_min,
       35, true, v.sort_order
FROM (SELECT id FROM public.services WHERE slug ='prosthetic') p,
  (VALUES
    ('prosthetic-space-maintenance', 'Зай нөхөх', 'Space maintenance',
       5000000, '50,000₮',              '₮50,000',                45, 10),
    ('prosthetic-enamel',            'Паалан',    'Enamel restoration',
      12000000, '120,000₮ - 400,000₮', '₮120,000 - ₮400,000',     60, 20)
  ) AS v(slug, name_mn, name_en, price_cents, price_text_mn, price_text_en, duration_min, sort_order)
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  department_id = EXCLUDED.department_id,
  category = EXCLUDED.category,
  name_mn = EXCLUDED.name_mn,
  name_en = EXCLUDED.name_en,
  price_cents = EXCLUDED.price_cents,
  price_text_mn = EXCLUDED.price_text_mn,
  price_text_en = EXCLUDED.price_text_en,
  duration_min = EXCLUDED.duration_min,
  itdoctor_service_id = EXCLUDED.itdoctor_service_id,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- ----------------------------------------------------------------------------
-- 4. orthodontics — Гажиг заслын эмчилгээ
-- ----------------------------------------------------------------------------
INSERT INTO public.services (
  slug, parent_id, department_id, category,
  name_mn, name_en,
  price_cents, price_text_mn, price_text_en,
  duration_min,
  itdoctor_service_id, is_active, sort_order
)
SELECT v.slug, p.id, (SELECT id FROM public.departments WHERE slug = 'dental'), 'orthodontics',
       v.name_mn, v.name_en,
       v.price_cents, v.price_text_mn, v.price_text_en,
       v.duration_min,
       35, true, v.sort_order
FROM (SELECT id FROM public.services WHERE slug ='orthodontics') p,
  (VALUES
    ('ortho-diagnosis',          'Оношлогоо хийх',                  'Orthodontic diagnosis',
        5000000, NULL,                NULL,                  30, 10),
    ('ortho-expander-1side',     'Тэлэгч зэмсэг 1 талдаа',          'Expander — one side',
       15000000, NULL,                NULL,                  30, 20),
    ('ortho-expander-2side',     'Тэлэгч зэмсэг 2 талдаа',          'Expander — both sides',
       30000000, NULL,                NULL,                  30, 30),
    ('ortho-twin-block',         'Twin block',                       'Twin block appliance',
       25000000, NULL,                NULL,                  30, 40),
    ('ortho-space-keeper',       'Зай хадгалагч',                    'Space maintainer',
        5000000, NULL,                NULL,                  30, 50),
    ('ortho-face-mask',          'Face mask',                        'Face mask',
       35000000, NULL,                NULL,                  30, 60),
    ('ortho-tongue-restrainer',  'Хэл хоригч',                       'Tongue restrainer',
       15000000, NULL,                NULL,                  30, 70),
    ('ortho-followup',           'Давтан үзлэг',                     'Follow-up visit',
        2000000, '20,000₮ - 40,000₮', '₮20,000 - ₮40,000',   20, 80)
  ) AS v(slug, name_mn, name_en, price_cents, price_text_mn, price_text_en, duration_min, sort_order)
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  department_id = EXCLUDED.department_id,
  category = EXCLUDED.category,
  name_mn = EXCLUDED.name_mn,
  name_en = EXCLUDED.name_en,
  price_cents = EXCLUDED.price_cents,
  price_text_mn = EXCLUDED.price_text_mn,
  price_text_en = EXCLUDED.price_text_en,
  duration_min = EXCLUDED.duration_min,
  itdoctor_service_id = EXCLUDED.itdoctor_service_id,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- ----------------------------------------------------------------------------
-- 5. fixed-prosthetics — Авагддаггүй шүдэлбэр
-- ----------------------------------------------------------------------------
INSERT INTO public.services (
  slug, parent_id, department_id, category,
  name_mn, name_en,
  price_cents,
  duration_min,
  itdoctor_service_id, is_active, sort_order
)
SELECT v.slug, p.id, (SELECT id FROM public.departments WHERE slug = 'dental'), 'fixed-prosthetics',
       v.name_mn, v.name_en,
       v.price_cents,
       v.duration_min,
       35, true, v.sort_order
FROM (SELECT id FROM public.services WHERE slug ='fixed-prosthetics') p,
  (VALUES
    ('fixed-zirconia',         'Циркон',              'Zirconia crown',
       80000000, 60, 10),
    ('fixed-bridge',           'Гүүрэлсэн бүрээс',     'Dental bridge',
       80000000, 90, 20),
    ('fixed-porcelain-veneer', 'Шаазан нүүрэвч',       'Porcelain veneer',
       65000000, 60, 30)
  ) AS v(slug, name_mn, name_en, price_cents, duration_min, sort_order)
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  department_id = EXCLUDED.department_id,
  category = EXCLUDED.category,
  name_mn = EXCLUDED.name_mn,
  name_en = EXCLUDED.name_en,
  price_cents = EXCLUDED.price_cents,
  duration_min = EXCLUDED.duration_min,
  itdoctor_service_id = EXCLUDED.itdoctor_service_id,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- ----------------------------------------------------------------------------
-- 6. removable-prosthetics — Авагддаг шүдэлбэр (per-tooth pricing table)
-- ----------------------------------------------------------------------------
INSERT INTO public.services (
  slug, parent_id, department_id, category,
  name_mn, name_en,
  price_cents, price_text_mn, price_text_en,
  duration_min,
  itdoctor_service_id, is_active, sort_order
)
SELECT v.slug, p.id, (SELECT id FROM public.departments WHERE slug = 'dental'), 'removable-prosthetics',
       v.name_mn, v.name_en,
       v.price_cents, v.price_text_mn, v.price_text_en,
       v.duration_min,
       35, true, v.sort_order
FROM (SELECT id FROM public.services WHERE slug ='removable-prosthetics') p,
  (VALUES
    ('removable-acrylic',    'Акрилын хуванцар шүдэлбэр',           'Acrylic removable denture',
       9000000, '90,000₮ - 270,000₮',  '₮90,000 - ₮270,000',  60, 10),
    ('removable-flexible',   'Уян хуванцар шүдэлбэр',                'Flexible removable denture',
      11000000, '110,000₮ - 330,000₮', '₮110,000 - ₮330,000', 60, 20),
    ('removable-cast-metal', 'Цутгамал металл суурьтай шүдэлбэр',   'Cast-metal base denture',
      40000000, '400,000₮',             '₮400,000',            90, 30)
  ) AS v(slug, name_mn, name_en, price_cents, price_text_mn, price_text_en, duration_min, sort_order)
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  department_id = EXCLUDED.department_id,
  category = EXCLUDED.category,
  name_mn = EXCLUDED.name_mn,
  name_en = EXCLUDED.name_en,
  price_cents = EXCLUDED.price_cents,
  price_text_mn = EXCLUDED.price_text_mn,
  price_text_en = EXCLUDED.price_text_en,
  duration_min = EXCLUDED.duration_min,
  itdoctor_service_id = EXCLUDED.itdoctor_service_id,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- ----------------------------------------------------------------------------
-- 7. implant — Имплант (Korean + Japanese; refreshes mig 18 entries)
-- ----------------------------------------------------------------------------
INSERT INTO public.services (
  slug, parent_id, department_id, category,
  name_mn, name_en,
  price_cents,
  duration_min,
  itdoctor_service_id, is_active, sort_order
)
SELECT v.slug, p.id, (SELECT id FROM public.departments WHERE slug = 'dental'), 'implant',
       v.name_mn, v.name_en,
       v.price_cents,
       v.duration_min,
       35, true, v.sort_order
FROM (SELECT id FROM public.services WHERE slug ='implant') p,
  (VALUES
    ('implant-korean',   'Солонгос имплант', 'Korean implant',
       240000000, 90, 10),
    ('implant-japanese', 'Японы имплант',     'Japanese implant',
       330000000, 90, 20)
  ) AS v(slug, name_mn, name_en, price_cents, duration_min, sort_order)
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  department_id = EXCLUDED.department_id,
  category = EXCLUDED.category,
  name_mn = EXCLUDED.name_mn,
  name_en = EXCLUDED.name_en,
  price_cents = EXCLUDED.price_cents,
  duration_min = EXCLUDED.duration_min,
  itdoctor_service_id = EXCLUDED.itdoctor_service_id,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- ----------------------------------------------------------------------------
-- 8. oral-surgery — Мэс ажилбар (refreshes mig 18 entries)
-- ----------------------------------------------------------------------------
INSERT INTO public.services (
  slug, parent_id, department_id, category,
  name_mn, name_en,
  price_cents, price_text_mn, price_text_en,
  duration_min,
  itdoctor_service_id, is_active, sort_order
)
SELECT v.slug, p.id, (SELECT id FROM public.departments WHERE slug = 'dental'), 'oral-surgery',
       v.name_mn, v.name_en,
       v.price_cents, v.price_text_mn, v.price_text_en,
       v.duration_min,
       35, true, v.sort_order
FROM (SELECT id FROM public.services WHERE slug ='oral-surgery') p,
  (VALUES
    ('surgery-milk-extraction',     'Сүүн шүд авах',           'Milk tooth extraction',
       2500000, '25,000₮ - 40,000₮',  '₮25,000 - ₮40,000',     20, 10),
    ('surgery-front-extraction',    'Үүдэн шүд авах',          'Front tooth extraction',
       3500000, '35,000₮ - 45,000₮',  '₮35,000 - ₮45,000',     25, 20),
    ('surgery-small-molar',         'Бага араа шүд авах',      'Small molar extraction',
       5000000, '50,000₮ - 60,000₮',  '₮50,000 - ₮60,000',     25, 30),
    ('surgery-big-molar',           'Их араа шүд авах',         'Large molar extraction',
       7000000, '70,000₮ - 100,000₮', '₮70,000 - ₮100,000',    30, 40),
    ('surgery-root-extraction',     'Ёзоор авах (байнгийн шүд)', 'Root extraction',
       6000000, '60,000₮ - 80,000₮',  '₮60,000 - ₮80,000',     30, 50),
    ('surgery-wisdom-simple',       'Агт араа авах — Энгийн',   'Wisdom tooth — simple',
      10000000, NULL,                  NULL,                    40, 60),
    ('surgery-wisdom-partial',      'Агт араа — Хагас саатсан', 'Wisdom tooth — partially impacted',
      12000000, '120,000₮ - 150,000₮', '₮120,000 - ₮150,000',   60, 70),
    ('surgery-wisdom-impacted',     'Агт араа — Бүтэн саатсан', 'Wisdom tooth — fully impacted',
      15000000, '150,000₮ - 200,000₮', '₮150,000 - ₮200,000',   90, 80),
    ('surgery-gum-trim',            'Буйл тайрах (1 шүд)',      'Gum trim (per tooth)',
       3000000, NULL,                  NULL,                    30, 90),
    ('surgery-labial-frenectomy',   'Уруулын хөвч уртасгах',    'Labial frenectomy',
      10000000, NULL,                  NULL,                    45, 100),
    ('surgery-lingual-frenectomy',  'Хэлний хөвч уртасгах',     'Lingual frenectomy',
      15000000, NULL,                  NULL,                    45, 110)
  ) AS v(slug, name_mn, name_en, price_cents, price_text_mn, price_text_en, duration_min, sort_order)
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  department_id = EXCLUDED.department_id,
  category = EXCLUDED.category,
  name_mn = EXCLUDED.name_mn,
  name_en = EXCLUDED.name_en,
  price_cents = EXCLUDED.price_cents,
  price_text_mn = EXCLUDED.price_text_mn,
  price_text_en = EXCLUDED.price_text_en,
  duration_min = EXCLUDED.duration_min,
  itdoctor_service_id = EXCLUDED.itdoctor_service_id,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- ----------------------------------------------------------------------------
-- 9. preventive — Урьдчилан сэргийлэх эмчилгээ
-- ----------------------------------------------------------------------------
INSERT INTO public.services (
  slug, parent_id, department_id, category,
  name_mn, name_en,
  price_cents,
  duration_min,
  itdoctor_service_id, is_active, sort_order
)
SELECT v.slug, p.id, (SELECT id FROM public.departments WHERE slug = 'dental'), 'preventive',
       v.name_mn, v.name_en,
       v.price_cents,
       v.duration_min,
       35, true, v.sort_order
FROM (SELECT id FROM public.services WHERE slug ='preventive') p,
  (VALUES
    ('preventive-remineralization', 'Нөхөн эрдэсжүүлэх түрхлэг (Бүх шүд)', 'Remineralization gel (full mouth)',
       4000000, 30, 10),
    ('preventive-sealant',          'Цоорлоос хамгаалах ломбо (Sealant)',  'Sealant (cavity protection)',
       2000000, 20, 20),
    ('preventive-saforide',         'Цоорол зогсоох түрхлэг (Saforide)',   'Saforide (cavity arrest)',
        500000, 15, 30),
    ('preventive-cleaning',         'Мэргэжлийн цэвэрлэгээ, өнгөлгөө',     'Professional cleaning & polish',
       5000000, 45, 40),
    ('preventive-tartar-per-tooth', 'Шүдний чулуу түүх (1 шүд)',           'Tartar removal (per tooth)',
        500000, 15, 50)
  ) AS v(slug, name_mn, name_en, price_cents, duration_min, sort_order)
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  department_id = EXCLUDED.department_id,
  category = EXCLUDED.category,
  name_mn = EXCLUDED.name_mn,
  name_en = EXCLUDED.name_en,
  price_cents = EXCLUDED.price_cents,
  duration_min = EXCLUDED.duration_min,
  itdoctor_service_id = EXCLUDED.itdoctor_service_id,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- ----------------------------------------------------------------------------
-- 10. pediatric — Хүүхдийн эмчилгээ
-- ----------------------------------------------------------------------------
INSERT INTO public.services (
  slug, parent_id, department_id, category,
  name_mn, name_en,
  price_cents, price_text_mn, price_text_en,
  duration_min,
  itdoctor_service_id, is_active, sort_order
)
SELECT v.slug, p.id, (SELECT id FROM public.departments WHERE slug = 'dental'), 'pediatric',
       v.name_mn, v.name_en,
       v.price_cents, v.price_text_mn, v.price_text_en,
       v.duration_min,
       35, true, v.sort_order
FROM (SELECT id FROM public.services WHERE slug ='pediatric') p,
  (VALUES
    ('pediatric-baby-filling',                'Сүүн шүдний ломбо',                       'Baby tooth filling',
       4000000, NULL,                 NULL,                  30, 10),
    ('pediatric-baby-root-canal-medication',  'Сүүн шүдний сувгийн эмчилгээ — Эм тавих', 'Baby root canal — medication',
       2000000, NULL,                 NULL,                  30, 20),
    ('pediatric-baby-root-canal-cleaning',    'Сувгийн цэвэрлэгээ',                      'Baby root canal — cleaning',
       3000000, NULL,                 NULL,                  30, 30),
    ('pediatric-baby-root-canal-filling',     'Сувгийн ломбо',                            'Baby root canal — filling',
       5000000, NULL,                 NULL,                  45, 40),
    ('pediatric-baby-root-canal-drainage',    'Отток (сүүн шүд)',                         'Baby root canal — drainage',
       2500000, '25,000₮ - 30,000₮',  '₮25,000 - ₮30,000',   30, 50),
    ('pediatric-baby-extraction',             'Сүүн шүд авах',                            'Baby tooth extraction',
       2500000, '25,000₮ - 40,000₮',  '₮25,000 - ₮40,000',   20, 60)
  ) AS v(slug, name_mn, name_en, price_cents, price_text_mn, price_text_en, duration_min, sort_order)
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  department_id = EXCLUDED.department_id,
  category = EXCLUDED.category,
  name_mn = EXCLUDED.name_mn,
  name_en = EXCLUDED.name_en,
  price_cents = EXCLUDED.price_cents,
  price_text_mn = EXCLUDED.price_text_mn,
  price_text_en = EXCLUDED.price_text_en,
  duration_min = EXCLUDED.duration_min,
  itdoctor_service_id = EXCLUDED.itdoctor_service_id,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- ----------------------------------------------------------------------------
-- 11. adult-treatment — Насанд хүрэгчдийн эмчилгээ
-- ----------------------------------------------------------------------------
INSERT INTO public.services (
  slug, parent_id, department_id, category,
  name_mn, name_en,
  price_cents, price_text_mn, price_text_en,
  duration_min,
  itdoctor_service_id, is_active, sort_order
)
SELECT v.slug, p.id, (SELECT id FROM public.departments WHERE slug = 'dental'), 'adult-treatment',
       v.name_mn, v.name_en,
       v.price_cents, v.price_text_mn, v.price_text_en,
       v.duration_min,
       35, true, v.sort_order
FROM (SELECT id FROM public.services WHERE slug ='adult-treatment') p,
  (VALUES
    ('adult-cavity-shallow',      'Өнгөц цоорлын эмчилгээ',  'Shallow cavity treatment',
       7500000, NULL,                  NULL,                   45, 10),
    ('adult-cavity-medium',       'Дунд цоорлын эмчилгээ',    'Medium cavity treatment',
       8500000, NULL,                  NULL,                   60, 20),
    ('adult-cavity-deep',         'Гүн цоорлын эмчилгээ',     'Deep cavity treatment',
       9500000, NULL,                  NULL,                   75, 30),
    ('adult-temp-filling',        'Хяналтын ломбо (Түр ломбо)', 'Temporary filling',
       3000000, NULL,                  NULL,                   30, 40),
    ('adult-post',                'Пост (шүдний цөгц сэргээх)','Dental post / core build-up',
      15000000, '150,000₮ - 170,000₮', '₮150,000 - ₮170,000',  60, 50),
    ('adult-root-canal-first',    'Эхний ирэлт суваг цэвэрлэгээ', 'Root canal — initial cleaning',
       6500000, '65,000₮ - 75,000₮',   '₮65,000 - ₮75,000',    60, 60),
    ('adult-root-canal-repeat',   'Давтан ирэлт суваг угаах',     'Root canal — repeat irrigation',
       3000000, '30,000₮ - 40,000₮',   '₮30,000 - ₮40,000',    45, 70),
    ('adult-root-canal-fill',     'Суваг ломбодох',               'Root canal — sealing',
      10000000, '100,000₮ - 120,000₮', '₮100,000 - ₮120,000',  60, 80),
    ('adult-root-canal-drainage', 'Отток (байнгийн шүд)',         'Root canal — drainage',
       6000000, '60,000₮ - 75,000₮',   '₮60,000 - ₮75,000',    45, 90)
  ) AS v(slug, name_mn, name_en, price_cents, price_text_mn, price_text_en, duration_min, sort_order)
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  department_id = EXCLUDED.department_id,
  category = EXCLUDED.category,
  name_mn = EXCLUDED.name_mn,
  name_en = EXCLUDED.name_en,
  price_cents = EXCLUDED.price_cents,
  price_text_mn = EXCLUDED.price_text_mn,
  price_text_en = EXCLUDED.price_text_en,
  duration_min = EXCLUDED.duration_min,
  itdoctor_service_id = EXCLUDED.itdoctor_service_id,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- ----------------------------------------------------------------------------
-- 12. braces-types — Шүдний аппаратны төрлүүд
-- ----------------------------------------------------------------------------
INSERT INTO public.services (
  slug, parent_id, department_id, category,
  name_mn, name_en,
  price_cents, price_text_mn, price_text_en,
  duration_min,
  itdoctor_service_id, is_active, sort_order
)
SELECT v.slug, p.id, (SELECT id FROM public.departments WHERE slug = 'dental'), 'braces-types',
       v.name_mn, v.name_en,
       v.price_cents, v.price_text_mn, v.price_text_en,
       v.duration_min,
       35, true, v.sort_order
FROM (SELECT id FROM public.services WHERE slug ='braces-types') p,
  (VALUES
    ('braces-metal',              'Металл аппарат',                  'Metal braces',
      144000000, NULL,           NULL,            60, 10),
    ('braces-ceramic',            'Шаазан аппарат',                  'Ceramic braces',
      180000000, NULL,           NULL,            60, 20),
    ('braces-sapphire',           'Сафир аппарат',                   'Sapphire braces',
      198000000, NULL,           NULL,            60, 30),
    ('braces-self-lig-metal',     'Өөрөө түгжээтэй металл аппарат',  'Self-ligating metal braces',
      200000000, NULL,           NULL,            60, 40),
    ('braces-self-lig-ceramic',   'Өөрөө түгжээтэй шаазан аппарат',  'Self-ligating ceramic braces',
      220000000, NULL,           NULL,            60, 50),
    ('braces-aligner',            'Авагддаг элайнэр аппарат',         'Clear aligner',
       20000000, '200,000₮ / 1 хуудас', '₮200,000 / sheet', 30, 60)
  ) AS v(slug, name_mn, name_en, price_cents, price_text_mn, price_text_en, duration_min, sort_order)
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  department_id = EXCLUDED.department_id,
  category = EXCLUDED.category,
  name_mn = EXCLUDED.name_mn,
  name_en = EXCLUDED.name_en,
  price_cents = EXCLUDED.price_cents,
  price_text_mn = EXCLUDED.price_text_mn,
  price_text_en = EXCLUDED.price_text_en,
  duration_min = EXCLUDED.duration_min,
  itdoctor_service_id = EXCLUDED.itdoctor_service_id,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- ----------------------------------------------------------------------------
-- Hard-delete every child that's still inactive — these are the legacy rows
-- that pre-dated the brochure (crown-zirconia, whitening-full, tartar-removal-*,
-- etc.) and were not refreshed by any UPSERT above. doctor_services and
-- branch_services rows cascade away automatically.
--
-- Done in an iterative loop because services.parent_id is a self-FK without
-- ON DELETE CASCADE — if legacy data has a 3-level hierarchy, we need to
-- delete leaves first, then the now-childless middle rows, then their
-- parents. Loops until no more inactive children can be deleted in a pass.
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  deleted_count int;
BEGIN
  LOOP
    DELETE FROM public.services
    WHERE parent_id IS NOT NULL
      AND is_active = false
      AND id NOT IN (
        SELECT parent_id FROM public.services WHERE parent_id IS NOT NULL
      );
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    EXIT WHEN deleted_count = 0;
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- Final pass: every active service (parents + children) gets the shared
-- IT Doctor service ID so the bookable-only filter surfaces all of them.
-- ----------------------------------------------------------------------------
UPDATE public.services
SET itdoctor_service_id = 35, updated_at = now()
WHERE is_active = true AND itdoctor_service_id IS DISTINCT FROM 35;

COMMIT;
