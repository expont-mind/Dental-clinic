-- ============================================================================
-- Dentaris clinic services — real data seed.
-- Replaces the 9 placeholder services from 02_dentexgo_integration.sql with
-- ~40 curated rows extracted from data/Dentaris - Асуулт хариулт.csv.
-- Each row carries: bilingual name + description, MNT price (cents = MNT × 100),
-- best-effort duration, and a category tag. Price ranges are stored as the
-- MIN in price_cents and the full range in description_(mn|en).
-- Idempotent: re-running is safe (on conflict do nothing).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Wipe placeholders. Only the 9 slugs seeded by 02_dentexgo_integration.
-- ----------------------------------------------------------------------------
delete from public.services where slug in (
  'implant', 'orthodontics', 'oral-surgery', 'pediatric', 'general',
  'hygiene', 'prosthetic', 'periodontics', 'cosmetic'
);

-- ============================================================================
-- RESTORATIVE (department slug = 'restorative'), sort 100–199
-- ============================================================================

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'implant', d.id, 'Имплант', 'Dental implant',
  'Шүдний имплант 2,400,000₮-р хийгдэж байна. Хуваан төлөх боломжтой. Урьдчилан манай Нүүр Амны Тулгуур болон Мэс Заслын эмчээс цаг аван зөвлөгөө авах шаардлагатай. Эмчилгээний нийт хугацаа ойролцоогоор 4-6 сар.',
  'Single dental implant: ₮2,400,000. Installment plans available. Requires prior consultation with our oral and maxillofacial surgeon. Full treatment timeline is approximately 4–6 months.',
  'Implant', 240000000, 'MNT', 120, true, 100
from public.departments d where d.slug = 'restorative'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'crown-zirconia', d.id, 'Циркон бүрээс', 'Zirconia crown',
  'Циркон бүрээс — нэг шүд 800,000₮. Hollywood Smile хүсэлд тохиромжтой үндсэн материал.',
  'Zirconia crown — ₮800,000 per tooth. Our standard material for Hollywood-smile restorations.',
  'Prosthodontics', 80000000, 'MNT', 90, true, 110
from public.departments d where d.slug = 'restorative'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'gum-grafting-1', d.id, 'Буйл нөхөлт — нэг шүд', 'Gum grafting (single tooth)',
  'Буйл нөхөлт нэг шүд 800,000₮.',
  'Gum grafting for a single tooth: ₮800,000.',
  'Periodontics', 80000000, 'MNT', 90, true, 120
from public.departments d where d.slug = 'restorative'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'gum-grafting-4', d.id, 'Буйл нөхөлт — 4 шүд', 'Gum grafting (4 teeth)',
  'Буйл нөхөлт 4 шүд 1,200,000₮-с эхэлж байна.',
  'Gum grafting across 4 teeth: from ₮1,200,000.',
  'Periodontics', 120000000, 'MNT', 120, true, 130
from public.departments d where d.slug = 'restorative'
on conflict (slug) do nothing;

-- ============================================================================
-- ORTHODONTICS (department slug = 'orthodontics'), sort 200–299
-- ============================================================================

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'orthodontics-metal', d.id, 'Металл аппарат', 'Metal braces',
  'Металл аппарат — үндсэн үнэ 1,440,000₮. Лизингээр 6 сар × 240,000₮ эсвэл 12 сар × 120,000₮ төлөх боломжтой.',
  'Metal braces — base price ₮1,440,000. Financing: 6 mo × ₮240,000 or 12 mo × ₮120,000.',
  'Orthodontics', 144000000, 'MNT', 90, true, 200
from public.departments d where d.slug = 'orthodontics'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'orthodontics-ceramic', d.id, 'Шаазан аппарат', 'Ceramic braces',
  'Шаазан аппарат — үндсэн үнэ 1,800,000₮. Лизингээр 6 сар × 300,000₮ эсвэл 12 сар × 150,000₮.',
  'Ceramic braces — base price ₮1,800,000. Financing: 6 mo × ₮300,000 or 12 mo × ₮150,000.',
  'Orthodontics', 180000000, 'MNT', 90, true, 205
from public.departments d where d.slug = 'orthodontics'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'orthodontics-sapphire', d.id, 'Сафир аппарат', 'Sapphire braces',
  'Сафир аппарат — үндсэн үнэ 1,980,000₮. Лизингээр 6 сар × 330,000₮ эсвэл 12 сар × 165,000₮. Шилэн мэт тунгалаг харагддаг, шаазангаас илүү бат бөх давуу талтай.',
  'Sapphire braces — base price ₮1,980,000. Financing: 6 mo × ₮330,000 or 12 mo × ₮165,000. Crystal-clear brackets, stronger than ceramic.',
  'Orthodontics', 198000000, 'MNT', 90, true, 210
from public.departments d where d.slug = 'orthodontics'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'orthodontics-self-ligating', d.id, 'Өөрөө түгжээтэй аппарат', 'Self-ligating braces',
  'Өөрөө түгжээтэй аппарат — үндсэн үнэ 2,000,000₮. Лизингээр 6 сар × 333,000₮ төлөх боломжтой.',
  'Self-ligating braces — base price ₮2,000,000. Financing: 6 mo × ₮333,000.',
  'Orthodontics', 200000000, 'MNT', 90, true, 215
from public.departments d where d.slug = 'orthodontics'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'orthodontics-self-ligating-ceramic', d.id, 'Өөрөө түгжээтэй шаазан аппарат', 'Self-ligating ceramic braces',
  'Өөрөө түгжээтэй шаазан аппарат — үндсэн үнэ 2,200,000₮. Лизингээр 6 сар × 367,000₮.',
  'Self-ligating ceramic braces — base price ₮2,200,000. Financing: 6 mo × ₮367,000.',
  'Orthodontics', 220000000, 'MNT', 90, true, 220
from public.departments d where d.slug = 'orthodontics'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'orthodontics-single-arch', d.id, 'Гажиг заслын аппарат — нэг талдаа', 'Single-arch braces',
  'Гажиг заслын аппарат нэг талдаа зүүх үнийн дүн 900,000₮-с эхэлж байна.',
  'Single-arch (upper or lower only) braces — from ₮900,000.',
  'Orthodontics', 90000000, 'MNT', 90, true, 225
from public.departments d where d.slug = 'orthodontics'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'orthodontics-removable-pediatric', d.id, 'Авагддаг гажиг заслын зэмсэг', 'Removable pediatric orthodontic appliance',
  'Хүүхдийн авагддаг гажиг заслын зэмсэг — үнийн хувьд 150,000-350,000₮ байдаг. Эхлээд манай мэргэжлийн Гажиг Заслын эмчээс зөвлөгөө авах шаардлагатай.',
  'Removable pediatric orthodontic appliance: ₮150,000–₮350,000. Requires prior consultation with our orthodontist.',
  'Orthodontics', 15000000, 'MNT', 60, true, 230
from public.departments d where d.slug = 'orthodontics'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'orthodontics-aligner-diagnostics', d.id, 'Aligner оношилгоо', 'Aligner diagnostics',
  'Aligner аппарат хийлгэхээс өмнө оношилгоонд орох шаардлагатай. Рентген зураг авхуулан Гажиг Заслын эмчээс зөвлөгөө авах ба оношилгоо 100,000₮. Оношилгооны хариунаас дээр доороо хэдэн аппарат зүүх болон нийт үнийн дүн тодорхой болдог.',
  'Aligner treatment starts with diagnostics: X-rays plus consultation with our orthodontist. Diagnostic fee: ₮100,000. The diagnosis report determines how many aligners you need and the total cost.',
  'Orthodontics', 10000000, 'MNT', 60, true, 235
from public.departments d where d.slug = 'orthodontics'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'orthodontics-facemask', d.id, 'Facemask зэмсэг', 'Orthodontic facemask',
  'Гажиг заслын Facemask зэмсэг 350,000₮.',
  'Orthodontic facemask appliance: ₮350,000.',
  'Orthodontics', 35000000, 'MNT', null, true, 240
from public.departments d where d.slug = 'orthodontics'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'orthodontics-screw', d.id, 'Гажиг заслын screw', 'Orthodontic mini-screw (TAD)',
  'Нэг screw 150,000₮.',
  'Orthodontic mini-screw / temporary anchorage device: ₮150,000 each.',
  'Orthodontics', 15000000, 'MNT', 30, true, 245
from public.departments d where d.slug = 'orthodontics'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'orthodontics-retainer-removable', d.id, 'Авагддаг бэхжүүлэгч', 'Removable retainer',
  'Авагддаг бэхжүүлэгч — нэг талдаа 100,000-150,000₮. Захиалахдаа нийт үнийн 50%-г төлөөд авахдаа үлдэгдлийг төлж 2 хуваах боломжтой.',
  'Removable retainer — ₮100,000–₮150,000 per arch. Pay 50% on order and the balance on collection.',
  'Orthodontics', 10000000, 'MNT', 30, true, 250
from public.departments d where d.slug = 'orthodontics'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'orthodontics-adjustment', d.id, 'Сар бүрийн чангалгаа', 'Monthly orthodontic adjustment',
  'Сар бүрийн чангалгаа 30,000-40,000₮.',
  'Monthly orthodontic adjustment: ₮30,000–₮40,000.',
  'Orthodontics', 3000000, 'MNT', 30, true, 255
from public.departments d where d.slug = 'orthodontics'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'orthodontics-bracket-reattach-fallen', d.id, 'Салсан брекет наахад', 'Loose bracket re-bond',
  'Салсан брекет байгаа тохиолдолд 5,000₮-р наадаг.',
  'Re-bonding a loose (but recovered) bracket: ₮5,000.',
  'Orthodontics', 500000, 'MNT', 15, true, 260
from public.departments d where d.slug = 'orthodontics'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'orthodontics-bracket-reattach-lost', d.id, 'Алдсан брекет шинээр наахад', 'Lost bracket replacement',
  'Алга болсон брекетийг шинээр наахад 40,000-100,000₮.',
  'Replacing a lost bracket with a new one: ₮40,000–₮100,000.',
  'Orthodontics', 4000000, 'MNT', 20, true, 265
from public.departments d where d.slug = 'orthodontics'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'orthodontics-brush-kit', d.id, 'Аппараттай шүдний сойзны багц', 'Braces-compatible brush kit',
  'Аппараттай шүдний сойзны багц 20,000₮. Хоёр төрөл байна.',
  'Toothbrush kit designed for braces — ₮20,000. Two variants available.',
  'Accessory', 2000000, 'MNT', null, true, 290
from public.departments d where d.slug = 'orthodontics'
on conflict (slug) do nothing;

-- ============================================================================
-- GENERAL (department slug = 'general'), sort 300–399
-- ============================================================================

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'consultation', d.id, 'Урьдчилсан үзлэг ба зөвлөгөө', 'Initial consultation & exam',
  'Амны хөндийн урьдчилсан үзлэг ба зөвлөгөө үнэ төлбөргүй.',
  'Initial oral examination and consultation: free.',
  'Preventive', 0, 'MNT', 20, true, 300
from public.departments d where d.slug = 'general'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'xray', d.id, 'Рентгэн зураг', 'Dental X-ray',
  'Рентгэн зураг 30,000₮.',
  'Dental X-ray: ₮30,000.',
  'Diagnostics', 3000000, 'MNT', 10, true, 305
from public.departments d where d.slug = 'general'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'filling-adult', d.id, 'Шүдний ломбо', 'Dental filling',
  'Шүдний ломбо 75,000-95,000₮. Япон материал ашигладаг. Мэдээ алдуулалт нэмж 10,000₮.',
  'Dental filling: ₮75,000–₮95,000. We use Japanese composite materials. Local anesthesia adds ₮10,000.',
  'Restorative', 7500000, 'MNT', 45, true, 310
from public.departments d where d.slug = 'general'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'anesthesia-local', d.id, 'Мэдээ алдуулалт', 'Local anesthesia',
  'Хэсгийн мэдээ алдуулалт 10,000₮. Ломбо, шүд авалт, мэс ажилбарт нэмж тооцогддог.',
  'Local anesthesia: ₮10,000. Added to fillings, extractions and surgical procedures.',
  'Adjunct', 1000000, 'MNT', null, true, 315
from public.departments d where d.slug = 'general'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'root-canal', d.id, 'Сувгийн эмчилгээ', 'Root canal treatment',
  'Сувгийн эмчилгээ 195,000-265,000₮.',
  'Root canal treatment: ₮195,000–₮265,000.',
  'Endodontics', 19500000, 'MNT', 60, true, 320
from public.departments d where d.slug = 'general'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'extraction-regular', d.id, 'Шүд авалт', 'Tooth extraction',
  'Шүд авалт 50,000-120,000₮.',
  'Tooth extraction: ₮50,000–₮120,000.',
  'Surgery', 5000000, 'MNT', 30, true, 325
from public.departments d where d.slug = 'general'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'wisdom-tooth-regular', d.id, 'Энгийн агт араа авалт', 'Wisdom tooth extraction (erupted)',
  'Энгийн (ургасан) агт араа авалт 100,000-120,000₮. Хэсгийн мэдээ алдуулалттай тул ажилбарын үеэр өвдөхгүй.',
  'Erupted wisdom tooth extraction: ₮100,000–₮120,000. Performed under local anesthesia.',
  'Surgery', 10000000, 'MNT', 45, true, 330
from public.departments d where d.slug = 'general'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'wisdom-tooth-impacted', d.id, 'Саатсан агт араа авалт', 'Impacted wisdom tooth extraction',
  'Саатсан агт араа авалт 120,000-200,000₮. Рентгэн зураг нэмж 30,000₮.',
  'Impacted wisdom tooth extraction: ₮120,000–₮200,000. X-ray additional ₮30,000.',
  'Surgery', 12000000, 'MNT', 90, true, 335
from public.departments d where d.slug = 'general'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'tooth-root-extraction', d.id, 'Шүдний ёзоор авалт', 'Tooth root extraction',
  'Шүдний ёзоор авалт 50,000-90,000₮.',
  'Tooth root extraction: ₮50,000–₮90,000.',
  'Surgery', 5000000, 'MNT', 30, true, 340
from public.departments d where d.slug = 'general'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'tartar-removal-single', d.id, 'Нэг шүдний чулуу авах', 'Single-tooth tartar removal',
  'Нэг шүдний чулуу 5,000₮. Үүссэн чулууг доргиох багажаар авдаг тул бага зэрэг мэдэрдэг.',
  'Single-tooth tartar removal: ₮5,000. Performed with an ultrasonic scaler — slight sensation only.',
  'Preventive', 500000, 'MNT', 15, true, 345
from public.departments d where d.slug = 'general'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'tartar-removal-full', d.id, 'Бүх шүдний чулуу авах', 'Full-mouth tartar removal',
  'Бүх шүдний чулуу авах 50,000₮.',
  'Full-mouth tartar removal: ₮50,000.',
  'Preventive', 5000000, 'MNT', 30, true, 350
from public.departments d where d.slug = 'general'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'cleaning-full', d.id, 'Бүх шүдний цэвэрлэгээ ба өнгөлгөө', 'Full-mouth professional cleaning & polishing',
  'Бүх шүдний цэвэрлэгээ ба өнгөлгөө 80,000-100,000₮.',
  'Full-mouth professional cleaning and polishing: ₮80,000–₮100,000.',
  'Preventive', 8000000, 'MNT', 45, true, 355
from public.departments d where d.slug = 'general'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'nightguard', d.id, 'Nightguard', 'Night guard (occlusal splint)',
  'Nightguard зэмсэг 200,000₮. Таны амны хөндийгөөс хэв авч өөрийн шүдэнд тааруулан хийдэг.',
  'Custom-fitted night guard / occlusal splint: ₮200,000. Made from an impression of your bite.',
  'Restorative', 20000000, 'MNT', null, true, 360
from public.departments d where d.slug = 'general'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'lingual-frenectomy', d.id, 'Хэлний хөвч уртасгах', 'Lingual frenectomy',
  'Хэлний хөвч уртасгах мэс ажилбар 150,000₮.',
  'Lingual frenectomy (tongue-tie release): ₮150,000.',
  'Surgery', 15000000, 'MNT', 45, true, 365
from public.departments d where d.slug = 'general'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'labial-frenectomy', d.id, 'Уруулын хөвч уртасгах', 'Labial frenectomy',
  'Уруулын хөвч уртасгах мэс ажилбар 100,000₮.',
  'Labial frenectomy (lip-tie release): ₮100,000.',
  'Surgery', 10000000, 'MNT', 45, true, 370
from public.departments d where d.slug = 'general'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'space-maintenance', d.id, 'Нэг шүдний зай нөхөлт', 'Space maintainer',
  'Нэг шүдний зай нөхөлт 25,000-50,000₮.',
  'Single-tooth space maintainer: ₮25,000–₮50,000.',
  'Restorative', 2500000, 'MNT', 30, true, 375
from public.departments d where d.slug = 'general'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'enamel-restoration', d.id, 'Нэг шүдний паалан сэргээлт', 'Enamel restoration (single tooth)',
  'Нэг шүдний паалан сэргээлт 120,000₮.',
  'Single-tooth enamel restoration: ₮120,000.',
  'Restorative', 12000000, 'MNT', 30, true, 380
from public.departments d where d.slug = 'general'
on conflict (slug) do nothing;

-- ============================================================================
-- COSMETIC (department slug = 'cosmetic'), sort 400–499
-- ============================================================================

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'whitening-full', d.id, 'Бүх шүдний цайруулалт', 'Full-mouth teeth whitening',
  'Бүх шүдний цайруулалт 200,000-350,000₮. Солонгос, Япон, Америк гэсэн 3 төрөл байна. Япон цайруулалт паалан ба тугалмайн түвшинд үйлчилдэг тул өвдөлтгүй.',
  'Full-mouth whitening: ₮200,000–₮350,000. Three options — Korean, Japanese, American. Japanese is the most comfortable; American gives the strongest result but can be sensitive.',
  'Cosmetic', 20000000, 'MNT', 60, true, 400
from public.departments d where d.slug = 'cosmetic'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'whitening-single-tooth', d.id, 'Нэг шүдний цайруулалт', 'Single-tooth whitening',
  'Нэг шүдний нэг удаагийн цайруулалт 40,000₮. Сувгийн цайруулалт мөн хийгддэг.',
  'Single-tooth whitening (one session): ₮40,000. Internal (root canal) whitening also available.',
  'Cosmetic', 4000000, 'MNT', 30, true, 405
from public.departments d where d.slug = 'cosmetic'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'veneer-composite', d.id, 'Composite veneer', 'Composite veneer',
  'Composite veneer — нэг шүд 400,000₮.',
  'Composite veneer — ₮400,000 per tooth.',
  'Cosmetic', 40000000, 'MNT', 90, true, 410
from public.departments d where d.slug = 'cosmetic'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'tooth-gem', d.id, 'Шигтгээ наах', 'Tooth gem / inlay',
  'Шүдэнд шигтгээ наах 20,000₮-с эхэлж байна.',
  'Tooth gem placement: from ₮20,000.',
  'Cosmetic', 2000000, 'MNT', 20, true, 415
from public.departments d where d.slug = 'cosmetic'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'decorative-braces', d.id, 'Гоёлын аппарат', 'Decorative (fashion) braces',
  'Гоёлын аппарат — 2 талдаа 200,000₮. Эмчилгээний бус, гоо сайхны зориулалттай.',
  'Decorative / fashion braces — ₮200,000 for both arches. Aesthetic only, not orthodontic treatment.',
  'Cosmetic', 20000000, 'MNT', 60, true, 420
from public.departments d where d.slug = 'cosmetic'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'decorative-braces-removal', d.id, 'Гоёлын аппарат салгах', 'Decorative braces removal',
  'Гоёлын аппарат салгах 20,000₮.',
  'Removal of decorative braces: ₮20,000.',
  'Cosmetic', 2000000, 'MNT', 30, true, 425
from public.departments d where d.slug = 'cosmetic'
on conflict (slug) do nothing;

-- ============================================================================
-- PEDIATRIC (department slug = 'pediatric'), sort 500–599
-- ============================================================================

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'pediatric-filling', d.id, 'Сүүн шүдний ломбо', 'Baby tooth filling',
  'Сүүн шүдний ломбо 40,000₮.',
  'Baby (deciduous) tooth filling: ₮40,000.',
  'Pediatric', 4000000, 'MNT', 30, true, 500
from public.departments d where d.slug = 'pediatric'
on conflict (slug) do nothing;

insert into public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  category, price_cents, currency, duration_min, is_active, sort_order
)
select 'pediatric-root-canal', d.id, 'Сүүн шүдний сувгийн эмчилгээ', 'Baby tooth pulpectomy',
  'Сүүн шүдний сувгийн эмчилгээ 100,000-140,000₮.',
  'Baby tooth pulpectomy (root canal): ₮100,000–₮140,000.',
  'Pediatric', 10000000, 'MNT', 60, true, 505
from public.departments d where d.slug = 'pediatric'
on conflict (slug) do nothing;
