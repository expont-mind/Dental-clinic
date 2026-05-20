import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n/dictionaries";

type DiagType = {
  number: string;
  title: string;
  subtitle: string;
  body: string;
  bullets: string[];
  image: string;
};

const TYPES: DiagType[] = [
  {
    number: "01",
    title: "Дижитал рентген зураг",
    subtitle: "X-ray",
    body: "Үүнд дэлгэмэл рентген, гавлын хажуугийн рентген, нэмэлтээр Шүдний компьютер томограф (CBCT) орно. Уламжлалт рентгэнтэй харьцуулахад хурдан, өндөр давтамжтай бөгөөд бага туяа ашигладаг.",
    bullets: [
      "Уламжлалт рентгэнгээс хурдан, бага туяатай",
      "Шүдний гажиг, ясны бүтцийг тодорхой харна",
      "Үр дүн нь шууд дэлгэц дээр гарна",
    ],
    image: "/x-ray.jpg",
  },
  {
    number: "02",
    title: "Дижитал скайн",
    subtitle: "Intraoral Scanner",
    body: "Oral scanner нь шүдний гадаргууг нарийвчлалтай хэмжих төхөөрөмж. Амны хөндий дотроос шүдний 3D зургийг хор хөнөөлгүйгээр авч, гажиг согогийг илрүүлэхэд тусална.",
    bullets: [
      "Хор хөнөөлгүй, амар хийгддэг",
      "Шүдний бодит 3D хэмжилт",
      "Гажиг, согогийг шууд илрүүлнэ",
    ],
    image: "/intraoral scanner.webp",
  },
  {
    number: "03",
    title: "Дижитал камера",
    subtitle: "Digital Camera",
    body: "Дижитал камера ашиглан өвчтөний нүүрний төрх болон амны хөндийн бодит зургийг авдаг. Эмч, өвчтөний харилцан ойлголтыг сайжруулж, эмчилгээний төлөвлөгөөг зөв тодорхойлоход тусална.",
    bullets: [
      "Нүүр амны өндөр чанартай зураг",
      "Эмч–өвчтөний ойлголтыг сайжруулна",
      "Эмчилгээний өмнө/дараа харьцуулна",
    ],
    image: "/friendly-young-dentist-examining-happy-child-teeth-dental-clinic-dentistry-concept 1.jpg",
  },
  {
    number: "04",
    title: "3D эмчилгээний загвар",
    subtitle: "3D Treatment Model",
    body: "3D шүдний загвар нь шүдний бүтэц, байршлыг илүү нарийвчлалтай үзүүлэх боломжийг олгоно. Орчин үеийн ортодонт (шүдний гажиг засах) эмчилгээнд маш чухал.",
    bullets: [
      "Шүдний бүтцийг 3 хэмжээст харна",
      "Ортодонт эмчилгээний баримтжуулалт",
      "Эмчилгээний явцыг загвар дээр харна",
    ],
    image: "/CBCT.webp",
  },
  {
    number: "05",
    title: "Шүдний компьютер томограф",
    subtitle: "CBCT (Cone Beam CT)",
    body: "CT (компьютер томографийн) 3D аппарат бөгөөд шүдний болон ясны бүтцийг нарийвчлан шинжлэх боломжтой. CBCT нь шүдний гажиг засал, имплант, сувгийн эмчилгээ, мэс заслын эмчилгээ мөн амны хөндийн бүх эдийг нарийн харах боломжийг олгоно.",
    bullets: [
      "Имплант хийхэд оновчтой байрлал тогтооно",
      "Сувгийн эмчилгээний нарийн оношлогоо",
      "Мэс заслын төлөвлөгөөнд зайлшгүй",
    ],
    image: "/3d-tomoqrafiya.jpeg",
  },
];

const ADVANTAGES = [
  {
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    title: "Хурдан, эрсдэл бага",
    body: "Уламжлалт аргаас илүү хурдан, эрсдэл багатай ажилладаг.",
  },
  {
    icon: "M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
    title: "Эрт илрүүлэлт",
    body: "Шүдний өвчин, асуудлыг эрт үед илрүүлж, нарийвчилсан оношлогоо өгнө.",
  },
  {
    icon: "M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
    title: "Тав тухтай",
    body: "Дижитал рентгэн болон бусад төхөөрөмжүүд өвчтөнд таатай, амархан, хурдан.",
  },
  {
    icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    title: "Тодорхой харилцаа",
    body: "Эмч–өвчтөний харилцан ойлголтыг сайжруулж, эмчилгээний төлөвлөгөө ойлгомжтой болно.",
  },
];

const USE_CASES = [
  {
    icon: "M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0zM12 6v6l4 2",
    title: "Гажиг илрүүлэх",
    body: "Шүд, эрүү, нүүрний гажгийг илрүүлж эмчилгээ хийх.",
  },
  {
    icon: "M12 22s-8-4.5-8-12a8 8 0 0 1 16 0c0 7.5-8 12-8 12z",
    title: "Сувгийн эмчилгээ",
    body: "Root canal болон ясны бүтцийн асуудлуудыг тодорхойлох.",
  },
  {
    icon: "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
    title: "Имплант байрлал",
    body: "Шүдний имплант хийхэд хамгийн тохиромжтой байрлалыг тогтооно.",
  },
  {
    icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
    title: "Эмчилгээний төлөвлөгөө",
    body: "Бүх дижитал оношлогооны үр дүнг нэгтгэн, тохирсон эмчилгээний төлөвлөгөө гаргана.",
  },
];

type Appliance = {
  title: string;
  tag?: string;
  body: string;
  image?: string;
  imagePos?: string;
};

const ORTHO_REMOVABLE: Appliance[] = [
  {
    title: "Тэлэгч аппарат",
    tag: "9–12 нас",
    body: "Холимог зуултын сүүл үед зүүдэг. Хоншоор эрүүний шүдний эгнээ хавчиг, бөөгнөрсөн тохиолдолд эгнээг тэлэх зорилгоор хэрэглэнэ.",
    image: "/telegch.jpg",
  },
  {
    title: "Фэйс маск аппарат",
    tag: "Шами зуулт",
    body: "9–12 насны хүүхдэд, шами зуултын үед зүүдэг. Хоншоорын үүдэн шүдийг эрүүний үүдэн шүдээс давуулах зорилготой.",
    image: "/Фэйс маск аппарат.jpg",
    imagePos: "object-bottom",
  },
];

const ORTHO_FIXED: Appliance[] = [
  {
    title: "Металл аппарат",
    tag: "Сонгодог",
    body: "Бүх төрлийн гажиг засалд хэрэглэдэг. Металл хайлшаар хийгдсэн тул харшил өгдөггүй, найдвартай, хямд.",
    image: "/metall.jpg",
  },
  {
    title: "Шаазан аппарат",
    tag: "Цагаан",
    body: "Үйлчилгээний хувьд металлтай адил боловч цагаан өнгөтэй учир харагдац илүү гоё.",
    image: "/shaazan.jpg",
  },
  {
    title: "Сафир аппарат",
    tag: "Тунгалаг",
    body: "Шилэн тунгалаг өнгөтэй учир гаднаас бараг мэдэгдэхгүй. Гоо зүйн хувьд хамгийн нүдэнд үл мэдэгдэх сонголт.",
    image: "/sapir.jpg",
  },
  {
    title: "Өөрөө түгжигч металл",
    tag: "Шинэ",
    body: "Резин хэрэглэх шаардлагагүй, өөр дээрээ түгжигчтэй. Зөөлөн хүчээр үйлчилдэг тул өвдөлт, шүдний сурвалжийн шимэгдэлт бага.",
    image: "/ooroo tugjeetei metal.jpg",
  },
  {
    title: "Өөрөө түгжигч шаазан",
    tag: "Шинэ",
    body: "Өөрөө түгжигчийн давуу талыг шаазан аппаратын цагаан өнгөтэй хослуулсан — үр дүнтэй бөгөөд гоё харагддаг.",
    image: "/ooroo tugjeetei shaazan.jpg",
  },
  {
    title: "Digital Aligner",
    tag: "Premium",
    body: "Өнгөгүй тунгалаг — зүүсэн нь мэдэгдэхгүй. Авч цэвэрлэх боломжтой, эмнэлэгт ирэх давтамж бага. Эмчилгээний үр дүн хурдан, гадаадад амьдардаг хүмүүст тохиромжтой.",
    image: "/elainer.jpg",
  },
];

export default async function DigitalDiagnosticsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <div className="bg-bg">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-primary-soft">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-accent/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-primary/30 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
            <div>
              <h1 className="font-display text-[28px] font-extrabold uppercase leading-[1.05] tracking-tight text-ink sm:text-[38px] lg:text-[44px]">
                Шүдний дижитал{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-primary">оношлогоо</span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-1.5 z-0 h-2.5 bg-accent/60"
                  />
                </span>{" "}
                гэж юу вэ?
              </h1>
              <p className="mt-6 max-w-xl text-[15px] leading-7 text-muted">
                Урьдчилан оношлох, эмчлэх зорилгоор дижитал технологи ашиглах
                процесс. Уламжлалт аргуудаас илүү нарийвчилсан, түргэн бөгөөд
                өвчтөнд таатай — шүдний эмчилгээг шинэ түвшинд аваачдаг.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={`/${lang}/book`}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[14px] font-bold text-white hover:bg-primary-hover transition-colors"
                >
                  Цаг захиалах
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>

            {/* Hero image */}
            <div className="relative pb-6">
              <span
                aria-hidden
                className="absolute -bottom-2 -left-2 h-28 w-36 rounded-[24px] bg-primary/40 sm:-bottom-3 sm:-left-3 sm:h-36 sm:w-48"
              />
              <span
                aria-hidden
                className="absolute -bottom-2 -left-2 h-28 w-36 rounded-[24px] ring-2 ring-primary sm:-bottom-3 sm:-left-3 sm:h-36 sm:w-48"
              />
              <span
                aria-hidden
                className="absolute -right-2 -top-2 hidden h-16 w-16 rounded-full bg-accent/70 sm:block"
              />
              <div className="relative ml-2 aspect-[4/5] w-[68%] overflow-hidden rounded-[24px] shadow-xl sm:ml-4 sm:w-[60%]">
                <Image
                  src="/f6571bb5c27df22db7ff7b5a39eb90a4.jpg"
                  alt="Шүдний дижитал оношлогоо"
                  fill
                  priority
                  sizes="(max-width: 1024px) 60vw, 340px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ DIAGNOSTIC TYPES ============ */}
      <section id="types" className="border-t border-line bg-bg">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <div className="max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
              ◦ Үндсэн төрөл
            </p>
            <h2 className="font-display mt-2 text-[22px] font-extrabold leading-[1.1] tracking-tight text-ink sm:text-[28px]">
              Шүдний дижитал оношлогооны үндсэн төрөл
            </h2>
            <p className="mt-3 text-[13px] leading-6 text-muted">
              Тус бүр өөрийн зориулалттай, эмчилгээний хэлбэрт тохирсон дижитал
              оношлогооны 5 төрөл.
            </p>
          </div>

          {/* Alternating layout */}
          <div className="mt-8 space-y-10">
            {TYPES.map((t, idx) => {
              const reverse = idx % 2 === 1;
              return (
                <article
                  key={t.title}
                  className="grid items-center gap-6 lg:grid-cols-2 lg:gap-10"
                >
                  {/* Image */}
                  <div
                    className={
                      "relative " + (reverse ? "lg:order-2" : "lg:order-1")
                    }
                  >
                    <span
                      aria-hidden
                      className={
                        "absolute h-20 w-28 rounded-[18px] bg-primary/30 sm:h-24 sm:w-36 " +
                        (reverse ? "-right-2 -bottom-2" : "-left-2 -bottom-2")
                      }
                    />
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] shadow-md ring-1 ring-line">
                      <Image
                        src={t.image}
                        alt={t.title}
                        fill
                        sizes="(max-width: 1024px) 90vw, 420px"
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Copy */}
                  <div className={reverse ? "lg:order-1" : "lg:order-2"}>
                    <div className="flex items-center gap-2.5">
                      <span className="font-display grid h-9 w-9 place-items-center rounded-xl bg-primary text-[12px] font-extrabold text-white">
                        {t.number}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-2">
                        {t.subtitle}
                      </span>
                    </div>
                    <h3 className="font-display mt-2.5 text-[20px] font-extrabold leading-tight tracking-tight text-ink sm:text-[24px]">
                      {t.title}
                    </h3>
                    <p className="mt-2.5 text-[13px] leading-6 text-muted">
                      {t.body}
                    </p>
                    <ul className="mt-4 space-y-1.5">
                      {t.bullets.map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-2.5 text-[12.5px] leading-6 text-ink-2"
                        >
                          <span className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary text-white">
                            <svg
                              width="8"
                              height="8"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5 12l5 5L20 7" />
                            </svg>
                          </span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ ADVANTAGES ============ */}
      <section className="border-t border-line bg-primary text-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
              ◦ Давуу тал
            </p>
            <h2 className="font-display mt-2 text-[24px] font-extrabold leading-tight tracking-tight sm:text-[32px]">
              Дижитал оношлогооны давуу талууд
            </h2>
            <p className="mx-auto mt-3 text-[14px] leading-6 text-white/80 sm:whitespace-nowrap">
              Шүдний эмчилгээний дэвшилтэт арга — эмч, өвчтөн хоёуланд нь хамгийн сайн шийдвэр гаргахад тусална.
            </p>
          </div>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ADVANTAGES.map((a) => (
              <li
                key={a.title}
                className="rounded-[18px] bg-white/10 p-4 backdrop-blur ring-1 ring-white/15"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-primary">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={a.icon} />
                  </svg>
                </span>
                <h3 className="font-display mt-3 text-[14px] font-extrabold leading-snug">
                  {a.title}
                </h3>
                <p className="mt-1.5 text-[12px] leading-6 text-white/80">
                  {a.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ USE CASES ============ */}
      <section className="border-t border-line bg-bg">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
            {/* Photo */}
            <div className="relative">
              <span
                aria-hidden
                className="absolute -bottom-2 -right-2 h-24 w-32 rounded-[18px] bg-accent/40 sm:h-28 sm:w-40"
              />
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] shadow-md">
                <Image
                  src="/zuragg.webp"
                  alt="Дижитал оношлогооны хэрэглээ"
                  fill
                  sizes="(max-width: 1024px) 80vw, 360px"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Copy + list */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                ◦ Хэрэглээ
              </p>
              <h2 className="font-display mt-2 text-[22px] font-extrabold leading-[1.1] tracking-tight text-ink sm:text-[28px]">
                Ямар тохиолдолд хэрэглэх вэ?
              </h2>
              <p className="mt-3 text-[13px] leading-6 text-muted">
                Дижитал оношлогоо нь шүдний эмчилгээний бараг бүх үе шатанд
                ашиглагдана.
              </p>

              <ul className="mt-5 space-y-2.5">
                {USE_CASES.map((u, i) => (
                  <li
                    key={u.title}
                    className="flex items-start gap-3 rounded-[16px] bg-white p-3.5 ring-1 ring-line shadow-[0_4px_14px_-12px_rgba(15,23,42,0.18)] transition-colors hover:ring-primary/40"
                  >
                    <span className="font-display grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                      <span className="text-[12px] font-extrabold">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-display text-[14px] font-extrabold text-ink">
                        {u.title}
                      </h3>
                      <p className="mt-0.5 text-[12.5px] leading-6 text-muted">
                        {u.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ORTHO APPLIANCES ============ */}
      <section className="border-t border-line bg-primary-soft/30">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <div className="max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
              ◦ Гажиг засал
            </p>
            <h2 className="font-display mt-2 text-[22px] font-extrabold leading-[1.1] tracking-tight text-ink sm:text-[28px]">
              Шүдний гажиг заслын аппарат
            </h2>
            <p className="mt-3 text-[13px] leading-6 text-muted">
              Гажиг заслын аппарат нь{" "}
              <span className="font-semibold text-ink-2">авагддаг</span> ба{" "}
              <span className="font-semibold text-ink-2">авагддаггүй</span> гэсэн
              2 үндсэн төрөлтэй.
            </p>
          </div>

          {/* Removable */}
          <div className="mt-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h3 className="font-display text-[18px] font-extrabold tracking-tight text-ink sm:text-[20px]">
                Авагддаг аппарат
              </h3>
              <p className="text-[12px] text-muted">
                Хүүхэд насанд зүүж, эмч заасан үед авч болно.
              </p>
            </div>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {ORTHO_REMOVABLE.map((a) => (
                <li
                  key={a.title}
                  className="group overflow-hidden rounded-[16px] bg-white ring-1 ring-line shadow-[0_4px_14px_-12px_rgba(15,23,42,0.18)] transition-all hover:-translate-y-0.5 hover:ring-primary/40"
                >
                  {a.image && (
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-primary-soft">
                      <Image
                        src={a.image}
                        alt={a.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 40vw"
                        className={`object-cover transition-transform duration-500 group-hover:scale-[1.04] ${a.imagePos ?? ""}`}
                      />
                      {a.tag && (
                        <span className="absolute right-2 top-2 inline-flex items-center rounded-full bg-white/95 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur">
                          {a.tag}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="font-display text-[14px] font-extrabold text-ink">
                      {a.title}
                    </h4>
                    <p className="mt-1 text-[12.5px] leading-6 text-muted">
                      {a.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Fixed */}
          <div className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h3 className="font-display text-[18px] font-extrabold tracking-tight text-ink sm:text-[20px]">
                Авагддаггүй аппарат
              </h3>
              <p className="text-[12px] text-muted">
                Шүдэн дээр наадаг, байнгын шүднүүд бүрэн ургасны дараа.
              </p>
            </div>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ORTHO_FIXED.map((a) => (
                <li
                  key={a.title}
                  className="group overflow-hidden rounded-[16px] bg-white ring-1 ring-line shadow-[0_4px_14px_-12px_rgba(15,23,42,0.18)] transition-all hover:-translate-y-0.5 hover:ring-primary/40"
                >
                  {a.image && (
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-primary-soft">
                      <Image
                        src={a.image}
                        alt={a.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 28vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                      {a.tag && (
                        <span className="absolute right-2 top-2 inline-flex items-center rounded-full bg-white/95 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur">
                          {a.tag}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="font-display text-[14px] font-extrabold text-ink">
                      {a.title}
                    </h4>
                    <p className="mt-1 text-[12px] leading-6 text-muted">
                      {a.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="bg-bg">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <div className="relative overflow-hidden rounded-[24px] bg-primary px-6 py-8 text-center text-white shadow-[0_18px_44px_-26px_rgba(26,132,120,0.5)] sm:px-10 sm:py-12">
            <span
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-accent/30 blur-3xl"
            />
            <p className="relative text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
              ◦ Цаг захиалах
            </p>
            <h2 className="font-display relative mt-2 text-[20px] font-extrabold leading-tight sm:text-[28px]">
              Дижитал оношлогооны цагаа авцгаая
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-[13px] leading-6 text-white/85">
              Эмчтэй уулзан тантай тохирох эмчилгээний төлөвлөгөөг гаргуулна уу.
            </p>
            <div className="relative mt-5 flex flex-wrap justify-center gap-2.5">
              <Link
                href={`/${lang}/book`}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-[13px] font-bold text-primary hover:bg-white/90 transition-colors"
              >
                Цаг захиалах
                <span aria-hidden>→</span>
              </Link>
              <Link
                href={`/${lang}/contact`}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-5 py-2.5 text-[13px] font-bold text-white hover:bg-white/10 transition-colors"
              >
                Холбоо барих
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
