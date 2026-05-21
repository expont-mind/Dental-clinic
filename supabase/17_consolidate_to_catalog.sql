-- ============================================================================
-- Migration: Consolidate 15 parent services down to 12 to mirror the printed
-- Dentaris catalog 1:1.
--
-- After this migration the public listing shows these 12 catalog sections:
--   1.  cosmetic                — Шүдний гоо засал
--   2.  implant                 — Имплант
--   3.  fixed-prosthetics       — Авагддаггүй шүдэлбэр
--   4.  removable-prosthetics   — Авагддаг шүдэлбэр
--   5.  orthodontics            — Гажиг засал (now also includes braces-types as children)
--   6.  oral-surgery            — Мэс ажилбар
--   7.  preventive              — Урьдчилан сэргийлэх (absorbs hygiene)
--   8.  pediatric               — Хүүхдийн эмчилгээ
--   9.  adult-treatment         — Насанд хүрэгчдийн (absorbs general)
--   10. restorative             — Согог засал (NEW — Зай нөхөх + Паалан)
--   11. other                   — Бусад эмчилгээ (renamed from diagnostic)
--   12. periodontics            — стандарт сэдвээр үлдээх (kept for now; no merge yet)
--
-- Idempotent: safe to re-run.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Pick a department for the new `restorative` parent (matches what
--    "Зай нөхөх" + "Паалан" actually are — minor restorative work).
-- ----------------------------------------------------------------------------
WITH dept AS (
  SELECT id FROM public.departments
  WHERE slug = 'restorative' OR slug = 'cosmetic' OR slug = 'general'
  ORDER BY CASE slug WHEN 'restorative' THEN 1 WHEN 'general' THEN 2 ELSE 3 END
  LIMIT 1
)
INSERT INTO public.services (
  slug, department_id,
  name_mn, name_en,
  description_mn, description_en,
  icon_key, is_active, sort_order
)
SELECT
  'restorative', d.id,
  'Согог заслын эмчилгээ', 'Restorative',
  'Зай нөхөх, паалан болон бусад жижиг сэргээх эмчилгээ.',
  'Space-filling, enamel and other minor restorative procedures.',
  'restorative', true, 100
FROM dept d
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 1. Demote `braces-types` to a child of `orthodontics`.
--    Catalog page 6 presents the 5 brace types as ortho options.
-- ----------------------------------------------------------------------------
UPDATE public.services AS s
SET parent_id = ortho.id
FROM public.services AS ortho
WHERE s.slug = 'braces-types'
  AND ortho.slug = 'orthodontics'
  AND s.parent_id IS DISTINCT FROM ortho.id;

-- ----------------------------------------------------------------------------
-- 2. Drop redundant parents: re-parent their children, then deactivate.
--    We never DELETE — deactivation preserves history and existing FKs.
-- ----------------------------------------------------------------------------

-- 2a. `prosthetic` is a pure duplicate of fixed/removable + implant.
--     Its children (if any) → fixed-prosthetics.
UPDATE public.services AS s
SET parent_id = target.id
FROM public.services AS prosthetic, public.services AS target
WHERE prosthetic.slug = 'prosthetic'
  AND target.slug = 'fixed-prosthetics'
  AND s.parent_id = prosthetic.id;

UPDATE public.services SET is_active = false WHERE slug = 'prosthetic';

-- 2b. `hygiene` overlaps with preventive. Children → preventive.
UPDATE public.services AS s
SET parent_id = target.id
FROM public.services AS hygiene, public.services AS target
WHERE hygiene.slug = 'hygiene'
  AND target.slug = 'preventive'
  AND s.parent_id = hygiene.id;

UPDATE public.services SET is_active = false WHERE slug = 'hygiene';

-- 2c. `general` overlaps with adult-treatment. Children → adult-treatment.
UPDATE public.services AS s
SET parent_id = target.id
FROM public.services AS general, public.services AS target
WHERE general.slug = 'general'
  AND target.slug = 'adult-treatment'
  AND s.parent_id = general.id;

UPDATE public.services SET is_active = false WHERE slug = 'general';

-- 2d. `diagnostic` → rename to "Бусад эмчилгээ" (X-rays + anesthesia from
--     printed catalog). Keep as 12th-ish active parent rather than fold in.
UPDATE public.services
SET name_mn = 'Бусад эмчилгээ',
    name_en = 'Other treatments',
    description_mn = 'Рентген зураг, мэдээ алдуулах болон бусад туслах эмчилгээ.',
    description_en = 'X-rays, anesthesia and other supporting procedures.',
    sort_order = 110
WHERE slug = 'diagnostic';

-- ----------------------------------------------------------------------------
-- 3. Verify — show the active top-level catalog parents post-migration.
-- ----------------------------------------------------------------------------
SELECT
  sort_order,
  slug,
  name_mn,
  is_active,
  (SELECT count(*) FROM public.services c WHERE c.parent_id = p.id AND c.is_active) AS active_children
FROM public.services p
WHERE p.parent_id IS NULL
ORDER BY sort_order, slug;
