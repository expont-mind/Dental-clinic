/**
 * Static, content-only metadata that complements DB-backed departments.
 * Keyed by department slug (general, cosmetic, orthodontics, pediatric, restorative).
 */

export type PriceRow = {
  label: string;
  price: string;
  note?: string;
};

export type ServiceDetail = {
  image: string;
  hero_image: string;
  duration_mn: string;
  duration_en: string;
  price_from_mn: string;
  price_from_en: string;
  long_mn: string;
  long_en: string;
  treatments_mn: string[];
  treatments_en: string[];
  benefits_mn: { title: string; body: string }[];
  benefits_en: { title: string; body: string }[];
  faq_mn: { q: string; a: string }[];
  faq_en: { q: string; a: string }[];
  pricing_mn?: PriceRow[];
  pricing_en?: PriceRow[];
};

export const SERVICE_DETAILS: Record<string, ServiceDetail> = {
  general: {
    image: "/p4.jpg",
    hero_image: "/hamtolon.jpg",
    duration_mn: "30–60 мин",
    duration_en: "30–60 min",
    price_from_mn: "60,000₮ -аас",
    price_from_en: "from ₮60,000",
    long_mn:
      "Ерөнхий шүдний эмчилгээ нь таны амны хөндийн эрүүл мэндийн үндэс. Бид мэргэжлийн цэвэрлэгээ, ломбо тавилт, урьдчилан сэргийлэх үзлэг гэх мэт өдөр тутамд хэрэгтэй цогц үйлчилгээг үзүүлдэг. 6 сар тутамд үзлэгээ хийлгэх нь шүдний өвчлөлийн эрсдэлийг 70%-иар бууруулна.",
    long_en:
      "General dentistry is the foundation of your oral health. We provide professional cleanings, fillings and preventive check-ups — the everyday care that keeps your smile strong. A check-up every six months reduces dental disease risk by up to 70%.",
    treatments_mn: [
      "Мэргэжлийн цэвэрлэгээ",
      "Ломбо тавилт",
      "Урьдчилан сэргийлэх үзлэг",
      "Хөөрөл арилгах эмчилгээ",
      "Шүдний хатуу хальсыг авах",
      "Амны эрүүл ахуйн зөвлөгөө",
    ],
    treatments_en: [
      "Professional cleaning",
      "Fillings & restorations",
      "Preventive check-ups",
      "Gum disease treatment",
      "Tartar removal",
      "Oral hygiene coaching",
    ],
    benefits_mn: [
      {
        title: "Урт хугацааны үр дүн",
        body: "Тогтмол үзлэг шүдний асуудлыг эрт илрүүлж, том эмчилгээний эрсдэлээс хол байлгана.",
      },
      {
        title: "Хямд төлбөр",
        body: "Урьдчилан сэргийлсэн үзлэг хямд, харин хайхрахгүйн дараах эмчилгээ хэдэн дахин үнэтэй.",
      },
      {
        title: "Тав тухтай орчин",
        body: "Орчин үеийн тоног төхөөрөмж, өвдөлтгүй техник — үзлэг тайван өнгөрнө.",
      },
    ],
    benefits_en: [
      {
        title: "Lasting results",
        body: "Regular check-ups catch problems early, before they become big procedures.",
      },
      {
        title: "Affordable",
        body: "Prevention costs a fraction of what neglect-driven treatment does.",
      },
      {
        title: "Comfortable visit",
        body: "Modern, low-pain technique in a calm environment.",
      },
    ],
    faq_mn: [
      {
        q: "Хэр тогтмол үзлэг хийлгэх ёстой вэ?",
        a: "6 сар тутамд нэг удаа цэвэрлэгээ, ерөнхий үзлэг хийлгэхийг зөвлөж байна.",
      },
      {
        q: "Цэвэрлэгээ хэр удаан хийгддэг вэ?",
        a: "Ердийн тохиолдолд 30-45 минут үргэлжилнэ.",
      },
    ],
    faq_en: [
      {
        q: "How often should I come in?",
        a: "Every six months for cleaning and a routine check.",
      },
      {
        q: "How long does a cleaning take?",
        a: "Typically 30–45 minutes.",
      },
    ],
  },

  cosmetic: {
    image: "/p2.jpg",
    hero_image: "/p1.jpg",
    duration_mn: "60–120 мин",
    duration_en: "60–120 min",
    price_from_mn: "250,000₮ -аас",
    price_from_en: "from ₮250,000",
    long_mn:
      "Гоо засал нь таны инээмсэглэлд итгэл өгч, гадаад төрхийг тань өөрчилнө. Бид винир, шүд цайруулах, эстетик нөхөн сэргээлт зэрэг олон төрлийн үйлчилгээгээр Hollywood-ын инээмсэглэл бүтээж өгнө. Орчин үеийн материал, дижитал төлөвлөлтийн ачаар үр дүн нь 10+ жил баттай.",
    long_en:
      "Cosmetic dentistry transforms how you smile and how confident you feel. We offer veneers, professional whitening and aesthetic restorations to craft a Hollywood-grade smile. Modern materials and digital planning make results last 10+ years.",
    treatments_mn: [
      "Винир / Lumineers",
      "Шүд цайруулах",
      "Композит ломбо",
      "Smile design (дижитал)",
      "Шаазан бүрээс",
      "Гажиг засал гоо засалдтай",
    ],
    treatments_en: [
      "Veneers / Lumineers",
      "Teeth whitening",
      "Composite bonding",
      "Digital smile design",
      "Porcelain crowns",
      "Cosmetic alignment",
    ],
    benefits_mn: [
      {
        title: "Хувийн дизайн",
        body: "Таны нүүр, ам, шүдний онцлогт тохируулсан хувь хүний инээмсэглэлийн төлөвлөгөө.",
      },
      {
        title: "Урт хугацаанд",
        body: "Чанартай винир 10-15 жил үйлчилнэ. Зөв арчилбал илүү ч удна.",
      },
      {
        title: "Шинэ итгэл",
        body: "Цоо шинэ инээмсэглэл = шинэ итгэл. Ярилцлага, зураг авалт, хайр дурлал — бүгд илүү гэрэл.",
      },
    ],
    benefits_en: [
      {
        title: "Personalised design",
        body: "A smile plan built around your face, lip line and personality.",
      },
      {
        title: "Long-lasting",
        body: "Quality veneers last 10–15 years and longer with good care.",
      },
      {
        title: "Confidence boost",
        body: "A new smile changes how you show up — at work, in photos, in love.",
      },
    ],
    faq_mn: [
      {
        q: "Цайруулах хор хөнөөлтэй юу?",
        a: "Үгүй. Мэргэжлийн хяналтан дор хийсэн цайруулга шүдэнд хор хөнөөлгүй.",
      },
      {
        q: "Винир болон бүрээсийн ялгаа юу вэ?",
        a: "Винир нь зөвхөн шүдний урд талыг бүрхдэг харин бүрээс бүхэл шүдийг бүрхдэг.",
      },
    ],
    faq_en: [
      {
        q: "Is whitening safe?",
        a: "Yes — supervised whitening doesn't damage enamel.",
      },
      {
        q: "Veneers vs crowns?",
        a: "Veneers cover only the front; crowns cap the entire tooth.",
      },
    ],
  },

  orthodontics: {
    image: "/p1.jpg",
    hero_image: "/p3.jpg",
    duration_mn: "12–24 сар",
    duration_en: "12–24 months",
    price_from_mn: "Үзлэг үнэгүй",
    price_from_en: "Free consultation",
    long_mn:
      "Гажиг засал нь шүдний эгнэлт, амны хөндийн зохистой үйл ажиллагааг сэргээдэг. Уламжлалт металл брэкэт, гоо сайхны керамик брэкэт, эсвэл шилэн (Invisalign) гэх мэт олон сонголт. Орчин үеийн дижитал төлөвлөгөөгөөр эмчилгээний хугацаа богиносч, үр дүнгийн нарийвчлал нэмэгдсэн.",
    long_en:
      "Orthodontics straightens crooked teeth and corrects the bite. Choose from traditional metal braces, ceramic, or clear aligners (Invisalign). Digital treatment planning shortens timelines and improves precision.",
    treatments_mn: [
      "Уламжлалт металл брэкэт",
      "Керамик / гоо сайхны брэкэт",
      "Шилэн брэкэт (Invisalign)",
      "Хүүхдийн гажиг засал",
      "Хяналтын аппарат",
      "3D дижитал төлөвлөлт",
    ],
    treatments_en: [
      "Traditional metal braces",
      "Ceramic / aesthetic braces",
      "Clear aligners (Invisalign)",
      "Pediatric orthodontics",
      "Retainers",
      "3D digital planning",
    ],
    benefits_mn: [
      {
        title: "Зөв эгнэлт",
        body: "Шууд шүд цэвэрлэхэд хялбар, хүнсний хатуу хальс үлдэхгүй.",
      },
      {
        title: "Эрүүл бай хэвлий",
        body: "Зүй ёсны эгнэлт нь хооллолт, ярианд эерэг.",
      },
      {
        title: "Хяналт",
        body: "Эмчилгээний явцыг 3 долоо хоног тутам шалгаж, бүх явцыг тань хувьсгалт хяналт ажиллана.",
      },
    ],
    benefits_en: [
      {
        title: "Straight teeth",
        body: "Easier to brush, less plaque, healthier gums.",
      },
      {
        title: "Better function",
        body: "Proper alignment improves chewing and speech.",
      },
      {
        title: "Tracked progress",
        body: "Check-ins every 3 weeks keep treatment on schedule.",
      },
    ],
    faq_mn: [
      {
        q: "Хэр насанд хийлгэх вэ?",
        a: "Аль ч насанд тохиромжтой. Хүүхэд, өсвөр насныханд 12-16 нас хамгийн оновчтой.",
      },
      {
        q: "Эмчилгээ өвдөлттэй юу?",
        a: "Эхэн үе бага зэрэг даралттай мэдрэмж байж болох ч хэдэн өдрийн дотор алга болно.",
      },
    ],
    faq_en: [
      {
        q: "What age is best?",
        a: "Any age — but 12–16 is often optimal for kids.",
      },
      {
        q: "Does it hurt?",
        a: "Mild pressure for the first few days, then nothing.",
      },
    ],
    pricing_mn: [
      { label: "Үзлэг зөвлөгөө", price: "Үнэгүй" },
      { label: "Зураг авалт", price: "30,000₮" },
      { label: "Оношилгоо", price: "50,000₮" },
      {
        label: "Металл аппарат",
        price: "1,440,000₮",
        note: "Лизингээр: 6 сар × 240,000₮ эсвэл 12 сар × 120,000₮",
      },
      {
        label: "Шаазан аппарат",
        price: "1,800,000₮",
        note: "Лизингээр: 6 сар × 300,000₮ эсвэл 12 сар × 150,000₮",
      },
      {
        label: "Сафир аппарат",
        price: "1,980,000₮",
        note: "Лизингээр: 6 сар × 330,000₮ эсвэл 12 сар × 165,000₮",
      },
      {
        label: "Өөрөө түгжээтэй аппарат",
        price: "2,000,000₮",
        note: "Лизингээр: 6 сар × 333,000₮",
      },
      {
        label: "Өөрөө түгжээтэй шаазан аппарат",
        price: "2,200,000₮",
        note: "Лизингээр: 6 сар × 367,000₮",
      },
      {
        label: "Сар бүрийн чангалгаа",
        price: "30,000₮ – 40,000₮",
      },
    ],
    pricing_en: [
      { label: "Consultation", price: "Free" },
      { label: "X-ray imaging", price: "₮30,000" },
      { label: "Diagnosis", price: "₮50,000" },
      {
        label: "Metal braces",
        price: "₮1,440,000",
        note: "Lease: 6 mo × ₮240,000 or 12 mo × ₮120,000",
      },
      {
        label: "Ceramic braces",
        price: "₮1,800,000",
        note: "Lease: 6 mo × ₮300,000 or 12 mo × ₮150,000",
      },
      {
        label: "Sapphire braces",
        price: "₮1,980,000",
        note: "Lease: 6 mo × ₮330,000 or 12 mo × ₮165,000",
      },
      {
        label: "Self-ligating braces",
        price: "₮2,000,000",
        note: "Lease: 6 mo × ₮333,000",
      },
      {
        label: "Self-ligating ceramic braces",
        price: "₮2,200,000",
        note: "Lease: 6 mo × ₮367,000",
      },
      {
        label: "Monthly adjustment",
        price: "₮30,000 – ₮40,000",
      },
    ],
  },

  pediatric: {
    image: "/p3.jpg",
    hero_image: "/p4.jpg",
    duration_mn: "20–40 мин",
    duration_en: "20–40 min",
    price_from_mn: "40,000₮ -аас",
    price_from_en: "from ₮40,000",
    long_mn:
      "Хүүхдийн шүдний эмчилгээ нь зөвхөн эмчилгээ биш, хүүхдийн шүдний эрүүл зуршил үүсгэх багш. Бид тоглоомтой, тайван орчинд хүүхэд бүрд эерэг туршлага бүрдүүлэхийг зорино. Хүүхдийнхээ анхны үзлэгийг 1 настайд нь хийлгэхийг зөвлөнө.",
    long_en:
      "Pediatric dentistry isn't just treatment — it's where lifelong dental habits start. We create calm, playful experiences so kids feel safe. The first visit should be at age one.",
    treatments_mn: [
      "Хүүхдийн ерөнхий үзлэг",
      "Сүү шүдний эмчилгээ",
      "Фторын эмчилгээ",
      "Силант (Sealant)",
      "Анхдагч гажиг заслын үзлэг",
      "Шүдний эрүүл ахуйн сургалт",
    ],
    treatments_en: [
      "Pediatric check-ups",
      "Baby tooth treatment",
      "Fluoride treatment",
      "Sealants",
      "Early orthodontic screening",
      "Hygiene coaching for kids",
    ],
    benefits_mn: [
      {
        title: "Айхгүй хүүхэд",
        body: "Тоглоом, шан-урамшуулалд тулгуурласан тайван хандлага.",
      },
      {
        title: "Эрт сэргийлэлт",
        body: "Сүү шүдний эмчилгээ нь насанд хүрсэн шүдийг хамгаалдаг.",
      },
      {
        title: "Эцэг эхэд зөвлөгөө",
        body: "Гэртээ хэрэглэх практик зөвлөмж: цэвэрлэгээ, хоол, цаг хугацаа.",
      },
    ],
    benefits_en: [
      {
        title: "No-fear kids",
        body: "Play-based, reward-based approach builds trust.",
      },
      {
        title: "Early prevention",
        body: "Healthy baby teeth protect adult teeth.",
      },
      {
        title: "Parent guidance",
        body: "Practical at-home tips on brushing, food and timing.",
      },
    ],
    faq_mn: [
      {
        q: "Анхны үзлэг хэдэн настайд?",
        a: "1 настайд нь хийлгэхийг зөвлөж байна.",
      },
      {
        q: "Сүү шүдийг яагаад эмчлэх ёстой вэ?",
        a: "Сүү шүд унтсаны дараа ч ам, ярианд нөлөөлж, насанд хүрсэн шүдний байрлалыг хадгалдаг.",
      },
    ],
    faq_en: [
      {
        q: "When should the first visit be?",
        a: "By age one.",
      },
      {
        q: "Why treat baby teeth?",
        a: "They guide adult teeth into place and affect speech.",
      },
    ],
  },

  restorative: {
    image: "/p5.jpg",
    hero_image: "/p6.jpg",
    duration_mn: "60–180 мин",
    duration_en: "60–180 min",
    price_from_mn: "1,500,000₮ -аас",
    price_from_en: "from ₮1,500,000",
    long_mn:
      "Имплант, бүрээс, гүүр зэрэг сэргээх эмчилгээ нь алдсан эсвэл гэмтсэн шүдийг бүрэн сэргээж, бодит шүдтэй ялгагдахгүй гадаад төрх, чанарыг өгнө. Бид ОУ-ын стандартын материал, 3D дижитал төлөвлөлт, чанарын баталгаа ашиглана.",
    long_en:
      "Implants, crowns and bridges restore teeth that are missing or damaged so they look and feel like the originals. We use international-grade materials, 3D planning and a quality guarantee.",
    treatments_mn: [
      "Шүдний имплант",
      "Шаазан бүрээс",
      "Гүүр",
      "Бөгөөн (overdenture)",
      "Үндэс эмчилгээ",
      "Эмгэг хагалгаа",
    ],
    treatments_en: [
      "Dental implants",
      "Porcelain crowns",
      "Bridges",
      "Overdentures",
      "Root canal therapy",
      "Surgical extraction",
    ],
    benefits_mn: [
      {
        title: "Бодит дүр төрх",
        body: "Имплант шинэ шүд шиг хэлбэр, өнгөтэй.",
      },
      {
        title: "Удаан хадгална",
        body: "Зөв арчилбал имплант 25+ жил үйлчилнэ.",
      },
      {
        title: "Бүрэн чадвар",
        body: "Бүх төрлийн хоол идэх, ярих, инээх боломжтой.",
      },
    ],
    benefits_en: [
      {
        title: "Natural look",
        body: "Implants look and feel like real teeth.",
      },
      {
        title: "Long-lasting",
        body: "With proper care, implants last 25+ years.",
      },
      {
        title: "Full function",
        body: "Eat, talk and smile without any restrictions.",
      },
    ],
    faq_mn: [
      {
        q: "Имплант хэдэн өдөр?",
        a: "Хагалгаа 1 цаг, эмчилгээний нийт хугацаа 3-6 сар.",
      },
      {
        q: "Өвдөлттэй юу?",
        a: "Орчин үеийн анестези, орон нутгийн мэдээгүйжүүлэлтээр өвдөлтгүй.",
      },
    ],
    faq_en: [
      {
        q: "How long for an implant?",
        a: "Surgery takes about an hour; full timeline is 3–6 months.",
      },
      {
        q: "Is it painful?",
        a: "Modern anesthesia keeps the procedure pain-free.",
      },
    ],
  },
};

export function getServiceDetail(slug: string): ServiceDetail | null {
  return SERVICE_DETAILS[slug] ?? null;
}

/**
 * Patient-facing services catalog — shown on /services page.
 * Each item links to a department slug for booking + detail routing.
 */
export type ServiceCatalogItem = {
  slug: string;
  dept_slug: string;
  icon: ServiceIconKey;
  title_mn: string;
  title_en: string;
  description_mn: string;
  description_en: string;
};

export type ServiceIconKey =
  | "implant"
  | "braces"
  | "surgery"
  | "kid"
  | "routine"
  | "hygiene"
  | "crown"
  | "gum"
  | "smile";

export const SERVICE_CATALOG: ServiceCatalogItem[] = [
  {
    slug: "implant",
    dept_slug: "restorative",
    icon: "implant",
    title_mn: "Имплант",
    title_en: "Implant",
    description_mn:
      "хиймэл шүд, авагддаг авагддагүй шүдэлбэр",
    description_en:
      "dental implants, removable & fixed prosthetics",
  },
  {
    slug: "orthodontics",
    dept_slug: "orthodontics",
    icon: "braces",
    title_mn: "Шүдний гажиг засал",
    title_en: "Orthodontics",
    description_mn: "шүдний аппарат төрөл, үнэ ханш",
    description_en: "braces, aligners and bite correction",
  },
  {
    slug: "oral-surgery",
    dept_slug: "restorative",
    icon: "surgery",
    title_mn: "Шүдний мэс заслын эмчилгээ",
    title_en: "Oral surgery",
    description_mn: "шүд авах, агт араа авах, шүдний мэс засал",
    description_en: "extractions, wisdom teeth, surgical dentistry",
  },
  {
    slug: "pediatric",
    dept_slug: "pediatric",
    icon: "kid",
    title_mn: "Хүүхдийн шүд",
    title_en: "Pediatric dentistry",
    description_mn:
      "сүүн шүд, ломбо, угаах заалт, урьдчилан сэргийлэлт",
    description_en:
      "baby teeth, fillings, brushing & prevention",
  },
  {
    slug: "general",
    dept_slug: "general",
    icon: "routine",
    title_mn: "Байнгын шүдний эмчилгээ",
    title_en: "Routine dentistry",
    description_mn: "ломбо, цайруулалт, фторт түрхлэг, шүдний чулуу",
    description_en: "fillings, whitening, fluoride, tartar removal",
  },
  {
    slug: "hygiene",
    dept_slug: "general",
    icon: "hygiene",
    title_mn: "Нүүр амны эрүүл ахуй",
    title_en: "Oral hygiene",
    description_mn: "бүх шүдний цэвэрлэгээ, шүд угаах заалт",
    description_en: "professional cleaning, brushing coaching",
  },
  {
    slug: "prosthetic",
    dept_slug: "restorative",
    icon: "crown",
    title_mn: "Согог заслын эмчилгээ",
    title_en: "Prosthetic dentistry",
    description_mn: "метал бүрээс, циркон бүрээс, хиймэл шүд",
    description_en: "metal crowns, zirconia crowns, prosthetics",
  },
  {
    slug: "periodontics",
    dept_slug: "general",
    icon: "gum",
    title_mn: "Шүдний тулгуур эд эмчилгээ",
    title_en: "Periodontics",
    description_mn: "буйл эмчилгээ, шүд сулрах, нөхөн сэргээх",
    description_en: "gum treatment, loose teeth, regeneration",
  },
  {
    slug: "cosmetic",
    dept_slug: "cosmetic",
    icon: "smile",
    title_mn: "Hollywood Smile",
    title_en: "Hollywood Smile",
    description_mn: "тэгш сайхан, өнгөлөг цагаан шүд",
    description_en: "perfect, bright white smile",
  },
];
