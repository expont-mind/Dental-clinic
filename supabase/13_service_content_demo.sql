-- ============================================================================
-- Migration: Seed `timeline` and `testimonials` arrays for the new UI sections.
-- Merges into the existing content_mn / content_en JSONB columns so previously
-- seeded `treatments`, `benefits`, `faq`, `pricing` are preserved.
-- Idempotent: safe to re-run; the merge always overwrites the same keys.
-- ============================================================================
-- Supported timeline icon keys (see ServiceTimeline.tsx):
--   stethoscope · sparkles · calendar · shield · smile · clipboard · heart · hand
-- ============================================================================

-- ----------------------------------------------------------------------------
-- IMPLANT
-- ----------------------------------------------------------------------------
UPDATE public.services SET
  content_mn = COALESCE(content_mn, '{}'::jsonb) || '{
    "timeline": [
      {"title": "Үнэгүй зөвлөгөө", "body": "Тантай уулзаж, амны хөндийг шалгаж, эмчилгээний боломжтой хувилбаруудыг тайлбарлана.", "icon": "stethoscope"},
      {"title": "3D төлөвлөлт", "body": "Ясны нягт, мэдрэлийн байршил, эцсийн дүр төрхийг 3D загварчилж үзнэ.", "icon": "clipboard"},
      {"title": "Имплантын хагалгаа", "body": "Орон нутгийн мэдээгүйжүүлэлтээр 1 цагийн дотор хийгдэнэ. Тэр өдрөө гэр лүүгээ.", "icon": "shield"},
      {"title": "Бүрээс суулгах", "body": "Ясанд имплант бэхэлсний дараа эцсийн шаазан бүрээс хийж, шинэ инээмсэглэлээ авна.", "icon": "smile"}
    ],
    "testimonials": [
      {"quote": "Хэдэн жил алдсан шүдтэйгээ нийтийн өмнө инээх боломжгүй болсон. Имплантын дараа гэр бүлийн зурагт дахин шүдээ үзүүлэн инээж байгаад би өөрөө гайхсан.", "author": "Б. Отгонбаатар", "role": "Имплант хийлгэсэн"},
      {"quote": "Эмч маань бүх алхмыг тайлбарлаж, хагалгаа огт өвдөлтгүй өнгөрсөн. 6 сарын дараа бодит шүднээс ялгахгүй болсон.", "author": "Ц. Энхзул", "role": "2 имплант хийлгэсэн"}
    ]
  }'::jsonb,
  content_en = COALESCE(content_en, '{}'::jsonb) || '{
    "timeline": [
      {"title": "Free consultation", "body": "We meet you, examine your mouth and walk through every available option.", "icon": "stethoscope"},
      {"title": "3D planning", "body": "Bone density, nerve position and the final look are modelled in 3D before we start.", "icon": "clipboard"},
      {"title": "Implant surgery", "body": "About one hour under local anaesthesia — you walk home the same day.", "icon": "shield"},
      {"title": "Crown placement", "body": "Once the implant integrates with the bone, a porcelain crown completes your new smile.", "icon": "smile"}
    ],
    "testimonials": [
      {"quote": "I had stopped smiling in photos for years. After my implant I caught myself grinning in the family portrait — first time in a decade.", "author": "B. Otgonbaatar", "role": "Single implant"},
      {"quote": "My dentist explained every step. The surgery was completely painless. Six months in, I cannot tell the implant from my real teeth.", "author": "Ts. Enkhzul", "role": "Two implants"}
    ]
  }'::jsonb
WHERE slug = 'implant';

-- ----------------------------------------------------------------------------
-- COSMETIC
-- ----------------------------------------------------------------------------
UPDATE public.services SET
  content_mn = COALESCE(content_mn, '{}'::jsonb) || '{
    "treatments": ["Шүд цайруулалт", "Шүдний шигтгээ", "Hollywood smile", "Шаазан бүрээс (veneer)", "Composite bonding", "Гажиг шүдийг цайруулах"],
    "benefits": [
      {"title": "Хурдан үр дүн", "body": "Цайруулалт нэг өдрийн дотор 6-8 өнгөөр цайрна."},
      {"title": "Эмгэгүй", "body": "Орчин үеийн лазер технологи нь мэдрэмжтэй шүдэнд ч тохиромжтой."},
      {"title": "Бат бөх", "body": "Зөв арчилбал үр дүн 1-3 жил хадгалагдана."}
    ],
    "faq": [
      {"q": "Цайруулалт хэр удаан үргэлжлэх вэ?", "a": "1-3 жил — арчилгаа, хооллолтоос хамаарна."},
      {"q": "Veneer хэдэн жил эдэлгээтэй?", "a": "Шаазан veneer 10-15 жил, composite 5-7 жил."},
      {"q": "Хэн хийлгэх боломжгүй вэ?", "a": "Жирэмсэн, 16-аас доош насны хүүхэд, шүдний мэдрэг өвчтэй хүн зөвлөгөө аваарай."}
    ],
    "pricing": [
      {"label": "Цайруулалтын үзлэг", "price": "Үнэгүй"},
      {"label": "Лазер цайруулалт", "price": "350,000₮", "note": "1 удаагийн процедур"},
      {"label": "Шаазан veneer (1 шүд)", "price": "650,000₮"},
      {"label": "Composite bonding", "price": "180,000₮"},
      {"label": "Hollywood smile (8 шүд)", "price": "5,200,000₮", "note": "Лизингээр төлөх боломжтой"}
    ],
    "timeline": [
      {"title": "Үнэгүй зөвлөгөө", "body": "Бид таны хүсэл, шүдний өнгийг шалгаж тохирох сонголтыг санал болгоно.", "icon": "stethoscope"},
      {"title": "Шүдний цэвэрлэгээ", "body": "Эхлэхээс өмнө шүдний чулуу болон будгийг арилгаснаар үр дүн илүү тогтвортой.", "icon": "sparkles"},
      {"title": "Цайруулах процедур", "body": "Лазер эсвэл гелтэй цайруулагч 45-60 минутын дотор шүдийг 6-8 өнгөөр цайруулна.", "icon": "smile"},
      {"title": "Дараах хяналт", "body": "1 долоо хоногийн дараа хяналт, шаардлагатай бол нэмэлт зөвлөгөө.", "icon": "calendar"}
    ],
    "testimonials": [
      {"quote": "Хуримын зургийн өмнө цайруулалт хийлгэснийг наад зах нь 5-6 хүн анзаарсан. Гэрэл зургуудад үнэхээр өөр харагдсан.", "author": "Х. Сараа", "role": "Цайруулалт"},
      {"quote": "Үргэлж шүдээ нуудаг байсан. Veneer хийсний дараа шинэ бүтэн инээмсэглэлтэй болсон шиг санагдаж байна.", "author": "Б. Тэмүүлэн", "role": "Veneer (4 шүд)"}
    ]
  }'::jsonb,
  content_en = COALESCE(content_en, '{}'::jsonb) || '{
    "treatments": ["Teeth whitening", "Tooth inlays", "Hollywood smile", "Porcelain veneers", "Composite bonding", "Whitening discoloured teeth"],
    "benefits": [
      {"title": "Fast results", "body": "Whitening lifts your teeth 6–8 shades in a single visit."},
      {"title": "Painless", "body": "Modern laser whitening is gentle enough for sensitive teeth."},
      {"title": "Long-lasting", "body": "With proper care, results hold for 1–3 years."}
    ],
    "faq": [
      {"q": "How long does whitening last?", "a": "1–3 years depending on diet and care."},
      {"q": "How long do veneers last?", "a": "Porcelain veneers 10–15 years, composite 5–7 years."},
      {"q": "Who should avoid it?", "a": "Pregnant patients, kids under 16, and those with severe sensitivity should consult first."}
    ],
    "pricing": [
      {"label": "Whitening consultation", "price": "Free"},
      {"label": "Laser whitening", "price": "₮350,000", "note": "1 session"},
      {"label": "Porcelain veneer (1 tooth)", "price": "₮650,000"},
      {"label": "Composite bonding", "price": "₮180,000"},
      {"label": "Hollywood smile (8 teeth)", "price": "₮5,200,000", "note": "Lease plans available"}
    ],
    "timeline": [
      {"title": "Free consultation", "body": "We listen, shade-match your teeth, and recommend the right approach for your smile.", "icon": "stethoscope"},
      {"title": "Cleaning", "body": "Tartar and surface stains are removed first so the whitening result holds longer.", "icon": "sparkles"},
      {"title": "Whitening session", "body": "A 45–60 minute laser or gel session lifts your teeth 6–8 shades.", "icon": "smile"},
      {"title": "Follow-up", "body": "A short check-in one week later, plus aftercare guidance to make it last.", "icon": "calendar"}
    ],
    "testimonials": [
      {"quote": "I whitened my teeth before my wedding. Half a dozen people commented on the photos — it really showed.", "author": "Kh. Saraa", "role": "Whitening patient"},
      {"quote": "I used to cover my mouth when I laughed. After my veneers, I feel like I have a brand new smile.", "author": "B. Temulen", "role": "4-tooth veneer"}
    ]
  }'::jsonb
WHERE slug = 'cosmetic';

-- ----------------------------------------------------------------------------
-- ORTHODONTICS
-- ----------------------------------------------------------------------------
UPDATE public.services SET
  content_mn = COALESCE(content_mn, '{}'::jsonb) || '{
    "timeline": [
      {"title": "Эхний үзлэг", "body": "Шүдний эгнэлт, өсөлтийн загвар, амны хөндийг шалгана. 30 минут.", "icon": "stethoscope"},
      {"title": "Оношилгоо ба төлөвлөлт", "body": "Рентген, дижитал хэвлэл авч, эмчилгээний үе шатыг тодорхойлно.", "icon": "clipboard"},
      {"title": "Аппарат тогтоох", "body": "Сонгосон хувилбараар (металл, керамик, эсвэл шилэн) аппаратыг 1.5 цагт суулгана.", "icon": "shield"},
      {"title": "Сар бүрийн хяналт", "body": "3-4 долоо хоног тутамд чангалгаа, ахицын хяналт хийгдэнэ.", "icon": "calendar"},
      {"title": "Хяналтын аппарат", "body": "Эмчилгээ дууссаны дараа үр дүнг хадгалах хяналтын аппарат хийнэ.", "icon": "smile"}
    ],
    "testimonials": [
      {"quote": "16 настайдаа эхэлж, 18 насандаа дуусгасан. Эгнэлт нь үнэхээр төгс. Эмч маань үе шат бүрийн зурагтай харьцуулалт явуулдаг байсан нь маш урам зориг өгсөн.", "author": "С. Цолмон", "role": "Металл аппарат — 22 сар"},
      {"quote": "Invisalign сонгосон нь ажил дээрээ ярилцлага хийхэд маш тохиромжтой байсан. Хэн ч анзаарсангүй.", "author": "Б. Эрдэнэцэцэг", "role": "Invisalign — 14 сар"}
    ]
  }'::jsonb,
  content_en = COALESCE(content_en, '{}'::jsonb) || '{
    "timeline": [
      {"title": "Initial assessment", "body": "We check your bite, growth pattern and overall oral health. About 30 minutes.", "icon": "stethoscope"},
      {"title": "Diagnosis & plan", "body": "X-rays and digital impressions let us map the full treatment journey.", "icon": "clipboard"},
      {"title": "Fit the appliance", "body": "Whether metal, ceramic or clear aligners, fitting takes about 1.5 hours.", "icon": "shield"},
      {"title": "Monthly check-ins", "body": "Every 3–4 weeks we tighten, track and answer any questions.", "icon": "calendar"},
      {"title": "Retainer phase", "body": "A retainer locks in your new alignment once active treatment ends.", "icon": "smile"}
    ],
    "testimonials": [
      {"quote": "Started at 16, finished at 18. The alignment is perfect. My doctor showed before/after side-by-sides at every check-in — it kept me motivated.", "author": "S. Tsolmon", "role": "Metal braces — 22 months"},
      {"quote": "I picked Invisalign because I lead meetings at work. Nobody ever noticed I was in treatment.", "author": "B. Erdenetsetseg", "role": "Invisalign — 14 months"}
    ]
  }'::jsonb
WHERE slug = 'orthodontics';

-- ----------------------------------------------------------------------------
-- GENERAL (family check-ups and routine care)
-- ----------------------------------------------------------------------------
UPDATE public.services SET
  content_mn = COALESCE(content_mn, '{}'::jsonb) || '{
    "timeline": [
      {"title": "Ерөнхий үзлэг", "body": "Шүд тус бүр, буйл, амны хөндийг сайтар шалгана.", "icon": "stethoscope"},
      {"title": "Рентген (шаардлагатай бол)", "body": "Далд эмгэгийг илрүүлэхийн тулд цахим рентген авна.", "icon": "clipboard"},
      {"title": "Шүдний цэвэрлэгээ", "body": "Чулуу, өнгөн будгийг арилгаснаар буйл эрүүл болно.", "icon": "sparkles"},
      {"title": "Зөвлөгөө, дараагийн төлөвлөгөө", "body": "Илэрсэн зүйлсийг тайлбарлаж, 6 сарын дараах хяналтыг товлоно.", "icon": "calendar"}
    ],
    "testimonials": [
      {"quote": "Хоёр настай хүү маань шүдний эмч гэхэд айдаг байсан. Энд ирэхээр шууд тайван болдог — эмч маань тоглоом, инээдтэйгээр үзлэгээ хийдэг.", "author": "Б. Нарантуяа", "role": "Гэр бүлийн үзлэг"},
      {"quote": "10 жил нэг л клиникт хяналт хийлгэдэг. Цаг товлох амархан, үргэлж цаг ажиллаж, нөхөрсөг.", "author": "Д. Ганболд", "role": "Тогтмол үзлэг"}
    ]
  }'::jsonb,
  content_en = COALESCE(content_en, '{}'::jsonb) || '{
    "timeline": [
      {"title": "Examination", "body": "A careful tooth-by-tooth check, plus gums and soft tissues.", "icon": "stethoscope"},
      {"title": "X-ray (if needed)", "body": "Digital X-rays catch issues hidden between teeth or under the gum.", "icon": "clipboard"},
      {"title": "Cleaning", "body": "Tartar and surface staining are removed — gums recover within days.", "icon": "sparkles"},
      {"title": "Plan & next steps", "body": "We walk through findings, answer questions and schedule your 6-month check.", "icon": "calendar"}
    ],
    "testimonials": [
      {"quote": "My 2-year-old used to be terrified of the dentist. Here he relaxes the moment we walk in — the doctor turns the check-up into a game.", "author": "B. Narantuya", "role": "Family check-up"},
      {"quote": "Same clinic for 10 years. Booking is easy, they run on time, and the team feels like friends.", "author": "D. Ganbold", "role": "Routine patient"}
    ]
  }'::jsonb
WHERE slug = 'general';

-- ----------------------------------------------------------------------------
-- HYGIENE
-- ----------------------------------------------------------------------------
UPDATE public.services SET
  content_mn = COALESCE(content_mn, '{}'::jsonb) || '{
    "timeline": [
      {"title": "Эхний үзлэг", "body": "Шүдний чулуу, буйлны үрэвсэл, өнгөн будгийг шалгана.", "icon": "stethoscope"},
      {"title": "Ultrasonic цэвэрлэгээ", "body": "Цахим долгионоор хатуу чулууг өвдөлтгүйгээр арилгана.", "icon": "sparkles"},
      {"title": "Air-flow өнгөлгөө", "body": "Кофе, цай, тамхины үлдэгдлийг идэвхтэй давсаар арилгана.", "icon": "smile"},
      {"title": "Зөвлөгөө", "body": "Гэртээ хэрхэн арчлах, аль сойз, утас тохиромжтойг тайлбарлана.", "icon": "shield"}
    ],
    "testimonials": [
      {"quote": "Анх удаа Air-flow хийлгэсэн. Шүдээ толинд харахад 2-3 өнгөөр цайрсан байсан, харин үнэхээр зөөлөн процедур.", "author": "Г. Алтанчимэг", "role": "Цэвэрлэгээ"},
      {"quote": "Жил болгон 2 удаа цэвэрлэгээ хийлгэдэг болсноос хойш буйл огт цусан гарахаа больсон.", "author": "Х. Нарантуул", "role": "Тогтмол хяналт"}
    ]
  }'::jsonb,
  content_en = COALESCE(content_en, '{}'::jsonb) || '{
    "timeline": [
      {"title": "Initial check", "body": "We inspect for tartar, gum inflammation and surface stains.", "icon": "stethoscope"},
      {"title": "Ultrasonic cleaning", "body": "Gentle ultrasound waves remove hardened tartar without pain.", "icon": "sparkles"},
      {"title": "Air-flow polish", "body": "Active powders lift coffee, tea and tobacco stains for a brighter finish.", "icon": "smile"},
      {"title": "Home-care advice", "body": "We talk through brushing, flossing and the right tools for your mouth.", "icon": "shield"}
    ],
    "testimonials": [
      {"quote": "First time I tried Air-flow. My teeth were 2–3 shades brighter in the mirror — and the whole thing was surprisingly gentle.", "author": "G. Altanchimeg", "role": "Cleaning"},
      {"quote": "Twice-a-year cleanings completely stopped my gum bleeding.", "author": "Kh. Narantuul", "role": "Regular patient"}
    ]
  }'::jsonb
WHERE slug = 'hygiene';

-- ----------------------------------------------------------------------------
-- ORAL SURGERY
-- ----------------------------------------------------------------------------
UPDATE public.services SET
  content_mn = COALESCE(content_mn, '{}'::jsonb) || '{
    "timeline": [
      {"title": "Зөвлөгөө ба рентген", "body": "Хагалгааны өмнөх үзлэг, 3D рентген авч төлөвлөнө.", "icon": "stethoscope"},
      {"title": "Бэлтгэл", "body": "Орон нутгийн мэдээгүйжүүлэлт, шаардлагатай бол sedation хийнэ.", "icon": "shield"},
      {"title": "Хагалгаа", "body": "Туршлагатай мэс заслын эмч 30-60 минутын дотор гүйцэтгэнэ.", "icon": "hand"},
      {"title": "Сэргэлт", "body": "1-2 хоног хатуу хоол идэхгүй, 7 хоногийн дараа хяналт.", "icon": "heart"}
    ],
    "testimonials": [
      {"quote": "Шинжлэгчтэй ухмал шүдээ авхуулах гэж айгаад жил гаруй явсан. Эмч маань 30 минутын дотор бүгдийг хийсэн, өвдөлтгүй.", "author": "Ө. Бат-Эрдэнэ", "role": "Шинжлэгчтэй шүд авах"},
      {"quote": "Sedation сонгосон нь зөв болсон. Гэртээ хариад өвдөлт мэдрэлгүй унтсан.", "author": "Б. Энхтуяа", "role": "Хагалгаа"}
    ]
  }'::jsonb,
  content_en = COALESCE(content_en, '{}'::jsonb) || '{
    "timeline": [
      {"title": "Consult & imaging", "body": "Pre-surgery exam and a 3D X-ray so we plan around every nerve and vessel.", "icon": "stethoscope"},
      {"title": "Preparation", "body": "Local anaesthesia, or optional sedation for nervous patients.", "icon": "shield"},
      {"title": "Surgery", "body": "An experienced oral surgeon completes the procedure in 30–60 minutes.", "icon": "hand"},
      {"title": "Recovery", "body": "Soft foods for a day or two and a follow-up after one week.", "icon": "heart"}
    ],
    "testimonials": [
      {"quote": "I put off my wisdom-tooth extraction for over a year. The surgeon was done in 30 minutes — no pain at all.", "author": "U. Bat-Erdene", "role": "Wisdom-tooth extraction"},
      {"quote": "Choosing sedation was the right call. I went home and slept comfortably the whole night.", "author": "B. Enkhtuya", "role": "Surgical patient"}
    ]
  }'::jsonb
WHERE slug = 'oral-surgery';

-- ============================================================================
-- Verify
-- ============================================================================
SELECT slug,
       jsonb_array_length(COALESCE(content_mn->'timeline', '[]'::jsonb))     AS mn_timeline,
       jsonb_array_length(COALESCE(content_mn->'testimonials', '[]'::jsonb)) AS mn_testimonials,
       jsonb_array_length(COALESCE(content_en->'timeline', '[]'::jsonb))     AS en_timeline,
       jsonb_array_length(COALESCE(content_en->'testimonials', '[]'::jsonb)) AS en_testimonials
FROM public.services
WHERE slug IN ('implant','cosmetic','orthodontics','general','hygiene','oral-surgery')
ORDER BY slug;
