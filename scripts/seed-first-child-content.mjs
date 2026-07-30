#!/usr/bin/env node
/**
 * Seeds detail-page content for the "headline" first child of each of the
 * 12 catalog categories. Other children stay minimal — the service detail
 * page already degrades gracefully when long_description / content blocks
 * are absent.
 *
 * Run AFTER supabase/20_brochure_rebuild.sql so the target rows exist.
 *
 * Usage: node scripts/seed-first-child-content.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const envFile = readFileSync(new URL("../.env", import.meta.url), "utf-8");
const env = Object.fromEntries(
  envFile
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => l.trim().split("="))
    .filter(([k, v]) => k && v)
    .map(([k, ...rest]) => [k, rest.join("=")]),
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

// ---------- Content authored for each category's headline service ----------

const ENTRIES = [
  {
    slug: "cosmetic-whitening-clinic",
    icon_key: "smile",
    hero_image_url: "/close-up-beautiful-womans-perfect-white-teeth-smiling-lips 1.jpg",
    description_mn:
      "Эмнэлгийн нөхцөлд хийдэг профессионал шүд цайруулалт — 60–90 минутын дотор хэдэн өнгөөр цайруулна.",
    description_en:
      "In-clinic professional teeth whitening — visibly brighter in just one 60–90 minute visit.",
    long_description_mn:
      "Эмнэлгийн нөхцөлд хийгддэг шүд цайруулалт нь гэрийн нөхцөлоос илүү хүчтэй, илүү найдвартай үр дүн өгдөг. Эмч таны буйлыг хамгаалж, мэргэжлийн идэвхгүйжүүлэгчтэй гель түрхэн, идэвхжүүлэгч гэрэлээр чөлөөтэй цайруулах процессыг хянаж явуулдаг.\n\nНэг ирэлтийн дотор шүдний өнгийг ердийн 4–8 өнгөөр цайруулах боломжтой. Сонголтоос хамаараад солонгос, япон, америк, бразил төрлийн системээс таны шүдний эмзэглэл, өнгөнд тохирох технологийг сонгож хийнэ. Цайруулсны дараа гэрийн зөвлөмж, тогтворжуулах дэглэмийг эмч өгнө.",
    long_description_en:
      "In-clinic whitening delivers stronger, more predictable results than over-the-counter kits. Your dentist isolates the gums, applies a medical-grade peroxide gel and activates it with a light source while monitoring the process throughout.\n\nA single visit typically lifts the natural shade by 4–8 levels. Depending on tooth sensitivity and the look you want, we choose between Korean, Japanese, American and Brazilian systems. You leave with a personalized home maintenance plan to keep the result stable.",
    content_mn: {
      treatments: [
        "Шүдний өнгө, эмзэглэлийн оношилгоо",
        "Буйл болон уруулыг хамгаалах бэлтгэл",
        "Эмчилгээний идэвхгүйжүүлэгч гель түрхэх",
        "Идэвхжүүлэгч гэрэлээр цайруулах процесс",
        "Үр дүн харьцуулах, гэрийн зөвлөмж",
      ],
      benefits: [
        {
          title: "Хурдан үр дүн",
          body: "Нэг ирэлтийн дотор шүдийг 4–8 өнгөөр цайруулна. Тусгай үйл явдалаас өмнө шууд хийлгэх боломжтой.",
        },
        {
          title: "Аюулгүй технологи",
          body: "Эмч таны буйлыг хамгаалж, мэргэжлийн систем ашиглан хийдэг тул эмзэглэлийг хамгийн бага байлгана.",
        },
        {
          title: "Хувийн төлөвлөгөө",
          body: "Шүдний эмзэглэл, өнгө, амьдралын хэв маягт тохируулан Солонгос, Япон, Америк системээс сонгож хийнэ.",
        },
      ],
      faq: [
        {
          q: "Цайруулалт хэр удаан үргэлжлэх вэ?",
          a: "Зөв арчилгаатай бол үр дүн 12–24 сар хадгалагдана. Кофе, кола, тамхины хэрэглээ хугацааг богиносгоно.",
        },
        {
          q: "Шүд минь эмзэгшинэ үү?",
          a: "Зарим хүнд процедурын дараа 1–2 хоног эмзэглэл мэдэгдэж болох ч хор хөнөөлгүй, өөрөө намждаг.",
        },
        {
          q: "Жирэмсэн үед хийж болох уу?",
          a: "Үгүй. Жирэмсэн болон хөхүүл ээжүүдэд цайруулалтыг хойшлуулахыг зөвлөдөг.",
        },
        {
          q: "Ломбо тавиулсан шүдэнд тохирох уу?",
          a: "Ломбо, бүрээс цайрахгүй. Үзлэгийн үеэр эмч таны нөхцөлийг үнэлж, шаардлагатай бол ломбоо солихыг санал болгоно.",
        },
      ],
      timeline: [
        {
          title: "Үзлэг, оношилгоо",
          body: "Шүдний өнгө, эмзэглэл, ломбо, буйлын эрүүл байдлыг шалган таны зорилгод тохирох системийг сонгоно.",
        },
        {
          title: "Бэлтгэл",
          body: "Шүдний гадаргуу мэргэжлийн цэвэрлэгээ хийгээд, буйл, уруулыг хамгаалах хальсалт хийнэ.",
        },
        {
          title: "Цайруулалт",
          body: "Идэвхгүйжүүлэгч гель түрхэж, гэрлийн идэвхжүүлгээр 15–20 минутаар 2–3 удаа давтан хийнэ.",
        },
        {
          title: "Үр дүн, арчилгаа",
          body: "Шүдний өнгийг харьцуулж, тогтворжуулах гэрийн арчилгаа, хоолны зөвлөмжийг өгнө.",
        },
      ],
    },
    content_en: {
      treatments: [
        "Shade and sensitivity assessment",
        "Gum and lip isolation prep",
        "Application of professional whitening gel",
        "Light-activated whitening cycles",
        "Result comparison and home aftercare plan",
      ],
      benefits: [
        {
          title: "Fast results",
          body: "Lift your shade 4–8 levels in a single visit — perfect before a wedding, photo shoot or interview.",
        },
        {
          title: "Safe technology",
          body: "Performed by a dentist with isolation barriers and a professional system, so sensitivity is kept to a minimum.",
        },
        {
          title: "Personalized plan",
          body: "We pick between Korean, Japanese, American and Brazilian systems based on your sensitivity, shade and lifestyle.",
        },
      ],
      faq: [
        {
          q: "How long does the result last?",
          a: "With normal care, 12–24 months. Coffee, cola and smoking shorten that window.",
        },
        {
          q: "Will my teeth feel sensitive?",
          a: "Mild sensitivity for 1–2 days is common and harmless. We use desensitizing gels to minimize it.",
        },
        {
          q: "Can I whiten while pregnant?",
          a: "No — we always recommend postponing whitening until after pregnancy and breastfeeding.",
        },
        {
          q: "Will whitening affect my fillings?",
          a: "Fillings and crowns do not change shade. During the consult we'll flag whether any restoration needs replacing afterwards.",
        },
      ],
      timeline: [
        {
          title: "Consultation",
          body: "We check shade, sensitivity, existing fillings and gum health, then choose the right system for your goals.",
        },
        {
          title: "Preparation",
          body: "Professional polish removes surface stains; gums and lips are isolated with a protective barrier.",
        },
        {
          title: "Whitening cycles",
          body: "Whitening gel is applied and activated with light for 15–20 min, repeated 2–3 times.",
        },
        {
          title: "Result & aftercare",
          body: "We compare the new shade against the start and walk you through a maintenance routine.",
        },
      ],
    },
  },
  {
    slug: "diagnostic-xray-regional",
    icon_key: "routine",
    hero_image_url: "/x-ray.jpg",
    description_mn:
      "Нэг шүдний асуудлыг нарийн оношлоход зориулсан дижитал хэсгийн рентген зураг.",
    description_en:
      "Targeted digital X-ray of a single tooth — fast, low-dose, instantly reviewed.",
    long_description_mn:
      "Хэсгийн шүдний рентген зураг нь нэг шүд эсвэл хэдэн зэргэлдээ шүдийг нарийвчлан харах хамгийн хурдан арга. Цоорлын гүн, сувгийн хэлбэр, ёзоор болон ясны нөхцөлийг тодорхой хардаг.\n\nБидний дижитал систем нь уламжлалт хальсан рентгенээс 80% бага туяа цацрах ба зураг тэр даруй компьютерт гарч ирдэг. Үр дүнг эмчтэйгээ хамт үзэж, эмчилгээний төлөвлөгөөгөө шууд ярилцана.",
    long_description_en:
      "A regional dental X-ray is the fastest, most precise way to inspect a single tooth or a couple of neighbors. It clearly shows decay depth, canal anatomy, root tips and surrounding bone.\n\nOur digital sensor emits ~80% less radiation than legacy film X-rays, and the image appears on-screen instantly. You review it together with your dentist and the treatment plan starts the same visit.",
    content_mn: {
      treatments: [
        "Цоорлын гүнийг оношлох",
        "Шүдний сувгийн хэлбэрийг үзэх",
        "Ёзоорын үрэвсэл шалгах",
        "Ломбоны доорх давтан цоорлыг илрүүлэх",
        "Эмчилгээний өмнө/дараагийн харьцуулалт",
      ],
      benefits: [
        {
          title: "Бага туяа",
          body: "Дижитал сенсор нь уламжлалт хальснаас 80% бага туяа цацрах тул дахин дахин зураг авах нь аюулгүй.",
        },
        {
          title: "Шуурхай",
          body: "Зураг 2–3 секундын дотор компьютерт гарч ирэх ба үр дүнг ярилцаад дараагийн алхамдаа шуурхай шилжинэ.",
        },
        {
          title: "Нарийн оношилгоо",
          body: "Нүдээр харагдахгүй давхар цоорол, нүх, ёзоорын асуудлуудыг яг тодорхой илрүүлдэг.",
        },
      ],
      faq: [
        {
          q: "Жирэмсэн үед хийж болох уу?",
          a: "Хэрэгцээтэй бол хийнэ. Хэвлийг тугалган хальсаар хамгаалж, үр хөврөлд хүрэх туяа маш бага.",
        },
        {
          q: "Хүүхдэд аюулгүй юу?",
          a: "Тиймээ. Хүүхдэд тохируулсан тохиргоо, илүү бага туяагаар хийнэ.",
        },
        {
          q: "Үзэх юу бэлдэх вэ?",
          a: "Тусгай бэлтгэл хэрэггүй. Гэртээ авч ирсэн хуучин зураг байвал авч ирэхэд тус болно.",
        },
        {
          q: "Хэр олон удаа давтаж болох вэ?",
          a: "Шаардлагатай үед эмч таны тохиолдолд нийцүүлэн давтан хийнэ — дижитал төхөөрөмжийн туяа маш бага.",
        },
      ],
      timeline: [
        {
          title: "Зорилго тодорхойлох",
          body: "Эмч аль шүдийг хардахаа баталгаажуулж, тохирох өнцгийг сонгоно.",
        },
        {
          title: "Зураг авах",
          body: "Сенсорыг амандаа байрлуулж, 1–2 секунд барина. Хүзүү, цээжинд тугалган хамгаалалт хийнэ.",
        },
        {
          title: "Зургийг тайлбарлах",
          body: "Үр дүн дэлгэц дээр шууд гарна. Эмч таны эмчилгээний төлөвлөгөөгөө дэлгэрэнгүй тайлбарлана.",
        },
      ],
    },
    content_en: {
      treatments: [
        "Diagnose cavity depth",
        "Inspect root canal anatomy",
        "Detect periapical inflammation",
        "Find recurrent decay under existing fillings",
        "Compare before/after a procedure",
      ],
      benefits: [
        {
          title: "Low radiation",
          body: "Digital sensors emit ~80% less radiation than legacy film X-rays, so repeat imaging is safe.",
        },
        {
          title: "Instant",
          body: "Images appear on-screen in 2–3 seconds — your dentist reviews and explains them right away.",
        },
        {
          title: "Precise diagnosis",
          body: "Reveals hidden cavities, fractures and root issues that visual exam alone can miss.",
        },
      ],
      faq: [
        {
          q: "Is it safe during pregnancy?",
          a: "When clinically necessary, yes — we use a lead apron over the abdomen and the fetal exposure is negligible.",
        },
        {
          q: "Is it safe for children?",
          a: "Yes. Children get a child-specific lower-dose setting.",
        },
        {
          q: "Do I need to prepare?",
          a: "No preparation required. If you have older X-rays from another clinic, bring them along.",
        },
        {
          q: "How often can I have one?",
          a: "As often as clinically needed — digital dose is very low, so we image whenever the diagnosis demands it.",
        },
      ],
      timeline: [
        {
          title: "Define the target",
          body: "Dentist confirms which tooth/area to capture and selects the correct angle.",
        },
        {
          title: "Capture",
          body: "Sensor is positioned in the mouth and exposed for 1–2 seconds; a lead apron protects the body.",
        },
        {
          title: "Read the result",
          body: "Image appears on-screen; the dentist walks you through findings and next steps.",
        },
      ],
    },
  },
  {
    slug: "prosthetic-space-maintenance",
    icon_key: "crown",
    hero_image_url: "/hamtolon.jpg",
    description_mn:
      "Алдсан шүдний зайг хадгалж, хөрш шүдийг хазайхаас сэргийлэх найдвартай арга.",
    description_en:
      "Hold the gap from a missing tooth so neighbors do not drift and the bite stays balanced.",
    long_description_mn:
      "Нэг шүд алдсаны дараа хөрш шүднүүд аажмаар хазайж, эсрэг талын шүд урт ургаж, хазалт өөрчлөгдөж эхэлдэг. Зай нөхөх эмчилгээ нь энэ зайг хадгалан, ирээдүйн имплант эсвэл шүдэлбэрт зориулсан зөв байрлалыг бүрдүүлдэг.\n\nХэрэглэгдэх материал нь шүдний даралтанд тэсвэртэй металл эсвэл хатуу хуванцар. Хагас цагийн дотор хийгддэг бөгөөд өвдөлтгүй, эмзэглэлгүй процесс.",
    long_description_en:
      "When a tooth is lost, neighbors tilt into the gap and the opposing tooth over-erupts, which throws the bite out of balance. A space maintainer locks the gap and preserves the ideal position for a future implant or bridge.\n\nMade from durable metal or hard resin, the device is fitted in about 30 minutes and is comfortable enough to forget you're wearing it.",
    content_mn: {
      treatments: [
        "Зайн хэмжээ, эргэн тойрны шүдийг үнэлэх",
        "Хувийн зай нөхөгч хийх хэмжээ авах",
        "Зай нөхөгчийг суулгаж тохируулах",
        "Хазалтын тэнцвэрийг шалгах",
        "Тогтмол хяналт",
      ],
      benefits: [
        {
          title: "Хазалтаа хамгаална",
          body: "Хөрш шүдний хазайлт, дээд талын шүдний урт ургалтаас сэргийлж бүх амны хөндийг тогтвортой барина.",
        },
        {
          title: "Ирээдүйн эмчилгээний бэлтгэл",
          body: "Имплант, шүдэлбэр хийх үед зөв зай, ясны бүтэц хадгалагдсан байх нь үр дүнг хэдэн дахин нэмэгдүүлдэг.",
        },
        {
          title: "Хүүхдэд ч тохиромжтой",
          body: "Сүүн шүд эрт авагдсан хүүхдэд байнгын шүдний зөв ургалтанд маш чухал.",
        },
      ],
      faq: [
        {
          q: "Хичнээн удаан зүүж хэрэглэх вэ?",
          a: "Имплант эсвэл шүдэлбэр хийлгэх хүртэл — ердийн тохиолдолд 3 сараас 1 жил хүртэл.",
        },
        {
          q: "Хоол идэхэд саад болох уу?",
          a: "Ердийн хоолонд саад болохгүй. Эхний 1–2 хоног зөөлөн хоолоор амарч, аажмаар хэвийн дэглэмд орно.",
        },
        {
          q: "Авч цэвэрлэх боломжтой юу?",
          a: "Авагддаг хэлбэр нь шүд угаах болгонд авч цэвэрлэдэг. Авагддаггүй хэлбэр нь тогтмол шүдэнд бэхлэгдэнэ.",
        },
        {
          q: "Эмзэглэх үү?",
          a: "Эхний хоног буйлд бага зэрэг даралт мэдэгдэх боломжтой ч өөрөө намжина.",
        },
      ],
      timeline: [
        {
          title: "Үзлэг ба зураг авалт",
          body: "Эмч зайн хэмжээ, хөрш шүдний нөхцөлийг үнэлж, шаардлагатай бол рентген зураг авна.",
        },
        {
          title: "Хэмжээ авах",
          body: "Зөөлөн материалаар амны хөндийн хуулбар хийн, лабораторид зай нөхөгчөө захиалуулна.",
        },
        {
          title: "Суулгах",
          body: "Дараагийн ирэлтэд зай нөхөгчийг суулгаж, хазалтанд тохируулна.",
        },
        {
          title: "Хяналт",
          body: "3–6 сар тутамд эмчид үзүүлж, дараагийн эмчилгээний шилжилтийг төлөвлөнө.",
        },
      ],
    },
    content_en: {
      treatments: [
        "Assess gap and neighboring teeth",
        "Take an impression for a custom maintainer",
        "Fit and adjust the device",
        "Check bite balance",
        "Schedule follow-ups",
      ],
      benefits: [
        {
          title: "Protects the bite",
          body: "Stops neighbors from tilting and the opposing tooth from over-erupting, keeping the bite stable.",
        },
        {
          title: "Better future restorations",
          body: "When you go on to an implant or bridge, a preserved space and bone structure dramatically improve the result.",
        },
        {
          title: "Great for kids",
          body: "Essential after early loss of a baby tooth — keeps room for the permanent tooth to come in properly.",
        },
      ],
      faq: [
        {
          q: "How long do I wear it?",
          a: "Until your implant or bridge is placed — usually anywhere from 3 months to a year.",
        },
        {
          q: "Can I eat normally?",
          a: "Yes. Soft foods for 1–2 days while you adapt, then a normal diet.",
        },
        {
          q: "Can I remove it for cleaning?",
          a: "Removable types come out for brushing. Fixed types are bonded to a neighboring tooth and stay put.",
        },
        {
          q: "Will it feel sore?",
          a: "Slight pressure for the first day is normal and goes away on its own.",
        },
      ],
      timeline: [
        {
          title: "Exam & imaging",
          body: "We measure the gap, check the neighbors and take an X-ray if needed.",
        },
        {
          title: "Impression",
          body: "A soft impression captures the shape; the lab fabricates your custom maintainer.",
        },
        {
          title: "Fitting",
          body: "At the next visit we place the device and fine-tune your bite.",
        },
        {
          title: "Follow-up",
          body: "Every 3–6 months we re-check and plan the transition to the final restoration.",
        },
      ],
    },
  },
  {
    slug: "ortho-diagnosis",
    icon_key: "braces",
    hero_image_url: "/shaazan.jpg",
    description_mn:
      "Хазалт, нүүрний хөгжил, шүдний зайг бүрэн оношлох — гажиг засал эхлэх анхны алхам.",
    description_en:
      "A complete orthodontic workup — the foundation for every successful braces or aligner treatment.",
    long_description_mn:
      "Гажиг заслын оношилгоо нь зөвхөн шүд харахаас илүү — нүүрний бүтэц, эрүү тагнайн харьцаа, амьсгал, залгилт, ярианы хэв шинжийг бүхэлд нь үнэлдэг. Эмч таны амьдралын хэв маяг, гоо сайхны хүлээлтийг тал тал бүрээс нь сонсон, тохирох эмчилгээний хувилбаруудыг танилцуулдаг.\n\nОношилгооны үр дүнд аппарат, элайнэр, мэс заслын засал зэрэг сонголтуудыг үнэ, хугацаа, ашиг тус талаас нь харьцуулан гаргадаг. Энэ нь хүүхэд, өсвөр насныхан, насанд хүрэгчдэд адил үр дүнтэй.",
    long_description_en:
      "Orthodontic diagnosis goes far beyond looking at teeth — we assess facial structure, jaw-to-jaw relationships, airway, swallowing patterns and speech. Your goals, lifestyle and aesthetic expectations shape which treatment paths we present.\n\nThe outcome is a clear plan: braces, aligners or surgical assist — each compared by cost, duration and outcome. Equally relevant for children, teens and adults.",
    content_mn: {
      treatments: [
        "Нүүр, эрүүний эмнэлзүйн үзлэг",
        "Шүдний 360° зураглал",
        "Хазалтын талстан хуулбар",
        "Цефалометр зураг (хажуугийн рентген)",
        "Эмчилгээний хувилбар, үнийн тооцоо",
      ],
      benefits: [
        {
          title: "Нэг ирэлтэд бүх хариулт",
          body: "Хичнээн хугацаа, ямар сонголт, ямар үнэ — бүгдийг нэг суулт дотор тодруулна.",
        },
        {
          title: "Хувийн төлөвлөгөө",
          body: "Шүдний хазалт, амьсгал, ярианы онцлогт тулгуурлан зөвхөн танд тохирох эмчилгээг санал болгоно.",
        },
        {
          title: "Хүүхэд, насанд хүрэгчид",
          body: "7 наснаас 60+ нас хүртэлх хэн ч оношилгоо хийлгэх боломжтой — насны хязгаар байхгүй.",
        },
      ],
      faq: [
        {
          q: "Хичнээн хугацаа орох вэ?",
          a: "Үзлэг + зураглал бүхэлдээ 45–60 минут. Дараагийн ирэлтэд эмчилгээний төлөвлөгөөг танилцуулна.",
        },
        {
          q: "Шууд аппарат тавьж болох уу?",
          a: "Үгүй. Эхлээд оношилгоо бүрэн хийгдэх ёстой — тийм байж эмчилгээ урт хугацаандаа аюулгүй явагдана.",
        },
        {
          q: "Хүүхдээ хэдэн настай байхад хамгийн түрүүнд авч ирэх вэ?",
          a: "7 нас. Энэ үед эрүүний өсөлтийг ажиглаж, эрт оролцоо хэрэгтэй эсэхийг шийдэх боломжтой.",
        },
        {
          q: "Үнэ багтаан гаргадаг уу?",
          a: "Тиймээ — оношилгооны дараа эмчилгээний нийт зардал, хагас цагаар төлөх төлөвлөгөөг танилцуулдаг.",
        },
      ],
      timeline: [
        {
          title: "Эмнэлзүйн үзлэг",
          body: "Шүд, эрүү, нүүрний бүтэц, амьсгал, ярианы хэв шинжийг бүхэлд нь үнэлнэ.",
        },
        {
          title: "Дижитал зураглал",
          body: "Бүх амны панорам, цефалометр, амны хөндийн дижитал хуулбар авна.",
        },
        {
          title: "Төлөвлөгөө боловсруулах",
          body: "Зургуудыг анализ хийж, тохирох сонголтуудыг үр дүн, хугацаа, үнээр харьцуулсан төлөвлөгөө гаргана.",
        },
        {
          title: "Танилцуулга",
          body: "Эмч төлөвлөгөөг танд тайлбарлаж, асуултуудад хариулна. Тохиромжтой бол эмчилгээгээ эхэлнэ.",
        },
      ],
    },
    content_en: {
      treatments: [
        "Clinical facial and jaw exam",
        "360° dental imaging",
        "Bite impressions",
        "Cephalometric (lateral) X-ray",
        "Treatment options with cost estimate",
      ],
      benefits: [
        {
          title: "Every answer in one visit",
          body: "How long, which option, how much — all clarified in a single appointment.",
        },
        {
          title: "Personalized plan",
          body: "Built around your bite, airway and speech profile — not a template plan.",
        },
        {
          title: "All ages welcome",
          body: "From age 7 to 60+, there is no upper age limit on a productive orthodontic plan.",
        },
      ],
      faq: [
        {
          q: "How long does it take?",
          a: "The exam and imaging take 45–60 minutes total. The treatment plan is presented at a follow-up visit.",
        },
        {
          q: "Can you start braces same day?",
          a: "No — a complete diagnosis comes first, so the long-term treatment stays safe and predictable.",
        },
        {
          q: "When should I first bring my child?",
          a: "Age 7 is ideal — we can monitor jaw growth and decide whether early intervention is needed.",
        },
        {
          q: "Do you offer payment plans?",
          a: "Yes. After diagnosis we present total cost and a flexible payment schedule.",
        },
      ],
      timeline: [
        {
          title: "Clinical exam",
          body: "Comprehensive review of teeth, jaws, facial structure, airway and speech patterns.",
        },
        {
          title: "Digital imaging",
          body: "Full-mouth panoramic and lateral X-rays plus a digital impression of your bite.",
        },
        {
          title: "Plan building",
          body: "We analyze the data and prepare options compared by outcome, duration and cost.",
        },
        {
          title: "Plan presentation",
          body: "Your dentist walks you through the plan, answers questions and — if you're ready — begins treatment.",
        },
      ],
    },
  },
  {
    slug: "fixed-zirconia",
    icon_key: "crown",
    hero_image_url: "/Dentari.jpg",
    description_mn:
      "Циркон бүрээс — байгалийн шүдний өнгө, бат бөх металлгүй сонголт.",
    description_en:
      "Zirconia crown — natural-looking, metal-free, exceptionally strong.",
    long_description_mn:
      "Циркон бүрээс нь өндөр чанарын керамик материалаар хийгдсэн, металлгүй учраас гэрэлд байгалийн шүд шиг тунгалаг харагддаг. Хатуу эдийн бат бөх чанар нь араа шүдний даралтанд тэсвэртэй, урт хугацаанд хадгалагдана.\n\nХэрэглэгдэх тохиолдол: сувгийн эмчилгээ хийгдсэн шүд, том ломбоны дараа сулрсан шүд, гоо сайхны зорилгоор өнгөтэй болсон шүдийг засах. Дижитал хэвлэлээр хийгддэг тул нарийн нийцэмж, тав тухтай хэрэглээг өгдөг.",
    long_description_en:
      "A zirconia crown is a fully ceramic, metal-free restoration that mimics natural enamel translucency. Its strength stands up to chewing forces, so it lasts for years in molar positions too.\n\nIdeal after root canal treatment, on heavily filled teeth, or for cosmetic restoration of discolored teeth. Crafted from a digital scan for a precise, comfortable fit.",
    content_mn: {
      treatments: [
        "Дижитал хэмжээ авах",
        "Шүдний бэлтгэл",
        "Түр бүрээс суулгах",
        "Циркон бүрээсийг суулгаж тогтоох",
        "Хазалтын эцсийн тохируулга",
      ],
      benefits: [
        {
          title: "Байгалийн харагдац",
          body: "Циркон нь гэрэлд байгалийн шүдтэй адил тунгалаг харагддаг тул урд шүдэнд ч төгс тохирно.",
        },
        {
          title: "Металлгүй",
          body: "Буйлны хүрээнд хар зураас гарахгүй, харшилгүй, биологийн зохицол өндөртэй.",
        },
        {
          title: "Урт настай",
          body: "Зөв арчилгаатай бол 10–15 жил, зарим тохиолдолд илүү удаан үйлчилнэ.",
        },
      ],
      faq: [
        {
          q: "Хэдэн ирэлтэнд хийгдэх вэ?",
          a: "Ердийн тохиолдолд 2 ирэлт: эхнийх дижитал хэмжээ + түр бүрээс, хоёр дахь нь бэлэн бүрээс суулгах.",
        },
        {
          q: "Өвдөх үү?",
          a: "Үгүй. Эмчилгээ мэдээ алдуулалтан дор хийгдэх ба процедурын дараа эмзэглэл ховор.",
        },
        {
          q: "Метал бүрээснээс юугаараа давуу вэ?",
          a: "Метал бүрээс нь буйлны хүрээнд хар зураас үлдээдэг бөгөөд гэрэл нэвтрүүлдэггүй. Циркон нь хоёуланг нь шийднэ.",
        },
        {
          q: "Цайруулалт хийсний дараа хийж болох уу?",
          a: "Тиймээ — цайруулсны дараа өнгө нь тогтворжсон үед бүрээсний өнгийг нарийн тохируулна.",
        },
      ],
      timeline: [
        {
          title: "Үзлэг, төлөвлөлт",
          body: "Шүдний нөхцөл, хазалт, өнгө сонголтоо тодорхойлж, дижитал хэвлэлээр хэмжээ авна.",
        },
        {
          title: "Шүдний бэлтгэл",
          body: "Шүдний гадаргуу 1.5–2 мм нимгэлж, түр бүрээсийг суулгана.",
        },
        {
          title: "Лабораторийн ажил",
          body: "Циркон блокыг дижитал хэвлэлийн дагуу нарийвчлан боловсруулна.",
        },
        {
          title: "Эцсийн суулгац",
          body: "Дараагийн ирэлтэд бүрээсийг суулгаж, өнгө, хазалтыг шалган тогтооно.",
        },
      ],
    },
    content_en: {
      treatments: [
        "Digital impression",
        "Tooth preparation",
        "Temporary crown placement",
        "Final zirconia crown bonding",
        "Final bite adjustment",
      ],
      benefits: [
        {
          title: "Natural look",
          body: "Translucent zirconia mimics enamel — works beautifully even on front teeth.",
        },
        {
          title: "Metal-free",
          body: "No dark gum line, hypoallergenic and highly biocompatible.",
        },
        {
          title: "Long-lasting",
          body: "10–15 years of service with normal care; often longer with diligent hygiene.",
        },
      ],
      faq: [
        {
          q: "How many visits?",
          a: "Usually two: a digital impression and temporary crown first, then bonding of the final crown.",
        },
        {
          q: "Does it hurt?",
          a: "No — the prep is done under local anesthesia and post-treatment sensitivity is uncommon.",
        },
        {
          q: "How is it better than a metal crown?",
          a: "Metal crowns can leave a dark gum line and block light. Zirconia avoids both.",
        },
        {
          q: "Can I do this after whitening?",
          a: "Yes — wait until your whitened shade stabilizes, then we match the crown to it precisely.",
        },
      ],
      timeline: [
        {
          title: "Exam & planning",
          body: "Assess the tooth, bite and shade. Take a digital impression.",
        },
        {
          title: "Tooth preparation",
          body: "We shape the tooth (1.5–2 mm reduction) and fit a temporary crown.",
        },
        {
          title: "Lab fabrication",
          body: "A zirconia block is milled from the digital file to a precise fit.",
        },
        {
          title: "Final placement",
          body: "The crown is bonded; we verify shade and bite before final cement.",
        },
      ],
    },
  },
  {
    slug: "removable-acrylic",
    icon_key: "crown",
    hero_image_url: "/sapir.jpg",
    description_mn:
      "Акрилын хуванцар авагддаг шүдэлбэр — олон шүд алдсан тохиолдолд хямд, найдвартай сонголт.",
    description_en:
      "Acrylic removable denture — an affordable, dependable choice when multiple teeth are missing.",
    long_description_mn:
      "Акрилын хуванцар шүдэлбэр нь олон шүд алдсаны дараа зажилгаа, инээмсэглэлийг сэргээх хамгийн өргөн хэрэглэгддэг сонголт. Хөнгөн, тав тухтай, олон тооны шүд орлуулах боломжтой бөгөөд үнэ нь имплантаас хэдэн дахин хямд.\n\nЭмчилгээ ердөө 2–3 ирэлтэнд хийгддэг: хэмжээ авах, тохируулах, эцсийн суулгац. Шүдний тоонд хамаараад үнэ хэлбэлздэг ба авагддаг учраас цэвэрлэх, арчлах нь хялбар.",
    long_description_en:
      "An acrylic removable denture is the most widely used option for restoring chewing and smile after multiple teeth are lost. Light, comfortable, scalable from a few teeth to a full arch — and a fraction of the cost of implants.\n\nFinished in 2–3 visits: impression, try-in, final fit. Pricing scales with the number of teeth replaced. Removable design makes cleaning and care straightforward.",
    content_mn: {
      treatments: [
        "Үлдсэн шүднүүдийн үнэлгээ",
        "Хувийн хуулбар авах",
        "Хазалт болон өнгө сонголт",
        "Туршилтын тааруулга",
        "Эцсийн суулгац ба тохируулга",
      ],
      benefits: [
        {
          title: "Хямд үнэ",
          body: "Имплантын 1/5 хүртэлх үнээр олон шүдийг нэг дор сэргээх боломжтой.",
        },
        {
          title: "Уян хатан төлөвлөлт",
          body: "1 шүднээс 28 шүд хүртэл — таны тохиолдолд яг тохирох хэмжээгээр захиалгаар хийнэ.",
        },
        {
          title: "Арчилгаа хялбар",
          body: "Авагддаг учраас өдөр бүр угааж, цэвэрлэх боломжтой.",
        },
      ],
      faq: [
        {
          q: "Эхний өдрүүдэд эвгүй мэдрэгдэх үү?",
          a: "Эхний 1–2 долоо хоногт ярих, хооллоход бага зэрэг тааруулга шаардлагатай. Дараа нь хэвийн болно.",
        },
        {
          q: "Хичнээн удаан үйлчилэх вэ?",
          a: "Зөв арчилгаатай бол 5–7 жил үйлчилнэ. Эрүүний хэлбэр өөрчлөгдвөл тааруулга шаардаж болзошгүй.",
        },
        {
          q: "Шөнө унтахдаа авах ёстой юу?",
          a: "Тиймээ — амны хөндийн арьс амарч, дугуй цэвэрлэгээ хийгдэх боломж олдоно.",
        },
        {
          q: "Метал суурьтайгаас юугаараа ялгаатай вэ?",
          a: "Метал суурьтай нь илүү нимгэн, бат, амтлах мэдрэмжийг хадгалдаг. Акрилын нь хямд бөгөөд тааруулахад илүү уян.",
        },
      ],
      pricing: [
        { label: "1 шүд (Акрилын)", price: "90,000₮", note: "Цутгамал металл суурьтай бол +5,000₮" },
        { label: "5 шүд", price: "110,000₮" },
        { label: "10 шүд", price: "135,000₮" },
        { label: "14 шүд (нэг тал)", price: "155,000₮" },
        { label: "28 шүд (бүрэн ам)", price: "270,000₮" },
      ],
      timeline: [
        {
          title: "Үзлэг ба хэмжээ",
          body: "Үлдсэн шүднүүдийг шалган, нарийн хэмжээ авч лабораторид илгээнэ.",
        },
        {
          title: "Туршилт",
          body: "Лавсан хэвэн дээр тавьсан туршилтын шүдийг туршиж, өнгө, хэлбэр, хазалтыг тохируулна.",
        },
        {
          title: "Эцсийн суулгац",
          body: "Эцсийн шүдэлбэрийг суулгаж, тав тухтай хэрэглээ хийгдэх хүртэл тааруулна.",
        },
        {
          title: "Хяналт",
          body: "Эхний 2 долоо хоногт нэг удаа, дараа нь 6 сар тутамд эмчид үзүүлж тааруулна.",
        },
      ],
    },
    content_en: {
      treatments: [
        "Assess remaining teeth and bite",
        "Take a custom impression",
        "Choose tooth shade and shape",
        "Try-in adjustment",
        "Final fit and bite refinement",
      ],
      benefits: [
        {
          title: "Affordable",
          body: "Replaces multiple teeth at a fraction of the cost of implants.",
        },
        {
          title: "Scalable",
          body: "From a single tooth to a full 28-tooth arch — custom built to your case.",
        },
        {
          title: "Easy to maintain",
          body: "Removable, so you can clean it thoroughly every day.",
        },
      ],
      faq: [
        {
          q: "Will it feel strange at first?",
          a: "Mild adjustment to speech and chewing in the first 1–2 weeks is normal. It becomes natural quickly.",
        },
        {
          q: "How long does it last?",
          a: "5–7 years with normal care. If your jaw shape changes, a reline may be needed.",
        },
        {
          q: "Should I take it out at night?",
          a: "Yes — letting the tissues rest and giving the device a thorough clean is recommended.",
        },
        {
          q: "How is this different from a cast-metal base?",
          a: "Cast-metal bases are thinner and stronger, preserving taste better. Acrylic is more affordable and easier to adjust.",
        },
      ],
      pricing: [
        { label: "1 tooth (acrylic)", price: "₮90,000", note: "+₮5,000 for cast-metal base" },
        { label: "5 teeth", price: "₮110,000" },
        { label: "10 teeth", price: "₮135,000" },
        { label: "14 teeth (one arch)", price: "₮155,000" },
        { label: "28 teeth (full mouth)", price: "₮270,000" },
      ],
      timeline: [
        {
          title: "Exam & impression",
          body: "Evaluate remaining teeth, take a precise impression and send it to the lab.",
        },
        {
          title: "Try-in",
          body: "Test the wax try-in for shade, shape and bite before final fabrication.",
        },
        {
          title: "Final fit",
          body: "Insert the finished denture and refine until it's comfortable.",
        },
        {
          title: "Follow-up",
          body: "First check at 2 weeks; then every 6 months for adjustments.",
        },
      ],
    },
  },
  {
    slug: "implant-korean",
    icon_key: "implant",
    hero_image_url: "/metall.jpg",
    description_mn:
      "Чанарын баталгаатай Солонгосын титан имплант — алдсан шүдийг олон арван жилийн турш сэргээх найдвартай сонголт.",
    description_en:
      "Quality-guaranteed Korean titanium implant — a long-term, natural-feeling replacement for a missing tooth.",
    long_description_mn:
      "Солонгос имплант нь үнэ-чанарын харьцаагаараа дэлхий даяар хүлээн зөвшөөрөгдсөн нэгдүгээр зэрэглэлийн сонголт. Цэвэр титан суулгац нь ясанд бэхлэгдэн, дээр нь шаазан эсвэл циркон бүрээс тавин байгалийн шүд шиг харагдах, ажиллах боломжийг олгоно.\n\nЭмчилгээ нь хагалгааны үе шат (1 ирэлт), ясанд нэвтрэх хугацаа (3–6 сар), эцсийн бүрээс суулгац (1–2 ирэлт) гэсэн үе шаттай. Бид CBCT дижитал зураглалаар хагалгаа төлөвлөн, эрсдэлийг хамгийн бага байлгаж байна.",
    long_description_en:
      "Korean implant systems are a globally recognized first-choice option for price-to-quality ratio. A pure titanium post integrates with bone; on top sits a ceramic or zirconia crown that looks and works like a natural tooth.\n\nTreatment unfolds in stages: surgical placement (one visit), osseointegration (3–6 months) and final crown placement (1–2 visits). We plan every implant with CBCT 3D imaging to minimize risk.",
    content_mn: {
      treatments: [
        "CBCT 3D зураглал",
        "Имплантын суулгацын мэс ажилбар",
        "Ясанд нэвтрэх хугацаа (3–6 сар)",
        "Хийсний дараах сэргээх эмчилгээ",
        "Эцсийн бүрээс суулгац",
      ],
      benefits: [
        {
          title: "Олон арван жилийн шийдэл",
          body: "Зөв арчилгаатай бол 20+ жил үйлчилэх ба ясыг хадгалж, нүүрний хэлбэрийг тогтворжуулна.",
        },
        {
          title: "Хөрш шүдэнд хохирол өгөхгүй",
          body: "Уламжлалт гүүртэй харьцуулахад зэргэлдээ эрүүл шүдийг хөндөхгүй.",
        },
        {
          title: "Байгалийн ажиллагаа",
          body: "Зажилгаа, ярих, инээмсэглэх — бүгд жинхэнэ шүдтэй адил тав тухтай.",
        },
      ],
      faq: [
        {
          q: "Мэс ажилбар өвдөх үү?",
          a: "Үгүй. Орон нутгийн мэдээ алдуулалтан дор хийгдэх ба ихэнх өвчтөн дараа нь зөвхөн бага зэрэг даралт мэдэрсэн гэдэг.",
        },
        {
          q: "Хэдэн хугацааны дотор шүдтэй болох вэ?",
          a: "Эхний имплант суулгацнаас эцсийн бүрээс хүртэл 3–6 сар. Зарим тохиолдолд тэр өдөртөө түр бүрээс суулгана.",
        },
        {
          q: "Хэдэн настай хүний шүдэнд тохирох вэ?",
          a: "Эрүүний ястай хүн насанд хүрэгчийн насанд имплант хийх боломжтой — хязгаар байхгүй.",
        },
        {
          q: "Япон импланттай харьцуулахад юу нь өөр вэ?",
          a: "Япон системүүд илүү премиум үнэ, илүү нарийн титан гадаргуутай. Солонгос систем нь үр дүн адил, харин үнэ хямд.",
        },
      ],
      timeline: [
        {
          title: "Оношилгоо",
          body: "CBCT 3D зураглалаар яс, мэдрэл, тагнайн нөхцөлийг үнэлж, төлөвлөгөөг боловсруулна.",
        },
        {
          title: "Хагалгаа",
          body: "1 цагийн дотор титан суулгацыг ясанд бэхлэн, эдгэрэх хальсаар хаана.",
        },
        {
          title: "Ясанд нэвтрэх",
          body: "3–6 сарын дотор титан гадаргуу ясанд бэхлэгдэн, эцсийн бүрээс барих суурийг үүсгэнэ.",
        },
        {
          title: "Эцсийн бүрээс",
          body: "Циркон эсвэл шаазан бүрээсээ дижитал хэвлэлээр захиалуулан суулгана.",
        },
      ],
    },
    content_en: {
      treatments: [
        "CBCT 3D imaging",
        "Surgical implant placement",
        "Osseointegration (3–6 months)",
        "Soft-tissue healing care",
        "Final crown placement",
      ],
      benefits: [
        {
          title: "Decades-long solution",
          body: "With normal care, implants serve 20+ years and preserve bone and facial structure.",
        },
        {
          title: "Doesn't harm neighbors",
          body: "Unlike a traditional bridge, neighboring healthy teeth stay untouched.",
        },
        {
          title: "Natural function",
          body: "Chewing, speaking and smiling feel just like a natural tooth.",
        },
      ],
      faq: [
        {
          q: "Is the surgery painful?",
          a: "No. It's done under local anesthesia and most patients report only mild pressure afterwards.",
        },
        {
          q: "How long before I have a new tooth?",
          a: "From first placement to final crown: 3–6 months. In some cases we fit a temporary crown the same day.",
        },
        {
          q: "Is there an age limit?",
          a: "Once the jawbone is fully developed (adult age), there is no upper limit.",
        },
        {
          q: "How does the Japanese option compare?",
          a: "Japanese systems are premium priced with refined titanium surfaces. Korean offers comparable results at a lower price.",
        },
      ],
      timeline: [
        {
          title: "Diagnosis",
          body: "CBCT 3D scan evaluates bone, nerves and sinus to build a precise plan.",
        },
        {
          title: "Surgery",
          body: "Within an hour, the titanium post is placed and covered for healing.",
        },
        {
          title: "Osseointegration",
          body: "Over 3–6 months the bone fuses to the titanium, creating a stable foundation.",
        },
        {
          title: "Final crown",
          body: "A custom zirconia or ceramic crown is milled from a digital scan and placed.",
        },
      ],
    },
  },
  {
    slug: "surgery-milk-extraction",
    icon_key: "surgery",
    hero_image_url: "/friendly-young-dentist-examining-happy-child-teeth-dental-clinic-dentistry-concept 1.jpg",
    description_mn:
      "Сүүн шүд авах — хүүхдэд эелдэг, аюулгүй, өвдөлтгүй процесс.",
    description_en:
      "Milk tooth extraction — gentle, safe and pain-free for kids.",
    long_description_mn:
      "Сүүн шүд цаг хугацаандаа өөрөө унадаг ч заримдаа цоорсон, гэмтсэн, эсвэл байнгын шүдний ургалтанд саад болсон тохиолдолд авах шаардлагатай болдог. Манай эмч нар хүүхдэд тав тухтай, эелдэг арга барил ашиглан өвдөлтгүй процедур хийнэ.\n\nЭх эцэг хүүхдийн хажууд байх боломжтой ба бид сонирхолтой үлгэр, хүүхдэд ээлтэй тайлбараар хайнгад зуурах боломжийг олгоно.",
    long_description_en:
      "Milk teeth normally shed on their own, but extraction is needed when they're decayed, injured or blocking a permanent tooth coming in. Our team uses kid-friendly technique and storytelling to keep the visit calm and painless.\n\nParents can stay beside their child throughout, and we adapt every step to the child's comfort level.",
    content_mn: {
      treatments: [
        "Хүүхдийн дасан зохицох үе",
        "Орон нутгийн мэдээ алдуулалт",
        "Шүдийг эелдэг авах",
        "Цусыг зогсоох заавар",
        "Шинэ шүдний ургалтын төлөвлөгөө",
      ],
      benefits: [
        {
          title: "Өвдөлтгүй процедур",
          body: "Мэдээ алдуулагч гель + орон нутгийн анестези нь хүүхдийг өвдөлт мэдрэхгүй байлгана.",
        },
        {
          title: "Хүүхдэд ээлтэй орчин",
          body: "Хүүхдэд ойлгомжтой үлгэр, тоглоом, эмчилгээний хооронд завсарлагатай.",
        },
        {
          title: "Эх эцэг дэргэд",
          body: "Эцэг эх хүүхдийнхээ хажууд сууж тайвшруулах боломжтой.",
        },
      ],
      faq: [
        {
          q: "Мэдээ алдуулалт хийх ёстой юу?",
          a: "Шүд гүн биш бол ердөө гель хангалттай байж болно. Илүү бат бэх барьцалдсан үед бяцхан тарилгаар хийнэ.",
        },
        {
          q: "Хүүхэд айна гэж санаа зовж байна — яах вэ?",
          a: "Эхний ирэлтэд хүүхдээ танилцах, эмчилгээгүй зочлох боломжтой. Айдсыг бууруулахад энэ нь маш үр дүнтэй.",
        },
        {
          q: "Шүд авсаны дараа юу болж байгааг хэлж өгөх үү?",
          a: "Тиймээ — хүүхэд таны өөрийн хэлээр ойлгох арга барилаар тайлбарлана.",
        },
        {
          q: "Хэдэн цагийн дараа хооллож болох вэ?",
          a: "Эмчилгээний дараа 1 цагаас зөөлөн, бүлээн хоол. Хатуу, халуун, шүүст зүйлээс эхний 24 цагт зайлсхийнэ.",
        },
      ],
      timeline: [
        {
          title: "Дасан зохицуулга",
          body: "Хүүхдээ танилцуулж, тоног төхөөрөмжтэй найзлуулах. Хариуцлагатай тогтоо.",
        },
        {
          title: "Мэдээ алдуулалт",
          body: "Эхлээд гель түрхэн дараа нь бяцхан тарилга. Хүүхэд бараг юу ч мэдрэхгүй.",
        },
        {
          title: "Шүд авах",
          body: "Эмч эелдэг, хурдан хийнэ — ердөө 1–2 минут.",
        },
        {
          title: "Дараах зөвлөгөө",
          body: "Цусыг зогсоох арга, юу идэхээс зайлсхийх, шинэ шүдний ургалтыг ажиглах.",
        },
      ],
    },
    content_en: {
      treatments: [
        "Kid-friendly familiarization",
        "Local anesthesia",
        "Gentle extraction",
        "Bleeding control instructions",
        "Permanent tooth eruption plan",
      ],
      benefits: [
        {
          title: "Pain-free",
          body: "Numbing gel plus local anesthesia means your child won't feel pain.",
        },
        {
          title: "Kid-friendly environment",
          body: "Story-based explanations, toys and breaks between steps.",
        },
        {
          title: "Parent beside them",
          body: "You stay next to your child the whole time.",
        },
      ],
      faq: [
        {
          q: "Is anesthesia always needed?",
          a: "For shallow teeth, numbing gel may be enough. For deeper roots a tiny injection is used.",
        },
        {
          q: "My child is scared — what can we do?",
          a: "Schedule a get-to-know visit first, no treatment, just exploration. It dramatically reduces fear.",
        },
        {
          q: "Will you explain it to my child?",
          a: "Yes — in language they understand, step by step.",
        },
        {
          q: "When can they eat afterwards?",
          a: "Soft, lukewarm food after 1 hour. Avoid crunchy/hot/sucking for the first 24 hours.",
        },
      ],
      timeline: [
        {
          title: "Familiarization",
          body: "Meet the dentist, see the tools, settle in.",
        },
        {
          title: "Numbing",
          body: "Topical gel first, then a tiny injection. The child barely notices.",
        },
        {
          title: "Extraction",
          body: "The tooth comes out gently in 1–2 minutes.",
        },
        {
          title: "Aftercare",
          body: "Bleeding control, food guidance, monitoring the permanent tooth eruption.",
        },
      ],
    },
  },
  {
    slug: "preventive-remineralization",
    icon_key: "hygiene",
    hero_image_url: "/Guur.jpg",
    description_mn:
      "Бүх шүдний пааланг бэхжүүлэх нөхөн эрдэсжүүлэх түрхлэг — цоорлоос сэргийлэх анхны хамгаалалт.",
    description_en:
      "Full-mouth remineralization gel — your first line of defense against cavities.",
    long_description_mn:
      "Шүдний паалангийн эрдэс задралыг сэргээж, цоорлоос сэргийлэх энэхүү эмчилгээ нь ялангуяа цайруулалт хийсэн, эмзэг паалантай, эсвэл цоорлын эхэн үетэй хүмүүст маш үр дүнтэй. Фтор, кальци, фосфаттай гель түрхэн, шүдний гадаргууг 5–10 минут шингээх явцад паалан хатуурдаг.\n\nЭмчилгээ хурдан, аюулгүй, өвдөлтгүй бөгөөд хүүхэд, насанд хүрэгчдэд адил тохирно. 4–6 сар тутамд давтан хийх нь үр дүнг хадгалахад чухал.",
    long_description_en:
      "This treatment reverses early mineral loss in enamel and strengthens it against future cavities. Especially effective after whitening, for sensitive enamel and for early-stage decay. A fluoride/calcium/phosphate gel is applied for 5–10 minutes and absorbed into the surface.\n\nFast, safe and painless. Suitable for kids and adults alike. Repeat every 4–6 months to keep the effect alive.",
    content_mn: {
      treatments: [
        "Шүдний цэвэрлэгээ",
        "Шүдний гадаргуу хатаах",
        "Эрдэсжүүлэх гель түрхэх",
        "Шингэх хугацаа (5–10 мин)",
        "Цаашдын арчилгааны заавар",
      ],
      benefits: [
        {
          title: "Цоорлоос сэргийлнэ",
          body: "Эхэн үеийн цоорлыг буцаах, цаашдын цоорлыг бууруулах хамгийн үр дүнтэй сэргийлэх арга.",
        },
        {
          title: "Эмзэглэлийг бууруулна",
          body: "Хүйтэн, халуун зүйлд эмзэг шүдийг тайвшруулна.",
        },
        {
          title: "Цайруулалтын дараах",
          body: "Цайруулалт хийсний дараа паалангаа хурдан сэргээж, өнгийг тогтворжуулдаг.",
        },
      ],
      faq: [
        {
          q: "Хэр давтан хийх вэ?",
          a: "Ердийн тохиолдолд 6 сар тутамд, цоорлын эрсдэл өндөртэй бол 4 сар тутамд.",
        },
        {
          q: "Хүүхдэд хийж болох уу?",
          a: "Тиймээ — 3 наснаас эхлэн хийх боломжтой ба хүүхдийн шүдийг бэхжүүлэхэд маш үр дүнтэй.",
        },
        {
          q: "Эмчилгээний дараа хооллох уу?",
          a: "Дараагийн 30 минутын дотор хооллож, амаа зайлахгүй байх нь үр дүнгийн ач холбогдолтой.",
        },
        {
          q: "Ломбо тавиулсан шүдэнд тохирох уу?",
          a: "Тиймээ — ломбоны эргэн тойронд хоёрдогч цоорол үүсэхээс сэргийлэхэд тус болно.",
        },
      ],
      timeline: [
        {
          title: "Цэвэрлэгээ",
          body: "Шүдний гадаргууг мэргэжлийн арга барилаар цэвэрлэж бэлдэнэ.",
        },
        {
          title: "Хатаах",
          body: "Шүдийг агаараар хатаан, гель шингэх хамгийн зохистой нөхцөл бүрдүүлнэ.",
        },
        {
          title: "Түрхэлт",
          body: "Эрдэс агуулсан гелийг бүх шүдэнд жигд түрхэнэ.",
        },
        {
          title: "Шингэх",
          body: "5–10 минут хүлээн, дараа нь хоол ундаагаа 30 минут хязгаарлана.",
        },
      ],
    },
    content_en: {
      treatments: [
        "Dental cleaning",
        "Surface drying",
        "Remineralization gel application",
        "Absorption time (5–10 min)",
        "Home care guidance",
      ],
      benefits: [
        {
          title: "Cavity prevention",
          body: "The most effective preventive step to reverse early decay and reduce new cavities.",
        },
        {
          title: "Less sensitivity",
          body: "Calms teeth that react to hot or cold.",
        },
        {
          title: "Great after whitening",
          body: "Helps re-mineralize enamel and stabilize your new shade.",
        },
      ],
      faq: [
        {
          q: "How often should I have it?",
          a: "Typically every 6 months; every 4 months if you have higher cavity risk.",
        },
        {
          q: "Is it safe for kids?",
          a: "Yes — from age 3 onwards. Very effective for strengthening young teeth.",
        },
        {
          q: "Can I eat after the appointment?",
          a: "Wait 30 minutes before eating or rinsing — that window is what makes the treatment work.",
        },
        {
          q: "Works on filled teeth?",
          a: "Yes — helps prevent secondary decay around existing fillings.",
        },
      ],
      timeline: [
        {
          title: "Cleaning",
          body: "Professional cleaning of all surfaces prepares the enamel.",
        },
        {
          title: "Drying",
          body: "Teeth are gently air-dried so the gel absorbs cleanly.",
        },
        {
          title: "Application",
          body: "The mineral-rich gel is applied evenly to all teeth.",
        },
        {
          title: "Absorption",
          body: "5–10 minutes of soak time, then a 30-minute food/drink pause.",
        },
      ],
    },
  },
  {
    slug: "pediatric-baby-filling",
    icon_key: "kid",
    hero_image_url: "/friendly-young-dentist-examining-happy-child-teeth-dental-clinic-dentistry-concept 1.jpg",
    description_mn:
      "Сүүн шүдний цоорлыг өвдөлтгүй, найдвартай эмчлэх — хүүхдэд ээлтэй технологиор.",
    description_en:
      "Pain-free, reliable cavity treatment for baby teeth — using kid-friendly technology.",
    long_description_mn:
      "Сүүн шүд хэдийгээр түр зуурын ч, эрүүл байх нь хүүхдийн зажилгаа, ярианы хөгжил, байнгын шүдний зөв ургалтанд маш чухал. Сүүн шүдний цоорлыг үл тоомсорловол өвчтөн их үрэвсэх, эрт авагдах эрсдэлтэй.\n\nБидний хүүхдийн эмч нар тав тухтай орчин, орчин үеийн өвдөлтгүй технологи (Saforide, Sealant, Glass ionomer) ашиглан хүүхдийг айлгахгүйгээр эмчилнэ. Эмчилгээний дараа хүүхдэд цайвар цвет, өнгөтэй ломбо сонгох эрх бүхий — энэ нь жинхэнэ хөгжилтэй тал болдог.",
    long_description_en:
      "Baby teeth are temporary, but their health is critical for chewing, speech development and proper eruption of permanent teeth. Ignored cavities lead to pain, infection and premature loss.\n\nOur pediatric dentists use kid-friendly, modern, low-pain technique (Saforide, sealants, glass ionomer) so kids don't get scared. They can even pick a colorful filling — which turns the visit into a treat.",
    content_mn: {
      treatments: [
        "Хүүхдийн дасан зохицох үе",
        "Цоорлыг цэвэрлэх (бяцхан рашаан + дрель)",
        "Хамгаалах паалан түрхэх",
        "Өнгөт ломбо тавих",
        "Гэрийн арчилгааны заавар",
      ],
      benefits: [
        {
          title: "Өвдөлтгүй",
          body: "Орчин үеийн мэдээ алдуулалт, эелдэг арга барилаар хүүхэд айгүйгээр эмчлэгдэнэ.",
        },
        {
          title: "Хөгжилтэй өнгөт ломбо",
          body: "Хүүхэд өөрийн дуртай өнгийг сонгож, эмчилгээний дараа хүүхэд эмч нараа дотносдог.",
        },
        {
          title: "Байнгын шүдийг хамгаална",
          body: "Сүүн шүдний цоорлыг эрт эмчлэх нь байнгын шүдний ургалтыг хамгаална.",
        },
      ],
      faq: [
        {
          q: "Сүүн шүдийг яагаад эмчлэх ёстой вэ? Хэдийгээр унах гэж байгаа шүд биш үү?",
          a: "Сүүн шүдний эрт авагдалт нь байнгын шүдний хазайлт, эрүүний хөгжлийн саатлыг үүсгэдэг. Бас хүүхдийн зажилгаа, ярианы хөгжилд чухал.",
        },
        {
          q: "Мэдээ алдуулалт хийх шаардлагатай юу?",
          a: "Гүн биш цоорол бол гель хангалттай. Гүн цоорлыг бяцхан тарилгаар хийнэ.",
        },
        {
          q: "Хүүхэд эмчид айлгаж байгаа — яах вэ?",
          a: "Эхлээд эмчилгээгүй ‘танилцах ирэлт' хийнэ. Хүүхдэд төхөөрөмжийг тоглож харуулна.",
        },
        {
          q: "Эмчилгээний дараа юу хийх вэ?",
          a: "30 минут хооллохгүй, дараа нь зөөлөн хооллож, өдөр бүр 2 удаа шүдээ цэвэрлэх.",
        },
      ],
      timeline: [
        {
          title: "Найзлах",
          body: "Эмч хүүхдийг тайвшруулж, аппаратыг тоглож үзүүлнэ.",
        },
        {
          title: "Цоорлыг цэвэрлэх",
          body: "Бяцхан рашаан + дрелээр өвдөлтгүйгээр цоорлыг цэвэрлэнэ.",
        },
        {
          title: "Өнгөт ломбо",
          body: "Хүүхэд өнгөө сонгож, ломбоо тавиад гэрэлээр хатаана.",
        },
        {
          title: "Шагнал",
          body: "Хүүхэд гарахдаа жижиг бэлэг авч, дараагийн үзлэгээр заявал ирэхдээ дуртай.",
        },
      ],
    },
    content_en: {
      treatments: [
        "Kid-friendly familiarization",
        "Cavity cleaning (gentle air-abrasion + drill)",
        "Protective liner application",
        "Colorful filling placement",
        "Home-care guidance",
      ],
      benefits: [
        {
          title: "Pain-free",
          body: "Modern numbing and gentle technique keep kids comfortable and unafraid.",
        },
        {
          title: "Fun colored fillings",
          body: "Kids pick their favorite color — which turns the visit into a treat.",
        },
        {
          title: "Protects permanent teeth",
          body: "Treating baby cavities early protects the proper eruption of permanent teeth.",
        },
      ],
      faq: [
        {
          q: "Why treat baby teeth — they fall out anyway?",
          a: "Early loss causes drift and bite issues for permanent teeth, plus chewing and speech development depend on healthy baby teeth.",
        },
        {
          q: "Is anesthesia always needed?",
          a: "For shallow cavities, gel is enough. Deeper ones may need a small injection.",
        },
        {
          q: "My child is afraid of dentists — what do we do?",
          a: "Start with a no-treatment 'meet & greet' visit. The dentist shows the tools playfully.",
        },
        {
          q: "What about aftercare?",
          a: "No food for 30 min, then soft meals; brush twice daily as usual.",
        },
      ],
      timeline: [
        {
          title: "Meet & greet",
          body: "Dentist relaxes the child and demonstrates the tools.",
        },
        {
          title: "Cavity cleaning",
          body: "Painless cleaning with gentle air-abrasion and drill where needed.",
        },
        {
          title: "Colored filling",
          body: "Child picks the color; filling is shaped and light-cured.",
        },
        {
          title: "Reward",
          body: "A small gift on the way out — so the child looks forward to the next visit.",
        },
      ],
    },
  },
  {
    slug: "adult-cavity-shallow",
    icon_key: "routine",
    hero_image_url: "/Shuudan.jpg",
    description_mn:
      "Өнгөц цоорлын эмчилгээ — нэг ирэлтэнд цоорсон гадаргууг сэргээх хурдан, найдвартай арга.",
    description_en:
      "Shallow cavity treatment — one-visit restoration that restores tooth and prevents deeper damage.",
    long_description_mn:
      "Өнгөц цоорол гэдэг нь шүдний паалан болон тугалмайн өнгөц давхрагт хүрсэн цоорол. Энэ үе шатанд эмчлэх нь хамгийн хямд, хамгийн хурдан, мэдрэлд хүрэхгүй учраас өвдөлтгүй.\n\nЭмчилгээний явц нь цоорсон хэсгийг цэвэрлэн, гэрлийн идэвхжүүлэгчтэй хатуурдаг хуванцар материалаар бөглөж, шүдний хэлбэрийг сэргээх явдал. Нэг ирэлт дотор хийгдэх ба тав тухтай байдалд хүрэх 30–45 минут болно.",
    long_description_en:
      "A shallow cavity has reached the enamel and outer dentin. Treating it at this stage is the fastest, cheapest option — and pain-free because it doesn't touch the nerve.\n\nWe clean the cavity, fill it with a light-cured composite that hardens instantly and shape it to match the original tooth. Done in one 30–45-minute visit.",
    content_mn: {
      treatments: [
        "Цоорлын гүнийг оношлох",
        "Орон нутгийн мэдээ алдуулалт (шаардлагатай үед)",
        "Цоорсон хэсгийг цэвэрлэх",
        "Композит ломбо тавих",
        "Хазалтад тааруулах",
      ],
      benefits: [
        {
          title: "Хямд, хурдан",
          body: "Гүн цоорол болохоос өмнө эмчилэх нь сувгийн эмчилгээ, бүрээс зэрэг үнэтэй процедурыг үгүй болгоно.",
        },
        {
          title: "Байгалийн харагдац",
          body: "Композит материал нь шүдний өнгөтэй яг адил тул нүдээр бараг харагдахгүй.",
        },
        {
          title: "Шууд хооллох боломжтой",
          body: "Эмчилгээний дараа 1–2 цагийн дотор хэвийн хооллож болно — гэрлийн идэвхжүүлэлт шууд хатуурна.",
        },
      ],
      faq: [
        {
          q: "Эмчилгээ өвдөх үү?",
          a: "Үгүй. Өнгөц цоорол мэдрэлээс хол байдаг учраас ихэвчлэн мэдээ алдуулалт ч шаардлагагүй.",
        },
        {
          q: "Хичнээн удаан үйлчилэх вэ?",
          a: "Чанартай композит ломбо 7–10 жил үйлчилэх ба зөв арчилгаатай бол удаан.",
        },
        {
          q: "Эмчилгээний дараа эмзэглэх үү?",
          a: "Зарим тохиолдолд 1–2 хоног халуун/хүйтэнд бага зэрэг мэдрэх ч өөрөө намжина.",
        },
        {
          q: "Ломбо хэзээ солих хэрэгтэй вэ?",
          a: "Үнсэрсэн, унасан, эсвэл хажуу хооронд цоорсон үед эмч таны 6 сар тутмын үзлэг дээр шалгана.",
        },
      ],
      timeline: [
        {
          title: "Оношилгоо",
          body: "Үзлэг, шаардлагатай бол рентген зургаар цоорлын яг гүнийг тогтооно.",
        },
        {
          title: "Цэвэрлэгээ",
          body: "Цоорсон хэсгийг устгаж, эрүүл шүдний эдийг үлдээнэ.",
        },
        {
          title: "Ломбо тавих",
          body: "Композит давхаргаар бөглөн, гэрлээр идэвхжүүлж хатуурна.",
        },
        {
          title: "Тааруулга",
          body: "Хазалтыг шалгаж, тав тухтай гадаргуу үлдтэл өнгөлгөө хийнэ.",
        },
      ],
    },
    content_en: {
      treatments: [
        "Cavity depth diagnosis",
        "Local anesthesia (if needed)",
        "Decay removal",
        "Composite filling placement",
        "Bite adjustment",
      ],
      benefits: [
        {
          title: "Fast & affordable",
          body: "Treating early avoids expensive root canals and crowns later.",
        },
        {
          title: "Natural look",
          body: "Composite matches your tooth color — practically invisible.",
        },
        {
          title: "Eat the same day",
          body: "Light-cured filling hardens instantly; you can eat within 1–2 hours.",
        },
      ],
      faq: [
        {
          q: "Will it hurt?",
          a: "No — shallow cavities sit above the nerve so anesthesia is rarely required.",
        },
        {
          q: "How long does it last?",
          a: "Quality composite fillings serve 7–10 years and often longer with good care.",
        },
        {
          q: "Will my tooth be sensitive after?",
          a: "Mild hot/cold sensitivity for 1–2 days is possible and resolves on its own.",
        },
        {
          q: "When does a filling need replacing?",
          a: "If it chips, falls out, or decay starts at the margin — we check this at every 6-month exam.",
        },
      ],
      timeline: [
        {
          title: "Diagnosis",
          body: "Visual exam (and X-ray if needed) pinpoints the cavity depth.",
        },
        {
          title: "Cleaning",
          body: "Decay is removed while preserving as much healthy structure as possible.",
        },
        {
          title: "Filling placement",
          body: "Composite is placed in layers and light-cured to hardness.",
        },
        {
          title: "Adjustment",
          body: "Bite is checked and the surface polished for comfort.",
        },
      ],
    },
  },
  {
    slug: "braces-metal",
    icon_key: "braces",
    hero_image_url: "/ooroo tugjeetei metal.jpg",
    description_mn:
      "Сонгодог металл аппарат — хамгийн бат бөх, найдвартай, үр дүн нь батлагдсан гажиг заслын сонголт.",
    description_en:
      "Classic metal braces — the strongest, most predictable and most affordable orthodontic option.",
    long_description_mn:
      "Металл аппарат нь олон арван жилийн туршид сайжруулагдсан, хамгийн өргөн хэрэглэгддэг гажиг заслын систем. Нарийн нийлмэл хазалтын асуудлуудыг ч найдвартай засаж чадна. Орчин үеийн брэкет нь өмнөхөөсөө илүү бага, хөнгөн, тав тухтай.\n\nЭмчилгээний хугацаа дунджаар 18–24 сар. Сар бүр тохируулга хийнэ. Бид цвет нь өөрчилдөг резинтэй сонголт санал болгох тул хүүхдүүд өөрийн дуртай өнгөө сонгон зүүж болдог. Эцэст нь та оношилгооноос дараахан хүлээж буй инээмсэглэлийн 3D загварыг үзэх боломжтой.",
    long_description_en:
      "Metal braces have been refined over decades and remain the most widely used orthodontic system. They handle complex bite problems reliably — and modern brackets are smaller, lighter and more comfortable than ever.\n\nTreatment averages 18–24 months with monthly adjustments. Color-changing elastic ties let kids pick a favorite color each visit. You'll see a 3D preview of your finished smile right after diagnosis.",
    content_mn: {
      treatments: [
        "Дижитал оношилгоо",
        "Брэкет суулгах",
        "Сар тутмын тохируулга",
        "Зайн боолтын тохиргоо",
        "Аппарат авах + тогтворжуулагч",
      ],
      benefits: [
        {
          title: "Үр дүнтэй",
          body: "Аливаа төрлийн нийлмэл хазалтын асуудлыг ч найдвартай засаж чадна.",
        },
        {
          title: "Хямд үнэ",
          body: "Бусад орчин үеийн системээс хамгийн хямд үнэтэй нь — гэхдээ үр дүн нь чанартай.",
        },
        {
          title: "Хүүхдэд таалагдана",
          body: "Сар бүр өнгөтэй резин солих боломжтой — энэ нь хүүхдүүдийн хувьд таашаал болдог.",
        },
      ],
      faq: [
        {
          q: "Хэдэн настай байхад тохирох вэ?",
          a: "Ердийн тохиолдолд 11–14 нас. Гэхдээ насанд хүрэгчдэд ч адил үр дүнтэй.",
        },
        {
          q: "Өвдөх үү?",
          a: "Эхний 3–5 хоног даралт мэдэгдэх ч 1 долоо хоногийн дотор хэвийн болно. Сар бүрийн тохируулгын дараа 1–2 хоног эмзэглэл.",
        },
        {
          q: "Юу идэхээс зайлсхийх вэ?",
          a: "Хатуу (мөс, шигшсэн будаа), наалддаг (резин, караамель), өнгөтэй (соронгууль, кофе), карбонотой ундаа.",
        },
        {
          q: "Хэр удаан зүүх вэ?",
          a: "Ердийн тохиолдолд 18–24 сар. Энгийн тохиолдолд 12 сар, нийлмэл бол 30 сар хүрч магадгүй.",
        },
      ],
      timeline: [
        {
          title: "Оношилгоо",
          body: "Бүх амны зураг, дижитал хэвлэл, нүүрний бүтэц, эрүүний харьцааг үнэлнэ.",
        },
        {
          title: "Суулгах",
          body: "Шүдэн дээр брэкет наан, утсаар холбоно. 60–90 минут.",
        },
        {
          title: "Сар тутмын тохируулга",
          body: "Утас, резинийг шинэчлэн шүдийг зөв тийш нь шилжүүлнэ.",
        },
        {
          title: "Аппарат авах",
          body: "Эцсийн үр дүн авсны дараа тогтворжуулагч (ретэйнер) зүүнэ.",
        },
      ],
      pricing: [
        { label: "Металл аппарат (2 эрүү)", price: "1,440,000₮" },
        { label: "Шаазан аппарат", price: "1,800,000₮", note: "Илүү нарийн харагдац" },
        { label: "Сафир аппарат", price: "1,980,000₮", note: "Бараг үл үзэгдэх" },
        { label: "Өөрөө түгжээтэй металл", price: "2,000,000₮" },
        { label: "Өөрөө түгжээтэй шаазан", price: "2,200,000₮" },
      ],
    },
    content_en: {
      treatments: [
        "Digital diagnosis",
        "Bracket placement",
        "Monthly adjustments",
        "Elastic wear schedule",
        "Removal + retainer",
      ],
      benefits: [
        {
          title: "Effective",
          body: "Reliably corrects even the most complex bite issues.",
        },
        {
          title: "Most affordable",
          body: "The lowest-cost modern orthodontic system — without compromising results.",
        },
        {
          title: "Kid-friendly",
          body: "Monthly color changes for elastic ties — a small joy that keeps motivation high.",
        },
      ],
      faq: [
        {
          q: "What age is best?",
          a: "Typically 11–14, but braces are just as effective for adults.",
        },
        {
          q: "Will it hurt?",
          a: "Pressure for the first 3–5 days, then normal. Mild soreness for 1–2 days after each monthly adjustment.",
        },
        {
          q: "What can't I eat?",
          a: "Hard (ice, popcorn kernels), sticky (caramel, gum), staining (curry, coffee), and carbonated drinks.",
        },
        {
          q: "How long is treatment?",
          a: "Usually 18–24 months. Simple cases finish in 12, complex ones can extend to 30.",
        },
      ],
      timeline: [
        {
          title: "Diagnosis",
          body: "Full-mouth imaging, digital scan and facial assessment.",
        },
        {
          title: "Placement",
          body: "Brackets are bonded to teeth and the archwire is fitted. 60–90 minutes.",
        },
        {
          title: "Monthly adjustments",
          body: "Wire and elastic changes shift teeth into the planned position.",
        },
        {
          title: "Removal",
          body: "Once the result is reached, brackets come off and a retainer is fitted.",
        },
      ],
      pricing: [
        { label: "Metal braces (both arches)", price: "₮1,440,000" },
        { label: "Ceramic braces", price: "₮1,800,000", note: "More discreet look" },
        { label: "Sapphire braces", price: "₮1,980,000", note: "Nearly invisible" },
        { label: "Self-ligating metal", price: "₮2,000,000" },
        { label: "Self-ligating ceramic", price: "₮2,200,000" },
      ],
    },
  },
];

// ---------- Main ----------

async function main() {
  console.log(`Seeding detail content for ${ENTRIES.length} first-child services...\n`);
  let ok = 0;
  let fail = 0;
  for (const entry of ENTRIES) {
    const { slug, ...patch } = entry;
    const { data, error } = await supabase
      .from("services")
      .update(patch)
      .eq("slug", slug)
      .select("id, name_mn");
    if (error) {
      console.error(`  ✗ ${slug}: ${error.message}`);
      fail++;
    } else if (!data || data.length === 0) {
      console.warn(`  ⚠ ${slug}: no row found — run migration 20 first`);
      fail++;
    } else {
      console.log(`  ✓ ${slug} — ${data[0].name_mn}`);
      ok++;
    }
  }
  console.log(`\nDone. ${ok} updated, ${fail} failed.`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
