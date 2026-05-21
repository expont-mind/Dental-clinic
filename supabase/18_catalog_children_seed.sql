-- ============================================================================
-- Migration: Seed every child service from the printed Dentaris catalog.
-- Parents are categories (we don't treat them as bookable services); their
-- children are the actual bookable rows. This migration fills in the missing
-- children so the website mirrors the brochure 1:1.
--
-- Strategy:
--   - For each catalog section, INSERT children with a predictable slug
--     (e.g. `implant-korean`, `surgery-milk-extraction`).
--   - ON CONFLICT (slug) DO NOTHING — safe to re-run; never overwrites
--     anything an admin may have edited via the UI.
--   - Each child inherits its parent's department_id.
--   - Bookable services get itdoctor_service_id = 35 (your default).
--   - Price ranges use price_text_{mn,en}; single prices use price_cents
--     (cents = ₮ × 100, e.g. ₮2,400,000 → 240000000).
--
-- After running this, you'll likely want to deactivate legacy single-child
-- placeholders (e.g. `implant-single` named "Dental Implant") via
-- /admin/services since they're duplicated by the new specific variants.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. IMPLANT — Korean + Japanese variants
-- ----------------------------------------------------------------------------
INSERT INTO public.services (
  slug, parent_id, department_id,
  name_mn, name_en,
  description_mn, description_en,
  price_cents, duration_min,
  itdoctor_service_id, is_active, sort_order
)
SELECT v.slug, p.id, p.department_id,
       v.name_mn, v.name_en,
       v.description_mn, v.description_en,
       v.price_cents, v.duration_min,
       35, true, v.sort_order
FROM (SELECT id, department_id FROM public.services WHERE slug = 'implant') p,
  (VALUES
    ('implant-korean',   'Солонгос имплант',  'Korean Implant',
     'Чанарын баталгаатай Солонгосын имплант систем.',
     'Quality-guaranteed Korean implant system.',
     240000000, 90, 10),
    ('implant-japanese', 'Японы имплант',     'Japanese Implant',
     'Премиум Японы имплант систем.',
     'Premium Japanese implant system.',
     330000000, 90, 20)
  ) AS v(slug, name_mn, name_en, description_mn, description_en, price_cents, duration_min, sort_order)
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. ORAL SURGERY — 11 services from "Мэс ажилбар" page
-- ----------------------------------------------------------------------------
INSERT INTO public.services (
  slug, parent_id, department_id,
  name_mn, name_en,
  price_cents, price_text_mn, price_text_en,
  duration_min,
  itdoctor_service_id, is_active, sort_order
)
SELECT v.slug, p.id, p.department_id,
       v.name_mn, v.name_en,
       v.price_cents, v.price_text_mn, v.price_text_en,
       v.duration_min,
       35, true, v.sort_order
FROM (SELECT id, department_id FROM public.services WHERE slug = 'oral-surgery') p,
  (VALUES
    ('surgery-milk-extraction',        'Сүүн шүд авах',          'Milk tooth extraction',
       2500000, '25,000₮ - 40,000₮',  '₮25,000 - ₮40,000',     20, 10),
    ('surgery-front-extraction',       'Үүдэн шүд авах',         'Front tooth extraction',
       3500000, '35,000₮ - 45,000₮',  '₮35,000 - ₮45,000',     25, 20),
    ('surgery-small-molar-extraction', 'Бага араа шүд авах',     'Small molar extraction',
       5000000, '50,000₮ - 60,000₮',  '₮50,000 - ₮60,000',     25, 30),
    ('surgery-big-molar-extraction',   'Их араа шүд авах',       'Large molar extraction',
       7000000, '70,000₮ - 100,000₮', '₮70,000 - ₮100,000',    30, 40),
    ('surgery-root-extraction',        'Ёзоор авах (байнгийн шүд)', 'Root extraction',
       6000000, '60,000₮ - 80,000₮',  '₮60,000 - ₮80,000',     30, 50),
    ('surgery-wisdom-simple',          'Агт араа авах — Энгийн',   'Wisdom tooth — simple',
       10000000, NULL, NULL,                                     40, 60),
    ('surgery-wisdom-partial',         'Агт араа — Хагас саатсан', 'Wisdom tooth — partially impacted',
       12000000, '120,000₮ - 150,000₮', '₮120,000 - ₮150,000',   60, 70),
    ('surgery-wisdom-full',            'Агт араа — Бүтэн саатсан', 'Wisdom tooth — fully impacted',
       15000000, '150,000₮ - 200,000₮', '₮150,000 - ₮200,000',   90, 80),
    ('surgery-gingivectomy',           'Буйл тайрах (1 шүд)',    'Gingivectomy (per tooth)',
       3000000, NULL, NULL,                                      20, 90),
    ('surgery-lip-frenectomy',         'Уруулын хөвч уртасгах',  'Lip frenectomy',
       10000000, NULL, NULL,                                     30, 100),
    ('surgery-tongue-frenectomy',      'Хэлний хөвч уртасгах',   'Tongue frenectomy',
       15000000, NULL, NULL,                                     30, 110)
  ) AS v(slug, name_mn, name_en, price_cents, price_text_mn, price_text_en, duration_min, sort_order)
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. COSMETIC — 3 services from "Шүдний гоо засал" page
-- ----------------------------------------------------------------------------
INSERT INTO public.services (
  slug, parent_id, department_id,
  name_mn, name_en,
  price_cents, price_text_mn, price_text_en,
  duration_min,
  itdoctor_service_id, is_active, sort_order
)
SELECT v.slug, p.id, p.department_id,
       v.name_mn, v.name_en,
       v.price_cents, v.price_text_mn, v.price_text_en,
       v.duration_min,
       35, true, v.sort_order
FROM (SELECT id, department_id FROM public.services WHERE slug = 'cosmetic') p,
  (VALUES
    ('cosmetic-whitening-clinic', 'Шүд цайруулалт (эмнэлгийн нөхцөлд)', 'Teeth whitening — in-clinic',
       20000000, '200,000₮ - 350,000₮', '₮200,000 - ₮350,000', 60, 10),
    ('cosmetic-whitening-home',   'Шүд цайруулалт (гэрийн нөхцөлд)',   'Teeth whitening — at-home',
       35000000, NULL, NULL,                                          30, 20),
    ('cosmetic-tooth-gem',        'Шүдэнд шигтгээ наах',               'Tooth gem',
       1500000, NULL, NULL,                                            15, 30)
  ) AS v(slug, name_mn, name_en, price_cents, price_text_mn, price_text_en, duration_min, sort_order)
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. RESTORATIVE — 2 services from "Согог заслын эмчилгээ" section
-- ----------------------------------------------------------------------------
INSERT INTO public.services (
  slug, parent_id, department_id,
  name_mn, name_en,
  price_cents, price_text_mn, price_text_en,
  duration_min,
  itdoctor_service_id, is_active, sort_order
)
SELECT v.slug, p.id, p.department_id,
       v.name_mn, v.name_en,
       v.price_cents, v.price_text_mn, v.price_text_en,
       v.duration_min,
       35, true, v.sort_order
FROM (SELECT id, department_id FROM public.services WHERE slug = 'restorative') p,
  (VALUES
    ('restorative-space-filling', 'Зай нөхөх',  'Space-filling',
       5000000, NULL, NULL,                                  30, 10),
    ('restorative-enamel',        'Паалан',     'Enamel restoration',
       12000000, '120,000₮ - 400,000₮', '₮120,000 - ₮400,000', 45, 20)
  ) AS v(slug, name_mn, name_en, price_cents, price_text_mn, price_text_en, duration_min, sort_order)
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. ORTHODONTICS — appliance items + brace types
-- ----------------------------------------------------------------------------
INSERT INTO public.services (
  slug, parent_id, department_id,
  name_mn, name_en,
  price_cents, price_text_mn, price_text_en,
  duration_min,
  itdoctor_service_id, is_active, sort_order
)
SELECT v.slug, p.id, p.department_id,
       v.name_mn, v.name_en,
       v.price_cents, v.price_text_mn, v.price_text_en,
       v.duration_min,
       35, true, v.sort_order
FROM (SELECT id, department_id FROM public.services WHERE slug = 'orthodontics') p,
  (VALUES
    ('ortho-diagnosis',          'Оношлогоо хийх',              'Diagnosis',
       5000000, NULL, NULL,                                       45, 10),
    ('ortho-expander-1',         'Тэлэгч зэмсэг (1 талдаа)',    'Expander (1 side)',
       15000000, NULL, NULL,                                      30, 20),
    ('ortho-expander-2',         'Тэлэгч зэмсэг (2 талдаа)',    'Expander (2 sides)',
       30000000, NULL, NULL,                                      40, 30),
    ('ortho-twin-block',         'Twin block',                   'Twin block',
       25000000, NULL, NULL,                                      45, 40),
    ('ortho-space-maintainer',   'Зай хадгалагч',                'Space maintainer',
       5000000, NULL, NULL,                                       30, 50),
    ('ortho-face-mask',          'Face mask',                    'Face mask',
       35000000, NULL, NULL,                                      45, 60),
    ('ortho-tongue-crib',        'Хэл хоригч',                   'Tongue crib',
       15000000, NULL, NULL,                                      30, 70),
    ('ortho-followup',           'Давтан үзлэг',                 'Follow-up visit',
       2000000, '20,000₮ - 40,000₮', '₮20,000 - ₮40,000',         30, 80),
    -- Brace types (from page 6 of brochure)
    ('ortho-metal-braces',       'Металл аппарат',              'Metal braces',
       144000000, NULL, NULL,                                     90, 100),
    ('ortho-ceramic-braces',     'Шаазан аппарат',              'Ceramic braces',
       180000000, NULL, NULL,                                     90, 110),
    ('ortho-sapphire-braces',    'Сафир аппарат',                'Sapphire braces',
       198000000, NULL, NULL,                                     90, 120),
    ('ortho-self-lig-metal',     'Өөрөө түгжээтэй металл аппарат', 'Self-ligation (metal)',
       200000000, NULL, NULL,                                     90, 130),
    ('ortho-self-lig-ceramic',   'Өөрөө түгжээтэй шаазан аппарат', 'Self-ligation (ceramic)',
       220000000, NULL, NULL,                                     90, 140),
    ('ortho-aligner',            'Авагддаг элайнэр аппарат',     'Aligner (per sheet)',
       20000000, '20,000₮ /1 хуудас', '₮20,000 /1 sheet',        15, 150)
  ) AS v(slug, name_mn, name_en, price_cents, price_text_mn, price_text_en, duration_min, sort_order)
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 6. FIXED PROSTHETICS — 3 services
-- ----------------------------------------------------------------------------
INSERT INTO public.services (
  slug, parent_id, department_id,
  name_mn, name_en,
  description_mn, description_en,
  price_cents,
  duration_min,
  itdoctor_service_id, is_active, sort_order
)
SELECT v.slug, p.id, p.department_id,
       v.name_mn, v.name_en,
       v.description_mn, v.description_en,
       v.price_cents,
       v.duration_min,
       35, true, v.sort_order
FROM (SELECT id, department_id FROM public.services WHERE slug = 'fixed-prosthetics') p,
  (VALUES
    ('fixed-zircon-crown',  'Циркон',          'Zirconia crown',
       'Шүдний хатуу эдийг бага гэмтээнэ, бат бөх.',
       'Minimal tooth reduction, very durable.',
       80000000, 60, 10),
    ('fixed-bridge',        'Гүүрэлсэн бүрээс', 'Dental bridge',
       'Зэргэлдээх шүдэнд бэхлэн алдсан шүдийг гүүрлэн хийнэ.',
       'Anchored to neighbouring teeth to bridge a missing tooth.',
       80000000, 90, 20),
    ('fixed-porcelain-veneer', 'Шаазан нүүрэвч',   'Porcelain veneer',
       'Үүдэн шүдний нүүрэн талд наадаг шаазан нүүрэвч.',
       'Thin porcelain shells bonded to the front of teeth.',
       65000000, 60, 30)
  ) AS v(slug, name_mn, name_en, description_mn, description_en, price_cents, duration_min, sort_order)
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 7. REMOVABLE PROSTHETICS — basic & cast-metal denture variants
-- ----------------------------------------------------------------------------
INSERT INTO public.services (
  slug, parent_id, department_id,
  name_mn, name_en,
  price_cents, price_text_mn, price_text_en,
  duration_min,
  itdoctor_service_id, is_active, sort_order
)
SELECT v.slug, p.id, p.department_id,
       v.name_mn, v.name_en,
       v.price_cents, v.price_text_mn, v.price_text_en,
       v.duration_min,
       35, true, v.sort_order
FROM (SELECT id, department_id FROM public.services WHERE slug = 'removable-prosthetics') p,
  (VALUES
    ('removable-acrylic',          'Акрилын хуванцар шүдэлбэр', 'Acrylic denture',
       9000000, '90,000₮ -аас', 'from ₮90,000', 60, 10),
    ('removable-flexible',         'Уян хуванцар шүдэлбэр',    'Flexible denture',
       11000000, '110,000₮ -аас', 'from ₮110,000', 60, 20),
    ('removable-cast-metal',       'Цутгамал металл суурьтай шүдэлбэр', 'Cast-metal denture',
       40000000, NULL, NULL, 90, 30),
    ('removable-palate-2sides',    'Тагнайтай 2 талдаа',        'Palate-supported (both sides)',
       30000000, NULL, NULL, 60, 40),
    ('removable-vacuum-2sides',    'Вакум 2 талдаа',            'Vacuum (both sides)',
       20000000, NULL, NULL, 60, 50),
    ('removable-palate-1side',     'Тагнайтай 1 талдаа',        'Palate-supported (1 side)',
       15000000, NULL, NULL, 45, 60),
    ('removable-vacuum-1side',     'Вакум 1 талдаа',            'Vacuum (1 side)',
       10000000, NULL, NULL, 45, 70)
  ) AS v(slug, name_mn, name_en, price_cents, price_text_mn, price_text_en, duration_min, sort_order)
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 8. PREVENTIVE — 5 services from "Урьдчилан сэргийлэх эмчилгээ"
-- ----------------------------------------------------------------------------
INSERT INTO public.services (
  slug, parent_id, department_id,
  name_mn, name_en,
  description_mn, description_en,
  price_cents,
  duration_min,
  itdoctor_service_id, is_active, sort_order
)
SELECT v.slug, p.id, p.department_id,
       v.name_mn, v.name_en,
       v.description_mn, v.description_en,
       v.price_cents,
       v.duration_min,
       35, true, v.sort_order
FROM (SELECT id, department_id FROM public.services WHERE slug = 'preventive') p,
  (VALUES
    ('preventive-remineralizing',  'Нөхөн эрдэсжүүлэх түрхлэг (бүх шүд)', 'Remineralising gel (all teeth)',
       'Дөнгөж шүдлэсэн хүүхдийн шүдийг эрдэсжүүлж бат бөх болгож, цоорлоос хамгаална.',
       'Strengthens newly erupted teeth and protects from decay.',
       4000000, 20, 10),
    ('preventive-sealant',         'Цоорлоос хамгаалах ломбо (Sealant)', 'Sealant',
       'Шүдний анатомийн төрөлх ховил хонхрыг фторт ломбоор битүүлж цоорлоос хамгаалах.',
       'Seals natural grooves with fluoride filling to prevent decay.',
       2000000, 30, 20),
    ('preventive-saforide',        'Цоорол зогсоох түрхлэг (Saforide)',  'Saforide caries-arresting',
       '3 хүртэлх насны хүүхдийн шүд цоорсон тохиолдолд цоорлыг зогсоож хатуурна.',
       'Arrests caries in milk teeth for children up to age 3.',
       500000, 15, 30),
    ('preventive-cleaning-polish', 'Мэргэжлийн цэвэрлэгээ, өнгөлгөө',     'Professional cleaning & polish',
       'Шүдний чулуу, өнгөн будгийг арилгаснаар буйл эрүүл болно.',
       'Removes tartar and surface stains for healthier gums.',
       5000000, 45, 40),
    ('preventive-tartar-single',   'Шүдний чулуу түүх (1 шүд)',           'Tartar removal (per tooth)',
       NULL, NULL,
       500000, 10, 50)
  ) AS v(slug, name_mn, name_en, description_mn, description_en, price_cents, duration_min, sort_order)
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 9. PEDIATRIC — milk-tooth restoration items
-- ----------------------------------------------------------------------------
INSERT INTO public.services (
  slug, parent_id, department_id,
  name_mn, name_en,
  price_cents, price_text_mn, price_text_en,
  duration_min,
  itdoctor_service_id, is_active, sort_order
)
SELECT v.slug, p.id, p.department_id,
       v.name_mn, v.name_en,
       v.price_cents, v.price_text_mn, v.price_text_en,
       v.duration_min,
       35, true, v.sort_order
FROM (SELECT id, department_id FROM public.services WHERE slug = 'pediatric') p,
  (VALUES
    ('pediatric-milk-filling',    'Сүүн шүдний ломбо',           'Milk-tooth filling',
       4000000, NULL, NULL, 30, 10),
    ('pediatric-milk-canal',      'Сүүн шүдний сувгийн эмчилгээ', 'Milk-tooth canal treatment',
       3000000, NULL, NULL, 45, 20),
    ('pediatric-med-application', 'Эм тавих',                    'Medication application',
       2000000, NULL, NULL, 20, 30),
    ('pediatric-canal-clean',     'Суваг цэвэрлэх',              'Canal cleaning',
       3000000, NULL, NULL, 30, 40),
    ('pediatric-canal-filling',   'Сувгийн ломбо',               'Canal filling',
       5000000, NULL, NULL, 40, 50),
    ('pediatric-drainage',        'Отток',                       'Drainage',
       2500000, '25,000₮ - 30,000₮', '₮25,000 - ₮30,000', 25, 60),
    ('pediatric-milk-extraction', 'Сүүн шүд авах',               'Milk tooth extraction',
       2500000, '25,000₮ - 40,000₮', '₮25,000 - ₮40,000', 20, 70)
  ) AS v(slug, name_mn, name_en, price_cents, price_text_mn, price_text_en, duration_min, sort_order)
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 10. ADULT-TREATMENT — caries levels + root canal items
-- ----------------------------------------------------------------------------
INSERT INTO public.services (
  slug, parent_id, department_id,
  name_mn, name_en,
  description_mn, description_en,
  price_cents, price_text_mn, price_text_en,
  duration_min,
  itdoctor_service_id, is_active, sort_order
)
SELECT v.slug, p.id, p.department_id,
       v.name_mn, v.name_en,
       v.description_mn, v.description_en,
       v.price_cents, v.price_text_mn, v.price_text_en,
       v.duration_min,
       35, true, v.sort_order
FROM (SELECT id, department_id FROM public.services WHERE slug = 'adult-treatment') p,
  (VALUES
    ('adult-superficial-caries', 'Өнгөц цоорлын эмчилгээ',  'Superficial caries treatment',
       'Өвдөлтгүй гадаргын цоорлыг гэрлээр хатуурагч хуванцар ломбоор ломбодно.',
       'Painless surface caries treatment with light-cured composite filling.',
       7500000, NULL, NULL, 30, 10),
    ('adult-medium-caries',      'Дунд цоорлын эмчилгээ',   'Medium caries treatment',
       'Паалан-тугалмайн түвшинд хүрсэн цоорлыг 2-3 төрлийн материалаар ломбодно.',
       'Mid-depth caries treated with multi-layered fillings.',
       8500000, NULL, NULL, 45, 20),
    ('adult-deep-caries',        'Гүн цоорлын эмчилгээ',    'Deep caries treatment',
       'Тугалмайн түвшинд хүрсэн гүн цоорол. Мэдээ алдуулалттай эмчилгээ.',
       'Deep caries reaching the pulp. Treated with anesthesia.',
       9500000, NULL, NULL, 60, 30),
    ('adult-temp-filling',       'Хяналтын ломбо (Түр ломбо)', 'Temporary filling',
       'Эмчилгээний хооронд түр зуурын ломбо.',
       'Interim filling between treatment stages.',
       3000000, NULL, NULL, 20, 40),
    ('adult-post-core',          'Пост (шүдний цөгц сэргээх)',  'Post & core',
       'Шүдний үлдсэн хатуу эдийг бэхжүүлэх металл/файбер пост.',
       'Metal or fibre post to reinforce remaining tooth structure.',
       15000000, '150,000₮ - 170,000₮', '₮150,000 - ₮170,000', 60, 50),
    ('adult-canal-first',        'Сувгийн эхний ирэлт цэвэрлэгээ', 'Root canal — first visit',
       NULL, NULL,
       6500000, '65,000₮ - 75,000₮', '₮65,000 - ₮75,000', 60, 60),
    ('adult-canal-followup',     'Сувгийн давтан ирэлт угаах',    'Root canal — follow-up wash',
       NULL, NULL,
       3000000, '30,000₮ - 40,000₮', '₮30,000 - ₮40,000', 30, 70),
    ('adult-canal-filling',      'Суваг ломбодох',                'Root canal filling',
       NULL, NULL,
       10000000, '100,000₮ - 120,000₮', '₮100,000 - ₮120,000', 60, 80),
    ('adult-drainage',           'Отток',                         'Drainage',
       NULL, NULL,
       6000000, '60,000₮ - 75,000₮', '₮60,000 - ₮75,000', 30, 90)
  ) AS v(slug, name_mn, name_en, description_mn, description_en, price_cents, price_text_mn, price_text_en, duration_min, sort_order)
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 11. DIAGNOSTIC ("Бусад эмчилгээ") — X-rays + anesthesia
-- ----------------------------------------------------------------------------
INSERT INTO public.services (
  slug, parent_id, department_id,
  name_mn, name_en,
  price_cents,
  duration_min,
  itdoctor_service_id, is_active, sort_order
)
SELECT v.slug, p.id, p.department_id,
       v.name_mn, v.name_en,
       v.price_cents,
       v.duration_min,
       35, true, v.sort_order
FROM (SELECT id, department_id FROM public.services WHERE slug = 'diagnostic') p,
  (VALUES
    ('diagnostic-xray-segment',  'Хэсгийн шүдний рентген зураг', 'Segment X-ray',
       1500000, 10, 10),
    ('diagnostic-xray-panoramic','Дэлгэмэл шүдний рентген зураг', 'Panoramic X-ray',
       3000000, 10, 20),
    ('diagnostic-xray-side',     'Хажуугийн шүдний рентген зураг', 'Cephalometric (side) X-ray',
       3000000, 10, 30),
    ('diagnostic-anesthesia',    'Мэдээ алдуулах, зүү тариа',     'Anesthesia (injection)',
       1000000, 10, 40)
  ) AS v(slug, name_mn, name_en, price_cents, duration_min, sort_order)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- Verify — show each catalog parent with the count of active children
-- ============================================================================
SELECT
  p.slug AS parent_slug,
  p.name_mn AS parent_name,
  (SELECT count(*) FROM public.services c
   WHERE c.parent_id = p.id AND c.is_active) AS active_children
FROM public.services p
WHERE p.parent_id IS NULL
  AND p.is_active = true
ORDER BY p.sort_order, p.slug;
