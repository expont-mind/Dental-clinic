-- ============================================================================
-- Migration: Create 9 parent service categories, wire parent-child hierarchy,
-- and seed rich content (long descriptions, treatments, benefits, FAQ, pricing).
-- Depends on: 04_dentaris_services_seed.sql, 08_service_content.sql, 10_service_parent_id.sql
-- Idempotent: safe to re-run.
-- ============================================================================

-- ============================================================================
-- 0. Fix slug collision: the granular "Dental implant" row occupies slug
--    'implant' — rename it so we can create a parent 'implant' category.
-- ============================================================================
UPDATE public.services SET slug = 'implant-single' WHERE slug = 'implant' AND parent_id IS NULL;

-- ============================================================================
-- 1. Insert 9 parent service categories (matching the original SERVICE_CATALOG).
--    Each has parent_id = NULL, is_active = true, and sort_order 1–9.
-- ============================================================================

-- IMPLANT (restorative)
INSERT INTO public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  icon_key, image_url, hero_image_url,
  long_description_mn, long_description_en,
  duration_text_mn, duration_text_en,
  price_text_mn, price_text_en,
  content_mn, content_en,
  category, is_active, sort_order
)
SELECT 'implant', d.id,
  'Имплант', 'Implant',
  'хиймэл шүд, авагддаг авагддагүй шүдэлбэр',
  'dental implants, removable & fixed prosthetics',
  'implant', '/p5.jpg', '/p6.jpg',
  'Шүдний имплант, бүрээс, гүүр зэрэг сэргээх эмчилгээ нь алдсан эсвэл гэмтсэн шүдийг бүрэн сэргээж, бодит шүдтэй ялгагдахгүй гадаад төрх, чанарыг өгнө. Бид ОУ-ын стандартын материал, 3D дижитал төлөвлөлт, чанарын баталгаа ашиглана.',
  'Implants, crowns and bridges restore teeth that are missing or damaged so they look and feel like the originals. We use international-grade materials, 3D planning and a quality guarantee.',
  '60–180 мин', '60–180 min',
  '1,500,000₮ -аас', 'from ₮1,500,000',
  '{
    "treatments": ["Шүдний имплант", "Шаазан бүрээс", "Гүүр", "Бөгөөн (overdenture)", "Үндэс эмчилгээ", "Эмгэг хагалгаа"],
    "benefits": [
      {"title": "Бодит дүр төрх", "body": "Имплант шинэ шүд шиг хэлбэр, өнгөтэй."},
      {"title": "Удаан хадгална", "body": "Зөв арчилбал имплант 25+ жил үйлчилнэ."},
      {"title": "Бүрэн чадвар", "body": "Бүх төрлийн хоол идэх, ярих, инээх боломжтой."}
    ],
    "faq": [
      {"q": "Имплант хэдэн өдөр?", "a": "Хагалгаа 1 цаг, эмчилгээний нийт хугацаа 3-6 сар."},
      {"q": "Өвдөлттэй юу?", "a": "Орчин үеийн анестези, орон нутгийн мэдээгүйжүүлэлтээр өвдөлтгүй."}
    ]
  }'::jsonb,
  '{
    "treatments": ["Dental implants", "Porcelain crowns", "Bridges", "Overdentures", "Root canal therapy", "Surgical extraction"],
    "benefits": [
      {"title": "Natural look", "body": "Implants look and feel like real teeth."},
      {"title": "Long-lasting", "body": "With proper care, implants last 25+ years."},
      {"title": "Full function", "body": "Eat, talk and smile without any restrictions."}
    ],
    "faq": [
      {"q": "How long for an implant?", "a": "Surgery takes about an hour; full timeline is 3–6 months."},
      {"q": "Is it painful?", "a": "Modern anesthesia keeps the procedure pain-free."}
    ]
  }'::jsonb,
  'Implant', true, 1
FROM public.departments d WHERE d.slug = 'restorative'
ON CONFLICT (slug) DO NOTHING;

-- ORTHODONTICS
INSERT INTO public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  icon_key, image_url, hero_image_url,
  long_description_mn, long_description_en,
  duration_text_mn, duration_text_en,
  price_text_mn, price_text_en,
  content_mn, content_en,
  category, is_active, sort_order
)
SELECT 'orthodontics', d.id,
  'Шүдний гажиг засал', 'Orthodontics',
  'шүдний аппарат төрөл, үнэ ханш',
  'braces, aligners and bite correction',
  'braces', '/p1.jpg', '/p3.jpg',
  'Гажиг засал нь шүдний эгнэлт, амны хөндийн зохистой үйл ажиллагааг сэргээдэг. Уламжлалт металл брэкэт, гоо сайхны керамик брэкэт, эсвэл шилэн (Invisalign) гэх мэт олон сонголт. Орчин үеийн дижитал төлөвлөгөөгөөр эмчилгээний хугацаа богиносч, үр дүнгийн нарийвчлал нэмэгдсэн.',
  'Orthodontics straightens crooked teeth and corrects the bite. Choose from traditional metal braces, ceramic, or clear aligners (Invisalign). Digital treatment planning shortens timelines and improves precision.',
  '12–24 сар', '12–24 months',
  'Үзлэг үнэгүй', 'Free consultation',
  '{
    "treatments": ["Уламжлалт металл брэкэт", "Керамик / гоо сайхны брэкэт", "Шилэн брэкэт (Invisalign)", "Хүүхдийн гажиг засал", "Хяналтын аппарат", "3D дижитал төлөвлөлт"],
    "benefits": [
      {"title": "Зөв эгнэлт", "body": "Шууд шүд цэвэрлэхэд хялбар, хүнсний хатуу хальс үлдэхгүй."},
      {"title": "Эрүүл бай хэвлий", "body": "Зүй ёсны эгнэлт нь хооллолт, ярианд эерэг."},
      {"title": "Хяналт", "body": "Эмчилгээний явцыг 3 долоо хоног тутам шалгаж, бүх явцыг тань хувьсгалт хяналт ажиллана."}
    ],
    "faq": [
      {"q": "Хэр насанд хийлгэх вэ?", "a": "Аль ч насанд тохиромжтой. Хүүхэд, өсвөр насныханд 12-16 нас хамгийн оновчтой."},
      {"q": "Эмчилгээ өвдөлттэй юу?", "a": "Эхэн үе бага зэрэг даралттай мэдрэмж байж болох ч хэдэн өдрийн дотор алга болно."}
    ],
    "pricing": [
      {"label": "Үзлэг зөвлөгөө", "price": "Үнэгүй"},
      {"label": "Зураг авалт", "price": "30,000₮"},
      {"label": "Оношилгоо", "price": "50,000₮"},
      {"label": "Металл аппарат", "price": "1,440,000₮", "note": "Лизингээр: 6 сар × 240,000₮ эсвэл 12 сар × 120,000₮"},
      {"label": "Шаазан аппарат", "price": "1,800,000₮", "note": "Лизингээр: 6 сар × 300,000₮ эсвэл 12 сар × 150,000₮"},
      {"label": "Сафир аппарат", "price": "1,980,000₮", "note": "Лизингээр: 6 сар × 330,000₮ эсвэл 12 сар × 165,000₮"},
      {"label": "Өөрөө түгжээтэй аппарат", "price": "2,000,000₮", "note": "Лизингээр: 6 сар × 333,000₮"},
      {"label": "Өөрөө түгжээтэй шаазан аппарат", "price": "2,200,000₮", "note": "Лизингээр: 6 сар × 367,000₮"},
      {"label": "Сар бүрийн чангалгаа", "price": "30,000₮ – 40,000₮"}
    ]
  }'::jsonb,
  '{
    "treatments": ["Traditional metal braces", "Ceramic / aesthetic braces", "Clear aligners (Invisalign)", "Pediatric orthodontics", "Retainers", "3D digital planning"],
    "benefits": [
      {"title": "Straight teeth", "body": "Easier to brush, less plaque, healthier gums."},
      {"title": "Better function", "body": "Proper alignment improves chewing and speech."},
      {"title": "Tracked progress", "body": "Check-ins every 3 weeks keep treatment on schedule."}
    ],
    "faq": [
      {"q": "What age is best?", "a": "Any age — but 12–16 is often optimal for kids."},
      {"q": "Does it hurt?", "a": "Mild pressure for the first few days, then nothing."}
    ],
    "pricing": [
      {"label": "Consultation", "price": "Free"},
      {"label": "X-ray imaging", "price": "₮30,000"},
      {"label": "Diagnosis", "price": "₮50,000"},
      {"label": "Metal braces", "price": "₮1,440,000", "note": "Lease: 6 mo × ₮240,000 or 12 mo × ₮120,000"},
      {"label": "Ceramic braces", "price": "₮1,800,000", "note": "Lease: 6 mo × ₮300,000 or 12 mo × ₮150,000"},
      {"label": "Sapphire braces", "price": "₮1,980,000", "note": "Lease: 6 mo × ₮330,000 or 12 mo × ₮165,000"},
      {"label": "Self-ligating braces", "price": "₮2,000,000", "note": "Lease: 6 mo × ₮333,000"},
      {"label": "Self-ligating ceramic braces", "price": "₮2,200,000", "note": "Lease: 6 mo × ₮367,000"},
      {"label": "Monthly adjustment", "price": "₮30,000 – ₮40,000"}
    ]
  }'::jsonb,
  'Orthodontics', true, 2
FROM public.departments d WHERE d.slug = 'orthodontics'
ON CONFLICT (slug) DO NOTHING;

-- ORAL SURGERY (restorative)
INSERT INTO public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  icon_key, image_url, hero_image_url,
  long_description_mn, long_description_en,
  duration_text_mn, duration_text_en,
  price_text_mn, price_text_en,
  content_mn, content_en,
  category, is_active, sort_order
)
SELECT 'oral-surgery', d.id,
  'Шүдний мэс заслын эмчилгээ', 'Oral surgery',
  'шүд авах, агт араа авах, шүдний мэс засал',
  'extractions, wisdom teeth, surgical dentistry',
  'surgery', '/p5.jpg', '/p6.jpg',
  'Шүдний мэс заслын эмчилгээ нь шүд авалт, агт араа авалт, хөвч уртасгах зэрэг хагалгааны шийдлүүдийг хамарна. Орчин үеийн мэдээгүйжүүлэлтийн аргаар бүх ажилбар өвдөлтгүй, аюулгүй.',
  'Oral surgery covers extractions, wisdom teeth removal and frenectomies. Modern anesthesia techniques ensure every procedure is pain-free and safe.',
  '30–90 мин', '30–90 min',
  '50,000₮ -аас', 'from ₮50,000',
  '{
    "treatments": ["Шүд авалт", "Энгийн агт араа авалт", "Саатсан агт араа авалт", "Шүдний ёзоор авалт", "Хэлний хөвч уртасгах", "Уруулын хөвч уртасгах"],
    "benefits": [
      {"title": "Өвдөлтгүй", "body": "Орчин үеийн мэдээ алдуулалт, тайвшруулах эмчилгээгээр ажилбар тайван өнгөрнө."},
      {"title": "Туршлагатай эмч", "body": "Мэс заслын чиглэлээр мэргэшсэн эмч нарын баг."},
      {"title": "Хурдан эдгэрэлт", "body": "Зөв арчилгааны зөвлөмжөөр эдгэрэлтийг хурдасгана."}
    ],
    "faq": [
      {"q": "Агт араа заавал авах ёстой юу?", "a": "Саатсан, өвдөж байгаа бол авах шаардлагатай. Рентгэн зургаар оношлоно."},
      {"q": "Хэр удаан эдгэрдэг вэ?", "a": "Ердийн тохиолдолд 3-7 хоногт эдгэрнэ."}
    ]
  }'::jsonb,
  '{
    "treatments": ["Tooth extraction", "Erupted wisdom tooth removal", "Impacted wisdom tooth removal", "Tooth root extraction", "Lingual frenectomy", "Labial frenectomy"],
    "benefits": [
      {"title": "Pain-free", "body": "Modern anesthesia and sedation ensure a calm experience."},
      {"title": "Expert surgeons", "body": "A team specializing in oral and maxillofacial surgery."},
      {"title": "Fast recovery", "body": "Proper aftercare instructions speed up healing."}
    ],
    "faq": [
      {"q": "Do wisdom teeth always need removal?", "a": "Only if impacted or causing pain. X-rays confirm the diagnosis."},
      {"q": "How long is recovery?", "a": "Typically 3–7 days for routine extractions."}
    ]
  }'::jsonb,
  'Surgery', true, 3
FROM public.departments d WHERE d.slug = 'restorative'
ON CONFLICT (slug) DO NOTHING;

-- PEDIATRIC
INSERT INTO public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  icon_key, image_url, hero_image_url,
  long_description_mn, long_description_en,
  duration_text_mn, duration_text_en,
  price_text_mn, price_text_en,
  content_mn, content_en,
  category, is_active, sort_order
)
SELECT 'pediatric', d.id,
  'Хүүхдийн шүд', 'Pediatric dentistry',
  'сүүн шүд, ломбо, угаах заалт, урьдчилан сэргийлэлт',
  'baby teeth, fillings, brushing & prevention',
  'kid', '/p3.jpg', '/p4.jpg',
  'Хүүхдийн шүдний эмчилгээ нь зөвхөн эмчилгээ биш, хүүхдийн шүдний эрүүл зуршил үүсгэх багш. Бид тоглоомтой, тайван орчинд хүүхэд бүрд эерэг туршлага бүрдүүлэхийг зорино. Хүүхдийнхээ анхны үзлэгийг 1 настайд нь хийлгэхийг зөвлөнө.',
  'Pediatric dentistry isn''t just treatment — it''s where lifelong dental habits start. We create calm, playful experiences so kids feel safe. The first visit should be at age one.',
  '20–40 мин', '20–40 min',
  '40,000₮ -аас', 'from ₮40,000',
  '{
    "treatments": ["Хүүхдийн ерөнхий үзлэг", "Сүү шүдний эмчилгээ", "Фторын эмчилгээ", "Силант (Sealant)", "Анхдагч гажиг заслын үзлэг", "Шүдний эрүүл ахуйн сургалт"],
    "benefits": [
      {"title": "Айхгүй хүүхэд", "body": "Тоглоом, шан-урамшуулалд тулгуурласан тайван хандлага."},
      {"title": "Эрт сэргийлэлт", "body": "Сүү шүдний эмчилгээ нь насанд хүрсэн шүдийг хамгаалдаг."},
      {"title": "Эцэг эхэд зөвлөгөө", "body": "Гэртээ хэрэглэх практик зөвлөмж: цэвэрлэгээ, хоол, цаг хугацаа."}
    ],
    "faq": [
      {"q": "Анхны үзлэг хэдэн настайд?", "a": "1 настайд нь хийлгэхийг зөвлөж байна."},
      {"q": "Сүү шүдийг яагаад эмчлэх ёстой вэ?", "a": "Сүү шүд унтсаны дараа ч ам, ярианд нөлөөлж, насанд хүрсэн шүдний байрлалыг хадгалдаг."}
    ]
  }'::jsonb,
  '{
    "treatments": ["Pediatric check-ups", "Baby tooth treatment", "Fluoride treatment", "Sealants", "Early orthodontic screening", "Hygiene coaching for kids"],
    "benefits": [
      {"title": "No-fear kids", "body": "Play-based, reward-based approach builds trust."},
      {"title": "Early prevention", "body": "Healthy baby teeth protect adult teeth."},
      {"title": "Parent guidance", "body": "Practical at-home tips on brushing, food and timing."}
    ],
    "faq": [
      {"q": "When should the first visit be?", "a": "By age one."},
      {"q": "Why treat baby teeth?", "a": "They guide adult teeth into place and affect speech."}
    ]
  }'::jsonb,
  'Pediatric', true, 4
FROM public.departments d WHERE d.slug = 'pediatric'
ON CONFLICT (slug) DO NOTHING;

-- GENERAL (routine dentistry)
INSERT INTO public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  icon_key, image_url, hero_image_url,
  long_description_mn, long_description_en,
  duration_text_mn, duration_text_en,
  price_text_mn, price_text_en,
  content_mn, content_en,
  category, is_active, sort_order
)
SELECT 'general', d.id,
  'Байнгын шүдний эмчилгээ', 'Routine dentistry',
  'ломбо, цайруулалт, фторт түрхлэг, шүдний чулуу',
  'fillings, whitening, fluoride, tartar removal',
  'routine', '/p4.jpg', '/hamtolon.jpg',
  'Ерөнхий шүдний эмчилгээ нь таны амны хөндийн эрүүл мэндийн үндэс. Бид мэргэжлийн цэвэрлэгээ, ломбо тавилт, урьдчилан сэргийлэх үзлэг гэх мэт өдөр тутамд хэрэгтэй цогц үйлчилгээг үзүүлдэг. 6 сар тутамд үзлэгээ хийлгэх нь шүдний өвчлөлийн эрсдэлийг 70%-иар бууруулна.',
  'General dentistry is the foundation of your oral health. We provide professional cleanings, fillings and preventive check-ups — the everyday care that keeps your smile strong. A check-up every six months reduces dental disease risk by up to 70%.',
  '30–60 мин', '30–60 min',
  '60,000₮ -аас', 'from ₮60,000',
  '{
    "treatments": ["Мэргэжлийн цэвэрлэгээ", "Ломбо тавилт", "Урьдчилан сэргийлэх үзлэг", "Хөөрөл арилгах эмчилгээ", "Шүдний хатуу хальсыг авах", "Амны эрүүл ахуйн зөвлөгөө"],
    "benefits": [
      {"title": "Урт хугацааны үр дүн", "body": "Тогтмол үзлэг шүдний асуудлыг эрт илрүүлж, том эмчилгээний эрсдэлээс хол байлгана."},
      {"title": "Хямд төлбөр", "body": "Урьдчилан сэргийлсэн үзлэг хямд, харин хайхрахгүйн дараах эмчилгээ хэдэн дахин үнэтэй."},
      {"title": "Тав тухтай орчин", "body": "Орчин үеийн тоног төхөөрөмж, өвдөлтгүй техник — үзлэг тайван өнгөрнө."}
    ],
    "faq": [
      {"q": "Хэр тогтмол үзлэг хийлгэх ёстой вэ?", "a": "6 сар тутамд нэг удаа цэвэрлэгээ, ерөнхий үзлэг хийлгэхийг зөвлөж байна."},
      {"q": "Цэвэрлэгээ хэр удаан хийгддэг вэ?", "a": "Ердийн тохиолдолд 30-45 минут үргэлжилнэ."}
    ]
  }'::jsonb,
  '{
    "treatments": ["Professional cleaning", "Fillings & restorations", "Preventive check-ups", "Gum disease treatment", "Tartar removal", "Oral hygiene coaching"],
    "benefits": [
      {"title": "Lasting results", "body": "Regular check-ups catch problems early, before they become big procedures."},
      {"title": "Affordable", "body": "Prevention costs a fraction of what neglect-driven treatment does."},
      {"title": "Comfortable visit", "body": "Modern, low-pain technique in a calm environment."}
    ],
    "faq": [
      {"q": "How often should I come in?", "a": "Every six months for cleaning and a routine check."},
      {"q": "How long does a cleaning take?", "a": "Typically 30–45 minutes."}
    ]
  }'::jsonb,
  'General', true, 5
FROM public.departments d WHERE d.slug = 'general'
ON CONFLICT (slug) DO NOTHING;

-- HYGIENE (general dept)
INSERT INTO public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  icon_key, image_url, hero_image_url,
  long_description_mn, long_description_en,
  duration_text_mn, duration_text_en,
  price_text_mn, price_text_en,
  content_mn, content_en,
  category, is_active, sort_order
)
SELECT 'hygiene', d.id,
  'Нүүр амны эрүүл ахуй', 'Oral hygiene',
  'бүх шүдний цэвэрлэгээ, шүд угаах заалт',
  'professional cleaning, brushing coaching',
  'hygiene', '/p4.jpg', '/hamtolon.jpg',
  'Мэргэжлийн шүдний цэвэрлэгээ нь шүдний чулуу, хөөрлийг бүрэн арилгаж, шүдийг өнгөлж, буйлны эрүүл мэндийг хамгаална. Зөв угаах арга, утаснаас чөлөөт зөвлөгөө — бүгдийг нэг дор.',
  'Professional cleaning removes tartar and plaque, polishes teeth and protects gum health. We also coach you on proper brushing and flossing techniques — all in one visit.',
  '30–60 мин', '30–60 min',
  '50,000₮ -аас', 'from ₮50,000',
  '{
    "treatments": ["Бүх шүдний чулуу авах", "Бүх шүдний цэвэрлэгээ ба өнгөлгөө", "Нэг шүдний чулуу авах", "Шүд угаах зөв арга заах"],
    "benefits": [
      {"title": "Цэвэр шүд", "body": "Мэргэжлийн цэвэрлэгээ гэрийн арчилгаагаар хүрч чадахгүй газрыг цэвэрлэнэ."},
      {"title": "Буйлны эрүүл мэнд", "body": "Чулуу, хөөрөл арилгаснаар буйл хавдах, цус алдах эрсдэл буурна."},
      {"title": "Гэрлэлт инээмсэглэл", "body": "Өнгөлгөөний дараа шүд илүү цагаан, гэрэлтэй харагдана."}
    ],
    "faq": [
      {"q": "Цэвэрлэгээ өвдөлттэй юу?", "a": "Ердийн тохиолдолд бага зэрэг мэдрэмж л байна, өвдөхгүй."},
      {"q": "Хэр тогтмол хийлгэх вэ?", "a": "6 сар тутамд нэг удаа хийлгэхийг зөвлөнө."}
    ]
  }'::jsonb,
  '{
    "treatments": ["Full-mouth tartar removal", "Full-mouth cleaning & polishing", "Single-tooth tartar removal", "Brushing technique coaching"],
    "benefits": [
      {"title": "Clean teeth", "body": "Professional cleaning reaches areas home care can''t."},
      {"title": "Gum health", "body": "Removing tartar and plaque reduces gum swelling and bleeding."},
      {"title": "Brighter smile", "body": "Polishing leaves teeth whiter and more radiant."}
    ],
    "faq": [
      {"q": "Is cleaning painful?", "a": "Usually just mild sensation — no pain."},
      {"q": "How often?", "a": "Every six months is recommended."}
    ]
  }'::jsonb,
  'Preventive', true, 6
FROM public.departments d WHERE d.slug = 'general'
ON CONFLICT (slug) DO NOTHING;

-- PROSTHETIC (restorative)
INSERT INTO public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  icon_key, image_url, hero_image_url,
  long_description_mn, long_description_en,
  duration_text_mn, duration_text_en,
  price_text_mn, price_text_en,
  content_mn, content_en,
  category, is_active, sort_order
)
SELECT 'prosthetic', d.id,
  'Согог заслын эмчилгээ', 'Prosthetic dentistry',
  'метал бүрээс, циркон бүрээс, хиймэл шүд',
  'metal crowns, zirconia crowns, prosthetics',
  'crown', '/p5.jpg', '/p6.jpg',
  'Согог заслын эмчилгээ нь эвдэрсэн, хугарсан шүдийг бүрээс, гүүрээр сэргээж, хоол идэх, ярих чадварыг бүрэн нөхнө. Бид циркон, метал, шаазан бүрээсний олон сонголтыг санал болгоно.',
  'Prosthetic dentistry restores broken or fractured teeth with crowns and bridges, bringing back full chewing and speech ability. We offer zirconia, metal and porcelain crown options.',
  '60–120 мин', '60–120 min',
  '800,000₮ -аас', 'from ₮800,000',
  '{
    "treatments": ["Циркон бүрээс", "Метал бүрээс", "Шаазан бүрээс", "Гүүр", "Авагддаг шүдэлбэр"],
    "benefits": [
      {"title": "Бодит дүр төрх", "body": "Циркон бүрээс бодит шүдтэй ялгагдахгүй."},
      {"title": "Бат бөх", "body": "Чанартай бүрээс 10-15 жил үйлчилнэ."},
      {"title": "Бүрэн чадвар", "body": "Хоол идэх, ярих чадвар бүрэн сэргэнэ."}
    ],
    "faq": [
      {"q": "Бүрээс хэр удаан хийгддэг вэ?", "a": "Ердийн тохиолдолд 2-3 удаагийн зочлолтоор бэлэн болно."},
      {"q": "Циркон болон метал бүрээсний ялгаа?", "a": "Циркон илүү гоо сайхантай, метал илүү хямд боловч харагдана."}
    ]
  }'::jsonb,
  '{
    "treatments": ["Zirconia crowns", "Metal crowns", "Porcelain crowns", "Bridges", "Removable dentures"],
    "benefits": [
      {"title": "Natural look", "body": "Zirconia crowns are indistinguishable from real teeth."},
      {"title": "Durable", "body": "Quality crowns last 10–15 years."},
      {"title": "Full function", "body": "Full chewing and speech ability restored."}
    ],
    "faq": [
      {"q": "How long does a crown take?", "a": "Usually ready in 2–3 visits."},
      {"q": "Zirconia vs metal?", "a": "Zirconia looks natural; metal is cheaper but visible."}
    ]
  }'::jsonb,
  'Prosthodontics', true, 7
FROM public.departments d WHERE d.slug = 'restorative'
ON CONFLICT (slug) DO NOTHING;

-- PERIODONTICS (general dept)
INSERT INTO public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  icon_key, image_url, hero_image_url,
  long_description_mn, long_description_en,
  duration_text_mn, duration_text_en,
  price_text_mn, price_text_en,
  content_mn, content_en,
  category, is_active, sort_order
)
SELECT 'periodontics', d.id,
  'Шүдний тулгуур эд эмчилгээ', 'Periodontics',
  'буйл эмчилгээ, шүд сулрах, нөхөн сэргээх',
  'gum treatment, loose teeth, regeneration',
  'gum', '/p4.jpg', '/hamtolon.jpg',
  'Буйлны эмчилгээ нь шүдний тулгуур эд — буйл, яс, холбоос эдийн өвчлөлийг эмчилж, шүд сулрахаас сэргийлнэ. Буйл нөхөлт, гүнзгий цэвэрлэгээ зэрэг мэс заслын болон мэс заслын бус аргуудыг хослуулна.',
  'Periodontics treats diseases of the supporting tissues — gums, bone and ligaments — to prevent tooth loosening. We combine surgical (gum grafting) and non-surgical (deep cleaning) approaches.',
  '60–120 мин', '60–120 min',
  '800,000₮ -аас', 'from ₮800,000',
  '{
    "treatments": ["Буйл нөхөлт — нэг шүд", "Буйл нөхөлт — 4 шүд", "Гүнзгий цэвэрлэгээ", "Буйлны мэс засал"],
    "benefits": [
      {"title": "Шүд хадгалах", "body": "Буйлны эмчилгээ шүд сулрах, унахаас сэргийлнэ."},
      {"title": "Мэргэжлийн баг", "body": "Буйлны чиглэлээр мэргэшсэн эмч нар."},
      {"title": "Урт хугацааны үр дүн", "body": "Зөв арчилгаатай хослуулбал буйл бүрэн эдгэрнэ."}
    ],
    "faq": [
      {"q": "Буйл нөхөлт өвдөлттэй юу?", "a": "Мэдээ алдуулалтаар хийгддэг тул ажилбарын үеэр өвдөхгүй."},
      {"q": "Хэр удаан эдгэрдэг вэ?", "a": "1-2 долоо хоногт бүрэн эдгэрнэ."}
    ]
  }'::jsonb,
  '{
    "treatments": ["Gum grafting — single tooth", "Gum grafting — 4 teeth", "Deep cleaning", "Gum surgery"],
    "benefits": [
      {"title": "Save your teeth", "body": "Gum treatment prevents loosening and tooth loss."},
      {"title": "Expert team", "body": "Specialists trained in periodontal care."},
      {"title": "Long-term results", "body": "Combined with proper care, gums heal fully."}
    ],
    "faq": [
      {"q": "Is gum grafting painful?", "a": "Performed under local anesthesia — no pain during the procedure."},
      {"q": "How long is recovery?", "a": "Full recovery in 1–2 weeks."}
    ]
  }'::jsonb,
  'Periodontics', true, 8
FROM public.departments d WHERE d.slug = 'general'
ON CONFLICT (slug) DO NOTHING;

-- COSMETIC
INSERT INTO public.services (
  slug, department_id, name_mn, name_en, description_mn, description_en,
  icon_key, image_url, hero_image_url,
  long_description_mn, long_description_en,
  duration_text_mn, duration_text_en,
  price_text_mn, price_text_en,
  content_mn, content_en,
  category, is_active, sort_order
)
SELECT 'cosmetic', d.id,
  'Hollywood Smile', 'Hollywood Smile',
  'тэгш сайхан, өнгөлөг цагаан шүд',
  'perfect, bright white smile',
  'smile', '/p2.jpg', '/p1.jpg',
  'Гоо засал нь таны инээмсэглэлд итгэл өгч, гадаад төрхийг тань өөрчилнө. Бид винир, шүд цайруулах, эстетик нөхөн сэргээлт зэрэг олон төрлийн үйлчилгээгээр Hollywood-ын инээмсэглэл бүтээж өгнө. Орчин үеийн материал, дижитал төлөвлөлтийн ачаар үр дүн нь 10+ жил баттай.',
  'Cosmetic dentistry transforms how you smile and how confident you feel. We offer veneers, professional whitening and aesthetic restorations to craft a Hollywood-grade smile. Modern materials and digital planning make results last 10+ years.',
  '60–120 мин', '60–120 min',
  '250,000₮ -аас', 'from ₮250,000',
  '{
    "treatments": ["Винир / Lumineers", "Шүд цайруулах", "Композит ломбо", "Smile design (дижитал)", "Шаазан бүрээс", "Гажиг засал гоо засалдтай"],
    "benefits": [
      {"title": "Хувийн дизайн", "body": "Таны нүүр, ам, шүдний онцлогт тохируулсан хувь хүний инээмсэглэлийн төлөвлөгөө."},
      {"title": "Урт хугацаанд", "body": "Чанартай винир 10-15 жил үйлчилнэ. Зөв арчилбал илүү ч удна."},
      {"title": "Шинэ итгэл", "body": "Цоо шинэ инээмсэглэл = шинэ итгэл. Ярилцлага, зураг авалт, хайр дурлал — бүгд илүү гэрэл."}
    ],
    "faq": [
      {"q": "Цайруулах хор хөнөөлтэй юу?", "a": "Үгүй. Мэргэжлийн хяналтан дор хийсэн цайруулга шүдэнд хор хөнөөлгүй."},
      {"q": "Винир болон бүрээсийн ялгаа юу вэ?", "a": "Винир нь зөвхөн шүдний урд талыг бүрхдэг харин бүрээс бүхэл шүдийг бүрхдэг."}
    ]
  }'::jsonb,
  '{
    "treatments": ["Veneers / Lumineers", "Teeth whitening", "Composite bonding", "Digital smile design", "Porcelain crowns", "Cosmetic alignment"],
    "benefits": [
      {"title": "Personalised design", "body": "A smile plan built around your face, lip line and personality."},
      {"title": "Long-lasting", "body": "Quality veneers last 10–15 years and longer with good care."},
      {"title": "Confidence boost", "body": "A new smile changes how you show up — at work, in photos, in love."}
    ],
    "faq": [
      {"q": "Is whitening safe?", "a": "Yes — supervised whitening doesn''t damage enamel."},
      {"q": "Veneers vs crowns?", "a": "Veneers cover only the front; crowns cap the entire tooth."}
    ]
  }'::jsonb,
  'Cosmetic', true, 9
FROM public.departments d WHERE d.slug = 'cosmetic'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 2. Wire parent-child hierarchy: UPDATE existing children to set parent_id
-- ============================================================================

-- IMPLANT children
UPDATE public.services SET parent_id = (SELECT id FROM public.services WHERE slug = 'implant' AND parent_id IS NULL)
WHERE slug IN ('implant-single', 'crown-zirconia') AND parent_id IS NULL;

-- ORTHODONTICS children (all orthodontics-* slugs)
UPDATE public.services SET parent_id = (SELECT id FROM public.services WHERE slug = 'orthodontics' AND parent_id IS NULL)
WHERE slug LIKE 'orthodontics-%' AND parent_id IS NULL;

-- ORAL SURGERY children
UPDATE public.services SET parent_id = (SELECT id FROM public.services WHERE slug = 'oral-surgery' AND parent_id IS NULL)
WHERE slug IN ('extraction-regular', 'wisdom-tooth-regular', 'wisdom-tooth-impacted', 'tooth-root-extraction', 'lingual-frenectomy', 'labial-frenectomy') AND parent_id IS NULL;

-- PEDIATRIC children
UPDATE public.services SET parent_id = (SELECT id FROM public.services WHERE slug = 'pediatric' AND parent_id IS NULL)
WHERE slug IN ('pediatric-filling', 'pediatric-root-canal') AND parent_id IS NULL;

-- GENERAL children
UPDATE public.services SET parent_id = (SELECT id FROM public.services WHERE slug = 'general' AND parent_id IS NULL)
WHERE slug IN ('consultation', 'xray', 'filling-adult', 'anesthesia-local', 'root-canal', 'nightguard', 'space-maintenance', 'enamel-restoration') AND parent_id IS NULL;

-- HYGIENE children
UPDATE public.services SET parent_id = (SELECT id FROM public.services WHERE slug = 'hygiene' AND parent_id IS NULL)
WHERE slug IN ('tartar-removal-single', 'tartar-removal-full', 'cleaning-full') AND parent_id IS NULL;

-- PERIODONTICS children
UPDATE public.services SET parent_id = (SELECT id FROM public.services WHERE slug = 'periodontics' AND parent_id IS NULL)
WHERE slug IN ('gum-grafting-1', 'gum-grafting-4') AND parent_id IS NULL;

-- COSMETIC children
UPDATE public.services SET parent_id = (SELECT id FROM public.services WHERE slug = 'cosmetic' AND parent_id IS NULL)
WHERE slug IN ('whitening-full', 'whitening-single-tooth', 'veneer-composite', 'tooth-gem', 'decorative-braces', 'decorative-braces-removal') AND parent_id IS NULL;

-- PROSTHETIC has no children yet (future expansion)
