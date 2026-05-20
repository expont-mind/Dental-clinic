import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const HIGHLIGHTS = [
  { value: "100%", label: "Нарийвчилсан" },
  { value: "3x", label: "Илүү хурдан" },
  { value: "↓ 70%", label: "Туяаны хэмжээ" },
];

export function DigitalDiagnostics({
  lang,
}: {
  lang: string;
  dict: Dictionary;
}) {
  return (
    <section className="relative overflow-hidden border-t border-line bg-bg">
      {/* Background blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-40 h-96 w-96 rounded-full bg-accent/25 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14 lg:py-20">
        {/* Intro — split layout: text left, photo right */}
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          {/* Copy */}
          <div className="order-2 lg:order-1">
            <h2 className="font-display text-[22px] font-extrabold leading-[1.15] tracking-tight text-ink sm:text-[28px] lg:text-[36px]">
              Шүдний дижитал{" "}
              <span className="text-primary">оношлогоо</span> гэж юу вэ?
            </h2>
            <p className="mt-4 text-[13.5px] leading-7 text-muted sm:mt-5 sm:text-[14.5px] lg:text-[15px]">
              Урьдчилан оношлох, эмчлэх зорилгоор{" "}
              <span className="font-semibold text-ink-2">
                дижитал технологи ашиглах процесс
              </span>{" "}
              юм. Уламжлалт аргуудаас илүү нарийвчилсан, түргэн бөгөөд өвчтөнд
              таатай — шүдний эмчилгээг шинэ түвшинд аваачдаг.
            </p>

            {/* Highlight chips */}
            <ul className="mt-5 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-3">
              {HIGHLIGHTS.map((h) => (
                <li
                  key={h.label}
                  className="rounded-2xl bg-white px-3 py-2.5 ring-1 ring-line shadow-[0_5px_15px_-12px_rgba(15,23,42,0.18)] sm:px-4 sm:py-3"
                >
                  <p className="font-display text-[16px] font-extrabold leading-none text-primary sm:text-[20px]">
                    {h.value}
                  </p>
                  <p className="mt-1 text-[9.5px] font-semibold uppercase tracking-wider text-muted-2 sm:text-[10.5px]">
                    {h.label}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-2.5 sm:mt-7 sm:gap-3">
              <Link
                href={`/${lang}/digital-diagnostics`}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[13px] font-bold text-white hover:bg-primary-hover transition-colors sm:px-6 sm:py-3 sm:text-[13.5px]"
              >
                Дэлгэрэнгүй унших
                <span aria-hidden>→</span>
              </Link>
              <Link
                href={`/${lang}/book`}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-[13px] font-bold text-ink hover:border-primary/40 transition-colors sm:px-6 sm:py-3 sm:text-[13.5px]"
              >
                Цаг захиалах
              </Link>
            </div>
          </div>

          {/* Photo with mint frame + floating accents */}
          <div className="relative order-1 mx-auto w-full max-w-[360px] pb-6 lg:order-2 lg:max-w-none">
            <span
              aria-hidden
              className="absolute -bottom-2 -left-2 h-24 w-32 rounded-[20px] bg-primary/40 sm:-bottom-3 sm:-left-3 sm:h-32 sm:w-44 lg:h-40 lg:w-52 lg:rounded-[24px]"
            />
            <span
              aria-hidden
              className="absolute -bottom-2 -left-2 h-24 w-32 rounded-[20px] ring-2 ring-primary sm:-bottom-3 sm:-left-3 sm:h-32 sm:w-44 lg:h-40 lg:w-52 lg:rounded-[24px]"
            />
            <span
              aria-hidden
              className="absolute -right-2 -top-2 hidden h-12 w-12 rounded-full bg-accent/80 sm:block sm:h-16 sm:w-16"
            />

            <div className="relative ml-2 aspect-[4/5] w-[68%] overflow-hidden rounded-[20px] shadow-xl sm:ml-3 sm:w-[72%] sm:rounded-[24px] lg:ml-4 lg:w-[68%]">
              <Image
                src="/f6571bb5c27df22db7ff7b5a39eb90a4.jpg"
                alt="Шүдний дижитал оношлогоо"
                fill
                sizes="(max-width: 640px) 68vw, (max-width: 1024px) 280px, 360px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
